"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Clock,
  BookOpen,
  Target,
  ChevronDown,
  Mic,
  Users,
  School,
  UserStar,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";

interface AssignmentItem {
  id: string;
  title: string;
  emoji: string;
  passageText: string;
  minWpm: number;
  maxWpm: number;
  dueAt: string;
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
  classroomId: "classroom-1",
};

const PENDING_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "a1",
    title: "กระต่ายกับเต่า",
    emoji: "🐢",
    passageText:
      "กาลครั้งหนึ่งนานมาแล้ว มีกระต่ายตัวหนึ่งที่วิ่งเร็วมาก มันชอบอวดว่าตัวเองวิ่งเร็วที่สุดในป่า วันหนึ่งเต่าตัวหนึ่งเดินผ่านมาช้าๆ กระต่ายจึงหัวเราะเยาะเต่าว่าเดินช้าเหมือนคนขี้เกียจ เต่าจึงท้าให้กระต่ายแข่งวิ่งกันดู กระต่ายรับคำท้าทันทีเพราะมั่นใจว่าตัวเองจะชนะแน่นอน เมื่อเริ่มแข่งขัน กระต่ายวิ่งนำไปไกลมาก จนคิดว่ามีเวลาเหลือเฟือ จึงแวะนอนพักใต้ต้นไม้ใหญ่ ส่วนเต่าเดินต่อไปเรื่อยๆ อย่างไม่ย่อท้อ สุดท้ายเต่าเดินถึงเส้นชัยก่อนกระต่ายที่ยังนอนหลับอยู่ นิทานเรื่องนี้สอนให้รู้ว่า ความขยันและความสม่ำเสมอ ย่อมเอาชนะความเร็วที่ประมาทได้เสมอ",
    minWpm: 40,
    maxWpm: 120,
    dueAt: "20 ส.ค. 2567",
  },
  {
    id: "a2",
    title: "ลูกหมูสามตัว",
    emoji: "🐷",
    passageText:
      "ลูกหมูสามตัวออกจากบ้านไปสร้างบ้านของตัวเอง ตัวแรกสร้างบ้านด้วยฟาง ตัวที่สองสร้างด้วยไม้ ส่วนตัวที่สามสร้างด้วยอิฐอย่างตั้งใจ วันหนึ่งหมาป่าตัวร้ายมาเป่าบ้านฟางจนพังทลาย ลูกหมูตัวแรกวิ่งหนีไปบ้านตัวที่สอง หมาป่าเป่าบ้านไม้จนพังอีกเช่นกัน ลูกหมูทั้งสองจึงวิ่งไปหลบที่บ้านอิฐของตัวที่สาม หมาป่าพยายามเป่าเท่าไรบ้านอิฐก็ไม่พังเลย สุดท้ายหมาป่าจึงยอมแพ้และหนีไป",
    minWpm: 40,
    maxWpm: 120,
    dueAt: "22 ส.ค. 2567",
  },
  {
    id: "a3",
    title: "มดกับตั๊กแตน",
    emoji: "🐜",
    passageText:
      "ในฤดูร้อน ตั๊กแตนร้องเพลงเล่นทั้งวันอย่างสบายใจ ขณะที่มดขยันขนอาหารเก็บไว้ในรัง ตั๊กแตนหัวเราะเยาะมดว่าทำงานหนักเกินไป เมื่อฤดูหนาวมาถึง อาหารเริ่มขาดแคลน ตั๊กแตนหิวโหยจึงไปขอความช่วยเหลือจากมด มดจึงแบ่งอาหารที่เก็บไว้ให้ตั๊กแตนได้กินอย่างอบอุ่นใจ",
    minWpm: 40,
    maxWpm: 120,
    dueAt: "25 ส.ค. 2567",
  },
];

function estimateMinutes(text: string, minWpm: number, maxWpm: number): string {
  const words = text.trim().split(/\s+/).length;
  const maxMin = Math.max(1, Math.round(words / minWpm));
  const minMin = Math.max(1, Math.round(words / maxWpm));
  return `${minMin}-${maxMin} นาที`;
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

          <div className="flex h-25 lg:h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E7F6EB] to-[#FFF3E4] text-6xl">
            {data.emoji}
          </div>

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
            กำหนดส่ง: {data.dueAt}
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
        <></>
        // <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3.5 rounded-3xl border border-[#DCEEE0] bg-white p-5">
        //   <div className="flex items-center gap-2.5">
        //     <span className="text-3xl">{data.emoji}</span>
        //     <h2 className="font-prompt m-0 text-lg font-bold text-[#233A2C]">
        //       {data.title}
        //     </h2>
        //   </div>

        //   <div className="flex-1 overflow-y-auto rounded-2xl bg-[#F4FBF3] p-4">
        //     <p className="font-sarabun m-0 text-[17px] leading-[1.9] text-[#233A2C]">
        //       {data.passageText}
        //     </p>
        //   </div>

        //   <button className="font-prompt flex items-center justify-center gap-2 rounded-full bg-[#FF9D4D] py-4 text-base font-semibold text-white">
        //     <Mic size={20} />
        //     กดเพื่ออ่านออกเสียง
        //   </button>
        // </div>
      )}
    </div>
  );
}

export default function StudentHomeFeed() {
  const [studentName, setStudentName] = useState("น้องอุ่นใจ");
  const [classroom, setClassroom] = useState(DEFAULT_CLASSROOM);
  const [startedMap, setStartedMap] = useState<Record<string, boolean>>({});

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

    fetchSession();
    fetchClass();
  }, []);

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

        {/* <div className="mt-2 flex items-center justify-between rounded-xl border border-[#73cc44] p-3.5 shadow-xl shadow-gray-100">
          <div>
            <p className="font-prompt m-0 text-base font-bold text-[#233A2C]">
              {classroom.name}
            </p>
          
            <div className="mt-1.5 flex items-center gap-1">
              <Users size={13} className="text-[#6B8A76]" />
              <span className="font-sarabun text-xs text-[#6B8A76]">
                {classroom.studentCount} คน
              </span>
            </div>
          </div>
          <div className="text-4xl">🧒</div>
        </div> */}

        <p className="font-prompt mt-2 text-sm ml-2 font-semibold text-[#9fa3a1]">
          งานที่ต้องทำ {PENDING_ASSIGNMENTS.length} งาน
        </p>
      </div>

      {/* ---------- Feed แบบปัดขึ้น-ลง ด้วย Swiper ---------- */}
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
        {PENDING_ASSIGNMENTS.map((item, idx) => (
          <SwiperSlide key={item.id}>
            <AssignmentCard
              data={item}
              started={!!startedMap[item.id]}
              onStart={handleStart}
              isLast={idx === PENDING_ASSIGNMENTS.length - 1}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
