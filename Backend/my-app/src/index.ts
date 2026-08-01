import { Elysia } from "elysia"
import { routes } from "./routes/index"

const app = new Elysia()
  .get("/", () => "Welcome to Elysia with Better Auth!")
  .use(routes)
  // .listen(3000)

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)