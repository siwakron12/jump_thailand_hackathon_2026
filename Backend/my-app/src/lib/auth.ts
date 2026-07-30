import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth-schema";
export { schema };

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema : schema  ,
  }),

  emailAndPassword: {
    enabled: true,
  },

  // เพิ่ม field role (teacher/student) เข้าไปในตาราง user โดยตรง
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;