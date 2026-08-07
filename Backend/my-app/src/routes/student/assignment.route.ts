import { Elysia, t } from "elysia";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import { classrooms, classroomStudents } from "../../db/schema/classroom-schema";
import { authMiddleware } from "../../middleware/auth.middleware";
import { assignments } from "../../db/schema/assignment-schema";
import { attempts } from "../../db/schema/attempt-schema";
export const assignmentRoutes = new Elysia({ prefix: "/assignments" })
    .use(authMiddleware)
    //get my assignments
    .get("/my-assignments", async ({ session, set }) => {
        if (!session?.user?.id) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                attemptId: attempts.id,
                attemptNo: attempts.attemptNo,
                transcriptText: attempts.transcriptText,
                durationSeconds: attempts.durationSeconds,
                audio_url: attempts.audioUrl,
                status: attempts.status,
                speed_flag: attempts.speedFlag,
                assignmentId: assignments.id,
                title: assignments.title,
                passageText: assignments.passageText,
                wordCount: assignments.wordCount,
                dueAt: assignments.dueAt,
                imgUrl: assignments.imgUrl,
            })
            .from(attempts)
            .innerJoin(
                assignments,
                eq(attempts.assignmentId, assignments.id)
            )
            .where(eq(attempts.studentId, session.user.id));

        return { data };
    })


    // GET ALL   // โจทย์ที่ยังไม่เคยอ่านเลยสักครั้ง
    .get(
        "/pending",
        async ({ session, query, set }) => {
            const [membership] = await db
                .select()
                .from(classroomStudents)
                .where(
                    and(
                        eq(classroomStudents.classroomId, query.classroomId),
                        eq(classroomStudents.studentId, session!.user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                set.status = 403;
                return { error: "คุณไม่ได้อยู่ในห้องนี้" };
            }

            // left join attempts (เฉพาะของนักเรียนคนนี้) แล้วกรองเอาเฉพาะแถวที่ไม่มี attempt จับคู่เลย
            const data = await db
                .select({
                    id: assignments.id,
                    title: assignments.title,
                    passageText: assignments.passageText,
                    wordCount: assignments.wordCount,
                    minWpm: assignments.minWpm,
                    maxWpm: assignments.maxWpm,
                    maxAllowedErrors: assignments.maxAllowedErrors,
                    dueAt: assignments.dueAt,
                    createdAt: assignments.createdAt,
                    imgUrl: assignments.imgUrl,
                })
                .from(assignments)
                .leftJoin(
                    attempts,
                    and(
                        eq(attempts.assignmentId, assignments.id),
                        eq(attempts.studentId, session!.user.id)
                    )
                )
                .where(
                    and(
                        eq(assignments.classroomId, query.classroomId),
                        isNull(attempts.id) // ไม่มี attempt แถวไหนจับคู่เลย = ยังไม่เคยทำ
                    )
                );

            return { data };
        },
        { query: t.Object({ classroomId: t.String() }) }
    )
    .get(
        "/",
        async ({ session, query, set }) => {
            const [membership] = await db
                .select()
                .from(classroomStudents)
                .where(
                    and(
                        eq(classroomStudents.classroomId, query.classroomId),
                        eq(classroomStudents.studentId, session!.user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                set.status = 403;
                return { error: "คุณไม่ได้อยู่ในห้องนี้" };
            }

            const data = await db
                .select()
                .from(assignments)
                .where(eq(assignments.classroomId, query.classroomId));

            return { data };
        },
        { query: t.Object({ classroomId: t.String() }) }
    )

    // GET BY ID — ดูบทความเต็มก่อนเริ่มอ่าน
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
                return { error: "คุณไม่มีสิทธิ์ดูโจทย์นี้" };
            }

            return { data: assignment };
        },
        { params: t.Object({ id: t.String() }) }
    );