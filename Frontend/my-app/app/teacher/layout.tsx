// app/teacher/layout.tsx
import Sidebar from "./(components)/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full  ">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto min-w-[500px]">{children}</main>
    </div>
  );
}