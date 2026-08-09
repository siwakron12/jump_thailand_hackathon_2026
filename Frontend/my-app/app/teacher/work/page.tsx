// app/teacher/work/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, MoreVertical, ChevronDown, Calendar } from "lucide-react";

type ClassRoom = {
  id: string;
  name: string;
};

type Homework = {
  id: string;
  classId: string;
  title: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
};

const classes: ClassRoom[] = [
  { id: "1", name: "ป.3/1" },
  { id: "2", name: "ป.3/2" },
  { id: "3", name: "ป.4/1" },
];

const initialHomeworks: Homework[] = [
  {
    id: "h1",
    classId: "1",
    title: "อ่านนิทานเรื่อง 'หนูน้อยหมวกแดง'",
    dueDate: "15 ส.ค. 2569",
    submittedCount: 18,
    totalCount: 25,
  },
  {
    id: "h2",
    classId: "1",
    title: "อ่านนิทานเรื่อง 01",
    dueDate: "20 ส.ค. 2569",
    submittedCount: 10,
    totalCount: 25,
  },
  {
    id: "h3",
    classId: "2",
    title: "อ่านใบงานวิทยาศาสตร์ เรื่องวัฏจักรน้ำ",
    dueDate: "18 ส.ค. 2569",
    submittedCount: 20,
    totalCount: 24,
  },
  {
    id: "h4",
    classId: "3",
    title: "อ่านท่องสูตรคูณ แม่ 2-5",
    dueDate: "12 ส.ค. 2569",
    submittedCount: 23,
    totalCount: 23,
  },
];

export default function WorkPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0].id);
  const [homeworks] = useState<Homework[]>(initialHomeworks);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredHomeworks = useMemo(
    () => homeworks.filter((hw) => hw.classId === selectedClassId),
    [homeworks, selectedClassId]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">การบ้านของห้อง </h1>

          {/* Class select */}
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

        <button className="flex items-center gap-2 bg-[#5cb85c] hover:bg-[#4ea54e] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-sm transition-colors">
          <Plus size={18} />
          เพิ่มการบ้านในห้อง {classes.find((c) => c.id === selectedClassId)?.name}
        </button>
      </div>

      {/* Homework list */}
      <div className="flex flex-col gap-4">
        {filteredHomeworks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm px-5 py-10 text-center text-gray-400 text-sm">
            ยังไม่มีการบ้านในห้องนี้
          </div>
        )}

        {filteredHomeworks.map((hw) => (
          <div
            key={hw.id}
            className="relative bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">{hw.title}</h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                <Calendar size={14} />
                กำหนดส่ง: {hw.dueDate}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                ส่งแล้ว {hw.submittedCount}/{hw.totalCount} คน
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Edit */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="แก้ไขการบ้าน"
              >
                <Pencil size={18} />
              </button>

              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === hw.id ? null : hw.id)
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="เมนูเพิ่มเติม"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === hw.id && (
                  <div className="absolute right-0 top-10 z-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      ดูรายละเอียด
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      ลบการบ้าน
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}