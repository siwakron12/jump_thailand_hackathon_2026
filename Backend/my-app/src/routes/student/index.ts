import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth.middleware";
import { classroomRoutes } from "./classroom.route";
import { assignmentRoutes } from "./assignment.route";
import { attemptRoutes } from "./attempt.route";

export const studentRoutes = new Elysia({ prefix: "/student" })
  .use(classroomRoutes)
  .use(assignmentRoutes)
  .use(attemptRoutes);