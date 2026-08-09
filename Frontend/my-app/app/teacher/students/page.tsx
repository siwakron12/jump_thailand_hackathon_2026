// app/teacher/students/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  BookOpenCheck,
  ClipboardList,
  X,
  Sparkles,
  Astroid,
  BotMessageSquare,
} from "lucide-react";

type ClassRoom = {
  id: string;
  name: string;
};

type ReadingFeedback = {
  totalQuestions: number;
  correctAnswers: number;
  lastReadTitle: string;
  aiComment: string;
};

type HomeworkStatus = {
  id: string;
  title: string;
  status: "ส่งแล้ว" | "ยังไม่ส่ง" | "ส่งช้า";
  score?: string;
};

type Student = {
  id: string;
  classId: string;
  name: string;
  studentNo: number;
  avatarColor: string;
  reading: ReadingFeedback;
  homeworks: HomeworkStatus[];
};

const classes: ClassRoom[] = [
  { id: "1", name: "ป.3/1" },
  { id: "2", name: "ป.3/2" },
  { id: "3", name: "ป.4/1" },
];

const students: Student[] = [
  {
    id: "s1",
    classId: "1",
    name: "ด.ช. ภูมิ ใจดี",
    studentNo: 1,
    avatarColor: "bg-green-100 text-green-600",
    reading: {
      totalQuestions: 20,
      correctAnswers: 17,
      lastReadTitle: "นิทานเรื่องกระต่ายกับเต่า",
      aiComment: "อ่านคล่องแต่ยังมีบางจุดเช่นคำว่า เรือ และ ควาย ที่ยังอ่านผิดบ้าง ควรฝึกอ่านคำเหล่านี้เพิ่ม",
    },
    homeworks: [
      { id: "hw1", title: "แบบฝึกหัดคณิตศาสตร์ บทที่ 3", status: "ส่งแล้ว", score: "9/10" },
      { id: "hw2", title: "เขียนเรียงความเรื่องฤดูฝน", status: "ยังไม่ส่ง" },
    ],
  },
  {
    id: "s2",
    classId: "1",
    name: "ด.ญ. แพร สายใจ",
    studentNo: 2,
    avatarColor: "bg-blue-100 text-blue-600",
    reading: {
      totalQuestions: 20,
      correctAnswers: 12,
      lastReadTitle: "นิทานเรื่องกระต่ายกับเต่า",
      aiComment: "อ่านคล่องแต่ยังมีบางจุดเช่นคำว่า เรือ และ ควาย ที่ยังอ่านผิดบ้าง ควรฝึกอ่านคำเหล่านี้เพิ่ม",
    },
    homeworks: [
      { id: "hw1", title: "แบบฝึกหัดคณิตศาสตร์ บทที่ 3", status: "ส่งช้า", score: "7/10" },
      { id: "hw2", title: "เขียนเรียงความเรื่องฤดูฝน", status: "ส่งแล้ว", score: "8/10" },
    ],
  },
  {
    id: "s3",
    classId: "2",
    name: "ด.ช. กันต์ รักเรียน",
    studentNo: 1,
    avatarColor: "bg-orange-100 text-orange-600",
    reading: {
      totalQuestions: 15,
      correctAnswers: 15,
      lastReadTitle: "ใบงานวิทยาศาสตร์ เรื่องวัฏจักรน้ำ",
      aiComment: "อ่านคล่องแต่ยังมีบางจุดเช่นคำว่า เรือ และ ควาย ที่ยังอ่านผิดบ้าง ควรฝึกอ่านคำเหล่านี้เพิ่ม",
    },
    homeworks: [
      { id: "hw3", title: "ใบงานวิทยาศาสตร์ เรื่องวัฏจักรน้ำ", status: "ส่งแล้ว", score: "10/10" },
    ],
  },
  {
    id: "s4",
    classId: "3",
    name: "ด.ญ. มิ่งขวัญ ตั้งใจ",
    studentNo: 1,
    avatarColor: "bg-pink-100 text-pink-600",
    reading: {
      totalQuestions: 10,
      correctAnswers: 6,
      lastReadTitle: "ท่องสูตรคูณ แม่ 2-5",
      aiComment: "อ่านคล่องแต่ยังมีบางจุดเช่นคำว่า เรือ และ ควาย ที่ยังอ่านผิดบ้าง ควรฝึกอ่านคำเหล่านี้เพิ่ม",
    },
    homeworks: [
      { id: "hw4", title: "ท่องสูตรคูณ แม่ 2-5", status: "ส่งแล้ว", score: "6/10" },
    ],
  },
];

function statusColor(status: HomeworkStatus["status"]) {
  switch (status) {
    case "ส่งแล้ว":
      return "bg-green-50 text-green-600";
    case "ส่งช้า":
      return "bg-yellow-50 text-yellow-600";
    case "ยังไม่ส่ง":
      return "bg-red-50 text-red-500";
  }
}

export default function StudentsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0].id);
  const [feedbackStudent, setFeedbackStudent] = useState<Student | null>(null);
  const [homeworkStudent, setHomeworkStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [selectedClassId]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">นักเรียน</h1>

          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none w-[150px] bg-white border border-gray-200 rounded-full pl-4 pr-9 py-2 text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <span className="text-sm text-gray-400">
          ทั้งหมด {filteredStudents.length} คน
        </span>
      </div>

      {/* Student list */}
      <div className="flex flex-col gap-4">
        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm px-5 py-10 text-center text-gray-400 text-sm">
            ยังไม่มีนักเรียนในห้องนี้
          </div>
        )}

        {filteredStudents.map((student) => {
          const percent = Math.round(
            (student.reading.correctAnswers / student.reading.totalQuestions) * 100
          );
          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${student.avatarColor}`}
                >
                  {student.studentNo}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">{student.name}</h2>
                  <p className="text-sm text-gray-400">
                    เลขที่ {student.studentNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeedbackStudent(student)}
                  className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-[#4ea54e] text-sm font-medium px-3.5 py-2 rounded-full transition-colors"
                >
                  <Sparkles size={16} />
                  Feedback การอ่าน (AI) · {percent}%
                </button>

                <button
                  onClick={() => setHomeworkStudent(student)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium px-3.5 py-2 rounded-full transition-colors"
                >
                  <ClipboardList size={16} />
                  รายละเอียดการบ้าน
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Modal */}
      {feedbackStudent && (
        <Modal onClose={() => setFeedbackStudent(null)}>
          <div className="flex items-center gap-2 mb-1 text-[#4ea54e]">
            <Sparkles size={18} />
            <span className="text-sm font-medium">Feedback การอ่านด้วย AI</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {feedbackStudent.name}
          </h3>

          <div className="bg-green-50 rounded-2xl p-4 mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-gray-500">ความแม่นยำโดยรวม</span>
              <span className="text-2xl font-bold text-[#4ea54e]">
                {Math.round(
                  (feedbackStudent.reading.correctAnswers /
                    feedbackStudent.reading.totalQuestions) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5cb85c] rounded-full"
                style={{
                  width: `${Math.round(
                    (feedbackStudent.reading.correctAnswers /
                      feedbackStudent.reading.totalQuestions) *
                      100
                  )}%`,
                }}
              />
            </div>
           
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
              <BookOpenCheck size={16} className="text-gray-400" />
              เรื่องที่อ่านล่าสุด
            </p>
            <p className="text-sm font-medium text-gray-700">
              {feedbackStudent.reading.lastReadTitle}
            </p>
          </div>

          <div className="bg-red-200/50  rounded-lg p-4">
            <p className="text-sm text-red-600 mb-1 flex items-center gap-1.5">
              ความเห็นจาก AI <BotMessageSquare  className="size-5 text-blue-500 font-extrabold" /> (เป็นเพียงคำแนะนำเท่านั้น)
            </p>
            <p className="text-sm text-gray-900 bg-gray-50 rounded-xl p-3 leading-relaxed">
              {feedbackStudent.reading.aiComment}
            </p>
          </div>
        </Modal>
      )}

      {/* Homework detail Modal */}
      {homeworkStudent && (
        <Modal onClose={() => setHomeworkStudent(null)}>
          <div className="flex items-center gap-2 mb-1 text-gray-500">
            <ClipboardList size={18} />
            <span className="text-sm font-medium">รายละเอียดการบ้าน</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {homeworkStudent.name}
          </h3>

          <div className="flex flex-col gap-3">
            {homeworkStudent.homeworks.map((hw) => (
              <div
                key={hw.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">{hw.title}</p>
                  {hw.score && (
                    <p className="text-xs text-gray-400 mt-0.5">คะแนน: {hw.score}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColor(
                    hw.status
                  )}`}
                >
                  {hw.status}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}