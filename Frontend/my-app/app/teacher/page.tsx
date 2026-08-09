// app/teacher/page.tsx

export default function TeacherPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">หน้าหลัก</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">ห้องเรียนทั้งหมด</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">4</h2>
          <p className="text-xs text-gray-400">ห้อง</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl">
          <p className="text-sm text-gray-500">นักเรียนทั้งหมด</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">96</h2>
          <p className="text-xs text-gray-400">คน</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl">
          <p className="text-sm text-gray-500">การบ้าน</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">12</h2>
          <p className="text-xs text-gray-400">ชิ้น</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h2 className="font-semibold mb-4 text-gray-700">ห้องเรียนล่าสุด</h2>

        <ul className="divide-y divide-gray-100">
          {[
            { name: "ป.2/1", count: 25 },
            { name: "ป.3/2", count: 24 },
            { name: "ป.4/1", count: 23 },
            { name: "ป.5/1", count: 24 },
          ].map((room) => (
            <li key={room.name} className="flex justify-between items-center py-3">
              <span className="flex items-center gap-2 text-gray-700">
                <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" />
                {room.name}
              </span>
              <span className="text-gray-400 text-sm">{room.count} นักเรียน</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}