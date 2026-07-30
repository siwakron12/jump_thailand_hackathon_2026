import { Elysia } from "elysia"
import { classroomRoutes } from "./classroom.route"
import { studentRoutes } from "../student"
import { assignmentRoutes } from "./assignment.route";

export const teacherRoutes = new Elysia({ prefix: "/teacher" })
    .use(classroomRoutes)
    .use(studentRoutes)
    .use(assignmentRoutes);
