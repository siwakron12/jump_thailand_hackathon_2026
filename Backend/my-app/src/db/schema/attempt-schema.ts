import {
  pgTable,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { assignments } from "./assignment-schema";

// ------------------------------------------------------------
// 4. ATTEMPTS (การอ่านแต่ละครั้งของนักเรียน)
// ------------------------------------------------------------
export const attempts = pgTable("attempts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  attemptNo: integer("attempt_no").notNull().default(1), // อ่านรอบที่เท่าไหร่ (รองรับอ่านซ้ำ)
  audioUrl: text("audio_url").notNull(), // path/URL ไฟล์เสียงที่บันทึกไว้ (Supabase Storage)
  transcriptText: text("transcript_text"), // ผลลัพธ์จาก Typhoon ASR
  durationSeconds: numeric("duration_seconds", { precision: 6, scale: 2 }),
  wpm: numeric("wpm", { precision: 6, scale: 2 }), // คำนวณจาก transcript + duration
  totalErrors: integer("total_errors").default(0),
  status: varchar("status", { length: 15 }).notNull().default("processing"),
  // 'processing' | 'passed' | 'failed' | 'reviewed'
  speedFlag: varchar("speed_flag", { length: 10 }), // 'slow' | 'fast' | 'ok'
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

// ------------------------------------------------------------
// 5. WORD_ERRORS (รายละเอียดคำที่ผิด ต่อ 1 attempt)
// ------------------------------------------------------------
export const wordErrors = pgTable("word_errors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  wordIndex: integer("word_index").notNull(), // ตำแหน่งคำใน passage_text (เริ่มที่ 0)
  expectedWord: varchar("expected_word", { length: 100 }).notNull(), // คำที่ควรอ่าน
  actualWord: varchar("actual_word", { length: 100 }), // คำที่ AI ได้ยิน (NULL ถ้าข้ามคำ)
  errorType: varchar("error_type", { length: 15 }).notNull(),
  // 'substitution' | 'omission' | 'insertion'
  startTimeMs: integer("start_time_ms"), // timestamp ในไฟล์เสียง (เผื่อเล่นย้อนหลัง)
  endTimeMs: integer("end_time_ms"),
});