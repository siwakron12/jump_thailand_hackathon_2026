import { Elysia } from "elysia"
import { routes } from "./routes/index"
import { cors } from "@elysiajs/cors"
const app = new Elysia()
  .use(
    cors({
      origin: true, // เปิดรับทุก origin
      credentials: true, // จำเป็นสำหรับ better-auth เพราะต้องส่ง cookie ข้าม origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .get("/", () => "Welcome to Elysia with Better Auth!")
  .use(routes)
  .listen(process.env.PORT || 8080)


// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)