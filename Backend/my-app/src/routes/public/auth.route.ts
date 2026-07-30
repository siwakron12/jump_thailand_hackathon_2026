
import { Elysia } from "elysia"
import { auth } from "../../lib/auth"

export const authRoute = new Elysia()
  .all("/auth/*", async ({ request }) => {
    return auth.handler(request)
  })