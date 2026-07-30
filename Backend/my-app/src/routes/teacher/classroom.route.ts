import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { classrooms } from "../../db/schema/classroom-schema";
import { authMiddleware } from "../../middleware/auth.middleware";

function generateJoinCode(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ตัดตัวที่สับสนง่ายออก (0/O, 1/I)
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export const classroomRoutes = new Elysia({ prefix: "/classrooms" })
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
    // CREATE
    .post(
        "/",
        async ({ session, body, set }) => {
            const [classroom] = await db
                .insert(classrooms)
                .values({
                    teacherId: session!.user.id,
                    name: body.name,
                    joinCode: generateJoinCode(),
                })
                .returning();

            set.status = 201;
            return { data: classroom };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1, maxLength: 100 }),
            }),
        }
    )

    // GET ALL (เฉพาะห้องของครูคนนี้)
    .get("/", async ({ session }) => {
        const data = await db
            .select()
            .from(classrooms)
            .where(eq(classrooms.teacherId, session!.user.id));

        return { data };
    })

    // GET BY ID
    .get(
        "/:id",
        async ({ session, params, set }) => {
            const [classroom] = await db
                .select()
                .from(classrooms)
                .where(
                    and(
                        eq(classrooms.id, params.id),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .limit(1);

            if (!classroom) {
                set.status = 404;
                return { error: "Classroom not found" };
            }
            return { data: classroom };
        },
        { params: t.Object({ id: t.String() }) }
    )

    // PATCH (แก้ชื่อห้อง)
    .patch(
        "/:id",
        async ({ session, params, body, set }) => {
            const [updated] = await db
                .update(classrooms)
                .set({ name: body.name })
                .where(
                    and(
                        eq(classrooms.id, params.id),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .returning();

            if (!updated) {
                set.status = 404;
                return { error: "Classroom not found" };
            }
            return { data: updated };
        },
        {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                name: t.String({ minLength: 1, maxLength: 100 }),
            }),
        }
    )

    // DELETE
    .delete(
        "/:id",
        async ({ session, params, set }) => {
            const [deleted] = await db
                .delete(classrooms)
                .where(
                    and(
                        eq(classrooms.id, params.id),
                        eq(classrooms.teacherId, session!.user.id)
                    )
                )
                .returning();

            if (!deleted) {
                set.status = 404;
                return { error: "Classroom not found" };
            }
            return { data: deleted, message: "Classroom deleted" };
        },
        { params: t.Object({ id: t.String() }) }
    );