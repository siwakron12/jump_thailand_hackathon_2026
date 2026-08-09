// app/teacher/_components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/teacher", icon: Home, label: "หน้าหลัก" },
  { href: "/teacher/classes", icon: User, label: "ห้องเรียน" },
  { href: "/teacher/work", icon: FileText, label: "การบ้าน" },
  { href: "/teacher/students", icon: Users, label: "นักเรียน" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative flex flex-col items-center py-6 gap-2 bg-[#2f6b3a] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className=" flex items-center justify-center w-full px-3">
        {collapsed ? (
          <img
            src="/logo-ai.png"
            alt="Logo"
            className="size-10 object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img src="/logo-ai.png" alt="Logo" className="size-18 " />
            <p className="text-lg font-medium">ช่างพูด</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 w-full px-3">
        {menuItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                active
                  ? "bg-white text-[#2f6b3a] shadow"
                  : "text-white/90 hover:bg-white/10"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={22} />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#8bc34a] flex items-center justify-center shadow-md hover:bg-[#7cb342] transition-colors"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
