"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Clock,
  BookOpen,
  Target,
  ChevronDown,
  Users,
  School,
  UserStar,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";
import Readingview from "./Readingview";

interface AssignmentItem {
  id: string;
  title: string;
  emoji: string;
  passageText: string;
  minWpm: number;
  maxWpm: number;
  dueAt: string;
  imgUrl?: string;
}

interface StatPillProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

interface AssignmentCardProps {
  data: AssignmentItem;
  started: boolean;
  onStart: (id: string) => void;
  isLast: boolean;
}

const DEFAULT_CLASSROOM = {
  name: "ป.3/1",
  teacher: "ครูอารยา",
  studentCount: 25,
  classroomId: "",
};

function estimateMinutes(text: string, minWpm: number, maxWpm: number): string {
  const words = text.trim().split(/\s+/).length;
  const maxMin = Math.max(1, Math.round(words / minWpm));
  const minMin = Math.max(1, Math.round(words / maxWpm));
  return `${minMin}-${maxMin} นาที`;
}

function formatDueAt(dueAt: string): string {
  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return dueAt;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 border-l border-[#cfd1cf] pl-3 first:border-none first:pl-0">
      <div className="flex size-14 items-center justify-center rounded-xl text-[#048921]">
        {icon}
      </div>
      <span className="font-prompt text-[11px] text-[#6B8A76]">{label}</span>
      <span className="font-prompt text-[13px] font-semibold text-[#233A2C]">
        {value}
      </span>
    </div>
  );
}

function AssignmentCard({
  data,
  started,
  onStart,
  isLast,
}: AssignmentCardProps) {
  const wordCount = data.passageText.trim().split(/\s+/).length;
  const eta = estimateMinutes(data.passageText, data.minWpm, data.maxWpm);

  return (
    <div className="relative flex h-full flex-col w-full px-5 ">
      {!started ? (
        <div className="mt-2 flex flex-col gap-4 rounded-3xl border border-[#DCEEE0] bg-white p-4 ">
          <h2 className="font-prompt m-0 text-[22px] font-bold text-[#233A2C]">
            {data.title}
          </h2>

            
            <img className="w-full h-auto max-w-[350px] mx-auto rounded-2xl" src={data?.imgUrl || "https://cdn-local.mebmarket.com/meb/server1/342804/Thumbnail/book_detail_large.gif?5="} alt="Book Thumbnail" />
     

          <div className="flex gap-2">
            <StatPill
              icon={<BookOpen size={18} />}
              label="ความยาว"
              value={`${wordCount} คำ`}
            />
            <StatPill
              icon={<Clock size={18} />}
              label="เวลาประมาณ"
              value={eta}
            />
            <StatPill
              icon={<Target size={18} />}
              label="เป้าหมาย"
              value={`${data.minWpm}-${data.maxWpm} WPM`}
            />
          </div>

          <span className="font-sarabun text-xs text-[#6B8A76]">
            กำหนดส่ง: {formatDueAt(data.dueAt)}
          </span>

          <button
            onClick={() => onStart(data.id)}
            className="font-prompt my-2 cursor-pointer rounded-full bg-[#73cc44] py-3.5 text-base font-semibold text-white"
          >
            เริ่มอ่าน
          </button>
          {!isLast && (
            <div className="  flex flex-col items-center gap-0.5">
              <span className="font-prompt text-[13px] lg:mt-12 font-semibold text-[#6B8A76]">
                ปัดลงเพื่ออ่านข้อถัดไป
              </span>
              <ChevronDown
                size={40}
                className="animate-bounce font-bold text-[#4CAF6E]"
              />
            </div>
          )}
        </div>
      ) : (
        <Readingview
          id={data.id}
          emoji={data.emoji}
          title={data.title}
          passageText={data.passageText}
          
        />
      )}
    </div>
  );
}

export default function StudentHomeFeed() {
  const [studentName, setStudentName] = useState("น้องอุ่นใจ");
  const [classroom, setClassroom] = useState(DEFAULT_CLASSROOM);
  const [startedMap, setStartedMap] = useState<Record<string, boolean>>({});
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // ดึงชื่อผู้ใช้จาก session + ห้องเรียนของนักเรียน
  useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.getSession();
      const name = session.data?.user?.name;
      if (name) setStudentName(name);
    };

    async function fetchClass() {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_BASE_URL + "/api/student/classrooms",
          { credentials: "include" },
        );
        if (!response.ok) {
          console.error("Fetch classroom failed:", response.status);
          return;
        }
        const { data } = await response.json();
        if (data?.[0]) {
          setClassroom((prev) => ({
            ...prev,
            classroomId: data[0].classroomId,
            name: data[0].name,
          }));
        }
      } catch (error) {
        console.error("Error fetching classroom data:", error);
      }
    }

    // fetchSession();
    fetchClass();
  }, []);

  // ดึงงานที่ต้องทำจริงจาก backend เมื่อรู้ classroomId แล้ว
  useEffect(() => {
    if (!classroom.classroomId) return;

    async function fetchAssignments() {
      setLoadingAssignments(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/assignments/pending?classroomId=${classroom.classroomId}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          console.error("Fetch assignments failed:", response.status);
          setAssignments([]);
          return;
        }
        const { data } = await response.json();
        setAssignments(data ?? []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    }

    fetchAssignments();
  }, [classroom.classroomId]);

  function handleStart(id: string) {
    setStartedMap((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ---------- Header (คงที่ ไม่เลื่อน) ---------- */}
      <div className="px-2 lg:px-5 pt-5 pb-2">
        <div className="flex justify-between items-center w-full  ">
          <div className="flex items-center gap-2">
            <img
              className="size-10 rounded-full"
              src="https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
              alt=""
            />
            <p className="font-prompt  text-base lg:text-xl font-semibold text-[#233A2C]">
              สวัสดี, {studentName} 👋
            </p>
          </div>
          <div className="flex justify-end mt-2 gap-2">
            <div className="border flex flex-col lg:flex-row justify-center  items-center border-gray-200 rounded-2xl  p-2 lg:p-4  w-fit">
              <span className="font-prompt flex items-center space-x-1 text-[13px] font-semibold text-[#6B8A76]">
                <School size={16} />
                <p>ห้องเรียน {classroom.name}</p>
              </span>
              <span className="font-prompt flex items-center ml-2  space-x-1 text-[13px] font-semibold text-[#6B8A76]">
                <UserStar size={16} />
                <p className="font-sarabun text-[13px]  font-semibold text-[#6B8A76]">
                  {classroom.teacher}
                </p>
              </span>
            </div>
          </div>
        </div>

        <p className="font-prompt mt-2 text-sm ml-2 font-semibold text-[#9fa3a1]">
          งานที่ต้องทำ {assignments.length} งาน
        </p>
      </div>

      {/* ---------- Feed แบบปัดขึ้น-ลง ด้วย Swiper ---------- */}
      {loadingAssignments ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="font-prompt text-sm text-[#6B8A76]">
            กำลังโหลดงาน...
          </span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="font-prompt text-sm text-[#6B8A76]">
            ยังไม่มีงานที่ต้องทำ 🎉
          </span>
        </div>
      ) : (
        <Swiper
          direction="vertical"
          modules={[Mousewheel]}
          mousewheel={{ forceToAxis: true }}
          slidesPerView={1}
          speed={550}
          resistanceRatio={0.6}
          className="min-h-0 w-full flex-1 overflow-hidden"
          style={{ height: "100%" }}
        >
          {assignments.map((item, idx) => (
            <SwiperSlide key={item.id}>
              <AssignmentCard
                data={item}
                started={!!startedMap[item.id]}
                onStart={handleStart}
                isLast={idx === assignments.length - 1}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}