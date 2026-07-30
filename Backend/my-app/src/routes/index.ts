import { Elysia } from "elysia"

import { publicRoutes } from "./public"
import { teacherRoutes } from "./teacher"
import { studentRoutes } from "./student"

export const routes = new Elysia({ prefix: "/api" })
 .use(publicRoutes)
 .use(teacherRoutes)
 .use(studentRoutes)