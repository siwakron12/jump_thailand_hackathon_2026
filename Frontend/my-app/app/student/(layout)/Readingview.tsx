"use client";

import { useRef, useState } from "react";
import { Mic, Square, Loader2, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

interface ReadingViewProps {
  id: string;
  emoji: string;
  title: string;
  passageText: string;
}

type Status = "idle" | "recording" | "submitting" | "success" | "error";

export default function ReadingView({
  id,
  emoji,
  title,
  passageText,
}: ReadingViewProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const durationSeconds = Math.round(
          (Date.now() - startTimeRef.current) / 1000,
        );
        const audioBlob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        submitAttempt(audioBlob, durationSeconds);
      };

      startTimeRef.current = Date.now();
      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("Mic permission / recording error:", err);
      setErrorMsg("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้งานไมค์");
      setStatus("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function submitAttempt(audioBlob: Blob, durationSeconds: number) {
    setStatus("submitting");
    try {
      const formData = new FormData();
      const ext = audioBlob.type.includes("wav") ? "wav" : "webm";
      formData.append("audio", audioBlob, `attempt.${ext}`);
      formData.append("durationSeconds", String(durationSeconds));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/attempts/${id}/submit`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        console.error("Submit attempt failed:", response.status);
        setErrorMsg("ส่งคลิปเสียงไม่สำเร็จ กรุณาลองใหม่");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      console.error("Error submitting attempt:", err);
      setErrorMsg("เกิดข้อผิดพลาดในการส่งคลิปเสียง");
      setStatus("error");
    }
  }

  function handleMicClick() {
    if (status === "idle" || status === "success" || status === "error") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }

  function handleRetry() {
    setErrorMsg(null);
    setStatus("idle");
  }

  return (
    <div className="mt-4 max-h-130 flex min-h-0 flex-1 flex-col gap-3.5 rounded-3xl border border-[#DCEEE0] bg-white p-5">
      <div className="flex items-center gap-2.5">
        {/* <span className="text-3xl">{emoji}</span> */}
        <h2 className="font-prompt m-0 text-lg font-bold text-[#233A2C]">
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto max-h-125 rounded-2xl bg-[#F4FBF3] p-4">
        <p className="font-sarabun m-0 text-[17px] leading-[1.9] text-[#233A2C]">
          {passageText}
        </p>
      </div>

      {status === "success" && (
        <div className="font-prompt flex items-center justify-center gap-2 text-sm font-semibold text-[#048921]">
          <CheckCircle2 size={18} />
          ส่งคลิปเสียงสำเร็จแล้ว
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="font-prompt flex items-center justify-center gap-2 text-sm font-semibold text-red-500">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {status === "success" ? (
        <button
          onClick={handleRetry}
          className="font-prompt flex items-center justify-center gap-2 rounded-full bg-[#73cc44] py-4 text-base font-semibold text-white"
        >
          <RotateCcw size={20} />
          ลองอ่านใหม่
        </button>
      ) : status === "submitting" ? (
        <button
          disabled
          className="font-prompt flex items-center justify-center gap-2 rounded-full bg-[#FF9D4D] py-4 text-base font-semibold text-white opacity-70"
        >
          <Loader2 size={20} className="animate-spin" />
          กำลังส่งคลิปเสียง...
        </button>
      ) : (
        <button
          onClick={handleMicClick}
          className={`font-prompt flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold text-white transition ${
            status === "recording"
              ? "bg-red-500 animate-pulse"
              : "bg-[#FF9D4D]"
          }`}
        >
          {status === "recording" ? (
            <>
              <Square size={20} />
              หยุดอัดและส่ง
            </>
          ) : (
            <>
              <Mic size={20} />
              {status === "error" ? "ลองอัดใหม่" : "กดเพื่ออ่านออกเสียง"}
            </>
          )}
        </button>
      )}
    </div>
  );
}