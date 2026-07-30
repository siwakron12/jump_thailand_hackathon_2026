import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { assignments } from "../../db/schema/assignment-schema";
import { classrooms } from "../../db/schema/classroom-schema";
import { authMiddleware } from "../../middleware/auth.middleware";
import { countThaiWords } from "../../lib/thai-tokenizer";
import { uploadReferenceAudio } from "../../lib/supabase-storage";
// นับคำแบบง่าย เผื่อบทความไทยไม่มีเว้นวรรค ใช้นับ "ตัวอักษรที่ไม่ใช่ช่องว่าง"
// เป็นตัวประมาณคร่าวๆ ก่อน (ของจริงควรตัดคำด้วย tokenizer ไทยตอน submit จริง)
// function estimateWordCount(text: string) {
//   const cleaned = text.trim();
//   if (!cleaned) return 0;

//   const segmenter = new Intl.Segmenter("th", { granularity: "word" });
//   const segments = segmenter.segment(cleaned);

//   // นับเฉพาะ segment ที่เป็น "คำ" จริง (isWordLike: true)
//   // ตัดพวกช่องว่าง/เครื่องหมายวรรคตอนที่ segmenter แยกออกมาด้วยทิ้งไป
//   let count = 0;
//   for (const seg of segments) {
//     if (seg.isWordLike) count++;
//   }
//   return count;
// }

export const assignmentRoutes = new Elysia({ prefix: "/assignments" })
    .use(authMiddleware)
    .onBeforeHandle(({ session, set }) => {
        if (!session) {
            set.status = 401
            return { error: "Unauthorized" }
        }
        if (session.user.role !== "teacher") {
            set.status = 403
            return { error: "Forbidden" }
        }
    })
    .post(
        "/:id/reference-audio",
        async ({ session, params, body, set }) => {
            const [assignment] = await db
                .select()
                .from(assignments)
                .where(eq(assignments.id, params.id))
                .limit(1);

            if (!assignment) {
                set.status = 404;
                return { error: "Assignment not found" };
            }

            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, assignment.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์แก้ไขโจทย์นี้" };
            }

            const audioUrl = await uploadReferenceAudio(params.id, body.audio);

            const [updated] = await db
                .update(assignments)
                .set({ referenceAudioUrl: audioUrl })
                .where(eq(assignments.id, params.id))
                .returning();

            return { data: updated };
        },
        {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                audio: t.File(), // multipart/form-data
            }),
        }
    )
    .post(
        "/",
        async ({ session, body, set }) => {
            // เช็คก่อนว่าห้องนี้เป็นของครูคนนี้จริง
            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, body.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์สร้างโจทย์ในห้องนี้" };
            }

            const [assignment] = await db
                .insert(assignments)
                .values({
                    classroomId: body.classroomId,
                    createdBy: session!.user.id,
                    title: body.title,
                    passageText: body.passageText,
                    wordCount: countThaiWords(body.passageText),
                    minWpm: body.minWpm ?? 40,
                    maxWpm: body.maxWpm ?? 120,
                    maxAllowedErrors: body.maxAllowedErrors ?? 3,
                    dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
                })
                .returning();

            set.status = 201;
            return { data: assignment };
        },
        {
            body: t.Object({
                classroomId: t.String(),
                title: t.String({ minLength: 1, maxLength: 200 }),
                passageText: t.String({ minLength: 1 }),
                minWpm: t.Optional(t.Number()),
                maxWpm: t.Optional(t.Number()),
                maxAllowedErrors: t.Optional(t.Number()),
                dueAt: t.Optional(t.String()), // ISO date string
            }),
        }
    )

    // GET ALL — โจทย์ทั้งหมดในห้องหนึ่ง (query param ?classroomId=)
    .get(
        "/",
        async ({ session, query, set }) => {
            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, query.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์ดูห้องนี้" };
            }

            const data = await db
                .select()
                .from(assignments)
                .where(eq(assignments.classroomId, query.classroomId));

            return { data };
        },
        {
            query: t.Object({ classroomId: t.String() }),
        }
    )

    // GET BY ID
    .get(
        "/:id",
        async ({ session, params, set }) => {
            const [assignment] = await db
                .select()
                .from(assignments)
                .where(eq(assignments.id, params.id))
                .limit(1);

            if (!assignment) {
                set.status = 404;
                return { error: "Assignment not found" };
            }

            // เช็คสิทธิ์ผ่าน classroom เจ้าของ
            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, assignment.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์ดูโจทย์นี้" };
            }

            return { data: assignment };
        },
        { params: t.Object({ id: t.String() }) }
    )

    // PATCH — แก้ไขโจทย์ (แก้ได้บางส่วน)
    .patch(
        "/:id",
        async ({ session, params, body, set }) => {
            const [assignment] = await db
                .select()
                .from(assignments)
                .where(eq(assignments.id, params.id))
                .limit(1);

            if (!assignment) {
                set.status = 404;
                return { error: "Assignment not found" };
            }

            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, assignment.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์แก้ไขโจทย์นี้" };
            }

            const updateData: Record<string, unknown> = { ...body };
            if (body.passageText) {
                updateData.wordCount = countThaiWords(body.passageText);
            }
            if (body.dueAt) {
                updateData.dueAt = new Date(body.dueAt);
            }

            const [updated] = await db
                .update(assignments)
                .set(updateData)
                .where(eq(assignments.id, params.id))
                .returning();

            return { data: updated };
        },
        {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
                passageText: t.Optional(t.String({ minLength: 1 })),
                minWpm: t.Optional(t.Number()),
                maxWpm: t.Optional(t.Number()),
                maxAllowedErrors: t.Optional(t.Number()),
                dueAt: t.Optional(t.String()),
            }),
        }
    )

    // DELETE
    .delete(
        "/:id",
        async ({ session, params, set }) => {
            const [assignment] = await db
                .select()
                .from(assignments)
                .where(eq(assignments.id, params.id))
                .limit(1);

            if (!assignment) {
                set.status = 404;
                return { error: "Assignment not found" };
            }

            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, assignment.classroomId),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 403;
                return { error: "คุณไม่มีสิทธิ์ลบโจทย์นี้" };
            }

            await db.delete(assignments).where(eq(assignments.id, params.id));

            return { message: "ลบโจทย์สำเร็จ" };
        },
        { params: t.Object({ id: t.String() }) }
    );