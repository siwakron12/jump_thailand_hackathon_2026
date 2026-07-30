import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { classrooms, classroomStudents } from "../../db/schema/classroom-schema";
import { authMiddleware } from "../../middleware/auth.middleware";

export const classroomRoutes = new Elysia({ prefix: "/classrooms" })
   .use(authMiddleware)
    .onBeforeHandle(({ session, set }) => {
        if (!session) {
            set.status = 401
            return { error: "Unauthorized" }
        }
        if (session.user.role !== "student") {
            set.status = 403
            return { error: "Forbidden" }
        }
    })  
// JOIN ห้องเรียนด้วย join code
  .post(
    "/join",
    async ({ session, body, set }) => {
      const [classroom] = await db
        .select()
        .from(classrooms)
        .where(eq(classrooms.joinCode, body.joinCode.toUpperCase()))
        .limit(1);

      if (!classroom) {
        set.status = 404;
        return { error: "Join code ไม่ถูกต้อง" };
      }

      // เช็คว่าเข้าห้องนี้อยู่แล้วหรือยัง
      const [existing] = await db
        .select()
        .from(classroomStudents)
        .where(
          and(
            eq(classroomStudents.classroomId, classroom.id),
            eq(classroomStudents.studentId, session!.user.id)
          )
        )
        .limit(1);

      if (existing) {
        set.status = 409;
        return { error: "คุณอยู่ในห้องนี้อยู่แล้ว" };
      }

      const [joined] = await db
        .insert(classroomStudents)
        .values({
          classroomId: classroom.id,
          studentId: session!.user.id,
        })
        .returning();

      set.status = 201;
      return { data: { ...joined, classroom } };
    },
    {
      body: t.Object({
        joinCode: t.String({ minLength: 1, maxLength: 10 }),
      }),
    }
  )

  // ดูรายการห้องที่ตัวเองอยู่
  .get("/", async ({ session }) => {
    const data = await db
      .select({
        classroomId: classrooms.id,
        name: classrooms.name,
        teacherId: classrooms.teacherId,
        joinedAt: classroomStudents.joinedAt,
      })
      .from(classroomStudents)
      .innerJoin(classrooms, eq(classroomStudents.classroomId, classrooms.id))
      .where(eq(classroomStudents.studentId, session!.user.id));

    return { data };
  })

  // ดูข้อมูลห้องเดียว (ต้องเป็นสมาชิกห้องนั้นก่อนถึงจะดูได้)
  .get(
    "/:id",
    async ({ session, params, set }) => {
      const [membership] = await db
        .select()
        .from(classroomStudents)
        .where(
          and(
            eq(classroomStudents.classroomId, params.id),
            eq(classroomStudents.studentId, session!.user.id)
          )
        )
        .limit(1);

      if (!membership) {
        set.status = 403;
        return { error: "คุณไม่ได้อยู่ในห้องนี้" };
      }

      const [classroom] = await db
        .select()
        .from(classrooms)
        .where(eq(classrooms.id, params.id))
        .limit(1);

      if (!classroom) {
        set.status = 404;
        return { error: "Classroom not found" };
      }

      return { data: classroom };
    },
    { params: t.Object({ id: t.String() }) }
  )

  // ออกจากห้อง (unjoin)
  .delete(
    "/:id/leave",
    async ({ session, params, set }) => {
      const [deleted] = await db
        .delete(classroomStudents)
        .where(
          and(
            eq(classroomStudents.classroomId, params.id),
            eq(classroomStudents.studentId, session!.user.id)
          )
        )
        .returning();

      if (!deleted) {
        set.status = 404;
        return { error: "คุณไม่ได้อยู่ในห้องนี้อยู่แล้ว" };
      }

      return { data: deleted, message: "ออกจากห้องเรียนสำเร็จ" };
    },
    { params: t.Object({ id: t.String() }) }
  );