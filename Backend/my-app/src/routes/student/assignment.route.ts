import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { classrooms, classroomStudents } from "../../db/schema/classroom-schema";
import { authMiddleware } from "../../middleware/auth.middleware";
import { assignments } from "../../db/schema/assignment-schema";
export const assignmentRoutes = new Elysia({ prefix: "/assignments" })
    .use(authMiddleware)

    // GET ALL — โจทย์ในห้องที่ตัวเองอยู่ (query ?classroomId=)
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