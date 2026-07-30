import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*.ts", // อ่านทุกไฟล์ .ts ในโฟลเดอร์ schema
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});