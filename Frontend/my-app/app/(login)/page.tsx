"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const demoAccounts = {
  teacher: {
    label: "ครู",
    email: "teacher@gmail.com",
    password: "12345678",
  },
  student: {
    label: "นักเรียน",
    email: "student01@gmail.com",
    password: "12345678",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<keyof typeof demoAccounts>("student");
  const account = useMemo(() => demoAccounts[selectedRole], [selectedRole]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      email: account.email,
      password: account.password,
      callbackURL: selectedRole === "teacher" ? "/teacher" : "/student",
    });
    setLoading(false);
    console.log("Login response:", { data, error });
    if (error) {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    router.push(selectedRole === "teacher" ? "/teacher" : "/student");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#eef4ec] to-[#f7faf6] p-6 font-sans">
      <div className="w-full max-w-[360px] bg-white rounded-[28px] shadow-[0_20px_45px_rgba(30,90,40,0.10)] px-7 pt-10 flex flex-col items-center overflow-hidden">
        {/* Logo */}
        <img src="logo-ai.png" className="size-34 mb-4" alt="" />
        <div className="flex items-center gap-2 mb-4">

          <span className="text-2xl font-extrabold text-[#46c000] tracking-wide">
            เว็บไซต์ช่างพูด (Demo)
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-neutral-800 m-0">
          ยินดีต้อนรับ
        </h1>
        <p className="text-sm text-neutral-400 mt-1 mb-7">เข้าสู่ระบบ</p>
        <div className="w-full border-[#d9e6d5] flex border  rounded-full mb-4">
          <button
            type="button"
            onClick={() => setSelectedRole("teacher")}
            className={`flex-1 h-11 rounded-full cursor-pointer  text-sm font-semibold transition ${selectedRole === "teacher"
                ? "border-[#00A651] bg-[#00A651] text-white"
                : " bg-white text-neutral-600"
              }`}
          >
            เข้าครู
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`flex-1 cursor-pointer h-11 rounded-full  text-sm font-semibold transition ${selectedRole === "student"
                ? "border-[#00A651] bg-[#00A651] text-white"
                : " bg-white text-neutral-600"
              }`}
          >
            เข้านักเรียน
          </button>
        </div>
        <div className="w-full space-y-3 mb-6">
          <input
            type="text"
            value={account.email}
            onChange={() => undefined}
            className="w-full h-12 rounded-2xl border border-[#d9e6d5] bg-[#f8faf7] px-4 text-sm text-neutral-700 outline-none focus:border-[#00A651]"
            placeholder="อีเมล หรือชื่อผู้ใช้"
          />
          <input
            type="text"
            value={account.password}
            onChange={() => undefined}
            className="w-full h-12 rounded-2xl border border-[#d9e6d5] bg-[#f8faf7] px-4 text-sm text-neutral-700 outline-none focus:border-[#00A651]"
            placeholder="รหัสผ่าน"
          />
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4 text-center">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[52px] mb-8 rounded-full border-none bg-gradient-to-br from-[#6cbf3f] to-[#29ce04] text-white text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_18px_rgba(0,166,81,0.28)] hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : `เข้าสู่ระบบด้วย ${account.label}`}
        </button>
      </div>
    </div>
  );
}