import {
    pgTable,
    text,
    varchar,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// ------------------------------------------------------------
// 1. CLASSROOMS
// ------------------------------------------------------------
export const classrooms = pgTable("classrooms", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teacherId: text("teacher_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(), // เช่น "ป.3/1"
    joinCode: varchar("join_code", { length: 10 }).unique(), // รหัสให้นักเรียนกรอกเข้าห้อง (demo)
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ------------------------------------------------------------
// 2. CLASSROOM_STUDENTS (ตารางเชื่อม นักเรียน <-> ห้องเรียน)
// ------------------------------------------------------------
export const classroomStudents = pgTable(
    "classroom_students",
    {
        classroomId: text("classroom_id")
            .notNull()
            .references(() => classrooms.id, { onDelete: "cascade" }),
        studentId: text("student_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        joinedAt: timestamp("joined_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.classroomId, t.studentId] }),
    })
);