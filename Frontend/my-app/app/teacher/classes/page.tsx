// app/teacher/classes/page.tsx
"use client";

import { useState } from "react";
import { Plus, Share2, Pencil, MoreVertical, Copy, Check } from "lucide-react";

type ClassRoom = {
  id: string;
  name: string;
  code: string;
  studentCount: number;
};

const initialClasses: ClassRoom[] = [
  { id: "1", name: "ป.3/1", code: "A1B2C3", studentCount: 25 },
  { id: "2", name: "ป.3/2", code: "D4E5F6", studentCount: 24 },
  { id: "3", name: "ป.4/1", code: "G7H8I9", studentCount: 23 },
  { id: "4", name: "ป.5/1", code: "J0K1L2", studentCount: 24 },
];

export default function ClassesPage() {
  const [classes] = useState<ClassRoom[]>(initialClasses);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ห้องเรียน</h1>
        <button className="flex items-center gap-2 bg-[#5cb85c] hover:bg-[#4ea54e] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-sm transition-colors">
          <Plus size={18} />
          สร้างห้องเรียน
        </button>
      </div>

      {/* Class list */}
      <div className="flex flex-col gap-4">
        {classes.map((room) => (
          <div
            key={room.id}
            className="relative bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">{room.name}</h2>
              <p className="text-sm text-gray-400 mt-1">
                รหัสเข้าห้อง:{" "}
                <span className="font-medium text-gray-500">{room.code}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {room.studentCount} นักเรียน
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Copy / share code */}
              <button
                onClick={() => handleCopy(room.id, room.code)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-[#5cb85c] hover:bg-green-100 transition-colors"
                aria-label="คัดลอกรหัสเข้าห้อง"
              >
                {copiedId === room.id ? <Check size={18} /> : <Share2 size={18} />}
              </button>

              {/* Edit */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="แก้ไขห้องเรียน"
              >
                <Pencil size={18} />
              </button>

              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === room.id ? null : room.id)
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="เมนูเพิ่มเติม"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === room.id && (
                  <div className="absolute right-0 top-10 z-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                      ดูรายละเอียด
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      ลบห้องเรียน
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