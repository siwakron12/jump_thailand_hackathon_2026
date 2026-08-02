"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, User } from "lucide-react";

const navItems = [
  { label: "คลังอ่าน", href: "/student", icon: Home },
  { label: "งานของฉัน", href: "/student/tasks", icon: ClipboardList },
  { label: "โปรไฟล์", href: "/student/profile", icon: User },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border rounded-2xl w-full lg:w-2/4 mx-auto border-[#d4d5d3]">
      <div className="max-w-[480px] mx-auto flex items-center justify-around px-4 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className="flex flex-col items-center cursor-pointer gap-1 py-1 px-3"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "color-button" : "text-neutral-400"}
              />
              <span
                className={`text-[14px] font-bold ${
                  isActive ? "color-button" : "text-neutral-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}