import { Elysia, t } from "elysia";
import { and, eq, count } from "drizzle-orm";
import { db } from "../../db";
import { attempts, wordErrors } from "../../db/schema/attempt-schema";
import { uploadStudentRecording } from "../../lib/supabase-storage";
import { transcribeFullAudio } from "../../lib/typhoon-asr";
import { alignPassageWithTranscript } from "../../lib/word-alignment";
import { evaluateAttempt } from "../../lib/scoring";
import { authMiddleware } from "../../middleware/auth.middleware";
import { assignments } from "../../db/schema/assignment-schema";
import { classroomStudents } from "../../db/schema/classroom-schema";

export const attemptRoutes = new Elysia({ prefix: "/attempts" })
    .use(authMiddleware)
    // POST /student/attempts/:assignmentId/submit
    .post(
        "/:assignmentId/submit",
        async ({ session, params, body, set }) => {
            // 1) เช็คสิทธิ์: นักเรียนต้องอยู่ในห้องที่โจทย์นี้ถูกมอบหมาย
            const [assignment] = await db
                .select()
                .from(assignments)
                .where(eq(assignments.id, params.assignmentId))
                .limit(1);

            if (!assignment) {
                set.status = 404;
                return { error: "Assignment not found" };
            }

            const [membership] = await db
                .select()
                .from(classroomStudents)
                .where(
                    and(
                        eq(classroomStudents.classroomId, assignment.classroomId),
                        eq(classroomStudents.studentId, session!.user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์ส่งงานนี้" };
            }

            // 2) หา attempt_no ถัดไป (รองรับอ่านซ้ำ)
            const [{ value: previousCount }] = await db
                .select({ value: count() })
                .from(attempts)
                .where(
                    and(
                        eq(attempts.assignmentId, params.assignmentId),
                        eq(attempts.studentId, session!.user.id)
                    )
                );

            const attemptNo = String(previousCount + 1);

            // 3) สร้าง attempt row ก่อนแบบ status = 'processing' (กันเคส error กลางทางแล้วไม่มี record เลย)
            const [attempt] = await db
                .insert(attempts)
                .values({
                    assignmentId: params.assignmentId,
                    studentId: session!.user.id,
                    attemptNo,
                    audioUrl: "", // จะอัปเดตทีหลังหลังอัปโหลดเสร็จ
                    durationSeconds: String(body.durationSeconds),
                    status: "processing",
                } as any)
                .returning();

            try {
                // 4) อัปโหลดไฟล์เสียงขึ้น Supabase Storage
                const audioUrl = await uploadStudentRecording(attempt.id, body.audio);

                // 5) ส่งไป transcribe แบบ batch
                const audioBuffer = Buffer.from(await body.audio.arrayBuffer());

                // ใช้ชื่อไฟล์จริงที่ client อัปโหลดมา (body.audio.name) ไม่ hardcode นามสกุลเอง
                const originalName = body.audio.name || "recording.mp3";
                const ext = originalName.split(".").pop() || "mp3";
                const transcribeFilename = `${attempt.id}.${ext}`;

                const { text: transcriptText } = await transcribeFullAudio(
                    audioBuffer,
                    transcribeFilename // 👈 ตรงกับนามสกุลไฟล์จริงเสมอ
                );

                // 6) align หาคำผิด
                const alignment = alignPassageWithTranscript(
                    assignment.passageText,
                    transcriptText
                );

                // 7) คำนวณ wpm + ประเมินผ่าน/ไม่ผ่าน
                const scoring = evaluateAttempt({
                    transcriptText,
                    durationSeconds: body.durationSeconds,
                    totalErrors: alignment.totalErrors,
                    minWpm: assignment.minWpm,
                    maxWpm: assignment.maxWpm,
                    maxAllowedErrors: assignment.maxAllowedErrors,
                });

                // 8) อัปเดต attempt ด้วยผลลัพธ์ทั้งหมด
                const [updatedAttempt] = await db
                    .update(attempts)
                    .set({
                        audioUrl,
                        transcriptText,
                        wpm: String(scoring.wpm),
                        totalErrors: alignment.totalErrors,
                        status: scoring.status,
                        speedFlag: scoring.speedFlag,
                        processedAt: new Date(),
                    })
                    .where(eq(attempts.id, attempt.id))
                    .returning();

                // 9) insert word_errors (ถ้ามีคำผิด)
                if (alignment.errors.length > 0) {
                    await db.insert(wordErrors).values(
                        alignment.errors.map((e) => ({
                            attemptId: attempt.id,
                            wordIndex: e.wordIndex,
                            expectedWord: e.expectedWord,
                            actualWord: e.actualWord,
                            errorType: e.errorType,
                            startTimeMs: null, // ตัด timestamp ออกตามที่คุยกันไว้ (API ไม่แม่นพอ)
                            endTimeMs: null,
                        }))
                    );
                }

                set.status = 201;
                return {
                    data: {
                        attempt: updatedAttempt,
                        errors: alignment.errors,
                    },
                };
            } catch (err) {
                console.error("Submit attempt failed:", err);

                // ถ้า error กลางทาง อัปเดต status ให้รู้ว่าล้มเหลว ไม่ปล่อยค้างเป็น 'processing' ตลอดไป
                await db
                    .update(attempts)
                    .set({ status: "failed", processedAt: new Date() })
                    .where(eq(attempts.id, attempt.id));

                set.status = 500;
                return { error: "ประมวลผลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
            }
        },
        {
            params: t.Object({ assignmentId: t.String() }),
            body: t.Object({
                audio: t.File(),
                durationSeconds: t.Numeric(), // client ส่งมาเป็น string ผ่าน form-data ได้ Elysia แปลงให้
            }),
        }
    )

    // GET /student/attempts/:id — ดูผลตัวเอง พร้อมรายละเอียดคำผิด
    .get(
        "/:id",
        async ({ session, params, set }) => {
            const [attempt] = await db
                .select()
                .from(attempts)
                .where(
                    and(eq(attempts.id, params.id), eq(attempts.studentId, session!.user.id))
                )
                .limit(1);

            if (!attempt) {
                set.status = 404;
                return { error: "Attempt not found" };
            }

            const errors = await db
                .select()
                .from(wordErrors)
                .where(eq(wordErrors.attemptId, attempt.id));

            return { data: { attempt, errors } };
        },
        { params: t.Object({ id: t.String() }) }
    );