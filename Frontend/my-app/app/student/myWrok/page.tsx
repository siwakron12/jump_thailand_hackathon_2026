"use client";

import React, { useEffect, useState } from "react";
import TopBar from "../(layout)/topBar";
import { NotebookPen } from "lucide-react";

type Attempt = {
    attemptId: string;
    attemptNo: number;
    transcriptText: string | null;
    durationSeconds: number;
    audio_url: string | null;
    status: string;
    speed_flag: string;

    assignmentId: string;
    title: string;
    passageText: string;
    wordCount: number;
    dueAt: string;
    imgUrl: string | null;
};

export default function Page() {
    const [data, setData] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/student/assignments/my-assignments")
            .then((res) => res.json())
            .then((res) => {
                setData(res.data || []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="px-2 lg:px-5 pt-5 pb-2">
            <TopBar />

            <h1 className="text-xl flex items-center gap-2 font-bold mb-4 mt-2"><NotebookPen className="text-green-800" /> <p>งานของฉัน</p></h1>

            {loading && <p>Loading...</p>}

            {!loading && data.length === 0 && (
                <p className="text-gray-500">ยังไม่มีงานที่เคยทำ</p>
            )}

            <div className="grid gap-4  overflow-y-auto max-h-[calc(100vh-220px)]">
                {data.map((item) => (
                    <div
                        key={item.attemptId}
                        className="bg-white rounded-2xl shadow p-4 border border-[#73cc44]"
                    >
                        {/* Title */}
                        <h2 className="font-semibold text-lg">{item.title}</h2>

                        {/* Meta */}
                        <div className="text-sm text-gray-500 mt-1 flex gap-3 flex-wrap">
                            <span>ครั้งที่ {item.attemptNo}</span>
                            <span>⏱ {item.durationSeconds}s</span>
                            <span>📖 {item.wordCount} คำ</span>
                        </div>

                        {/* Status */}
                        <div className="my-2">
                            <span
                                className={`px-2  py-1 text-xs rounded-full ${item.status === "PASS"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {item.status === "PASS" ? "ระบบให้ผ่าน" : "ระบบไม่ให้ผ่าน"}
                            </span>
                        </div>

                        <p className="text-base text-gray-700 mt-2 line-clamp-2">
                            <span className="text-green-600 font-bold"> บทความ : </span>
                            {item.passageText}
                        </p>


                        {/* Transcript preview */}
                        {item.transcriptText && (
                            <p className="text-base text-gray-700 mt-2 line-clamp-2">
                                <span className="text-orange-600 font-bold"> คำที่ได้ยิน : </span>
                                {item.transcriptText}
                            </p>
                        )}

                        {/* Audio */}
                        {item.audio_url ? (
                            <audio controls className="mt-3 w-full">
                                <source src={item.audio_url} />
                            </audio>
                        ) : <div>
                            <p className="text-sm mt-2 text-gray-500">ระบบไม่พบไฟล์เสียง</p>
                        </div>}
                    </div>
                ))}
            </div>
        </div>
    );
}