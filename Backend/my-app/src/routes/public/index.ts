import { Elysia } from "elysia";
import { authRoute } from "./auth.route";


export const publicRoutes = new Elysia()
  .use(authRoute)
  