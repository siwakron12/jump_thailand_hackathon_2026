import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { classrooms } from "./classroom-schema";

export const assignments = pgTable("assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  classroomId: text("classroom_id")
    .notNull()
    .references(() => classrooms.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  title: varchar("title", { length: 200 }).notNull(),
  passageText: text("passage_text").notNull(),
  wordCount: integer("word_count").notNull(),
  minWpm: integer("min_wpm").notNull().default(40),
  maxWpm: integer("max_wpm").notNull().default(120),
  maxAllowedErrors: integer("max_allowed_errors").notNull().default(3),
  referenceAudioUrl: text("reference_audio_url"), // 👈 เพิ่ม: เสียงครูอ่านเฉลย
  imgUrl: text("img_url"), // 👈 เพิ่ม: รูปภาพประกอบ
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});