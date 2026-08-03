"use client";

import { tokenizeThai } from "@/lib/thai-tokenizer";

export type ErrorType = "substitution" | "omission" | "insertion";

export interface WordError {
  wordIndex: number;
  expectedWord: string;
  actualWord: string;
  errorType: ErrorType;
}

interface TranscriptHighlightProps {
  passageText: string;
  errors: WordError[];
}

type WordStatus = "correct" | "incorrect" | "omitted";

export default function TranscriptHighlight({
  passageText,
  errors,
}: TranscriptHighlightProps) {
  const words = tokenizeThai(passageText);

  // map wordIndex -> error สำหรับ substitution/omission (ผูกกับคำที่มีอยู่จริงใน passage)
  const errorByIndex = new Map<number, WordError>();
  // เก็บ insertion แยก เพราะไม่ได้ชี้ไปที่คำใน passage แต่เป็นคำที่พูด "แทรก" เข้ามา
  const insertionsByIndex = new Map<number, WordError[]>();

  for (const err of errors) {
    if (err.errorType === "insertion") {
      const list = insertionsByIndex.get(err.wordIndex) ?? [];
      list.push(err);
      insertionsByIndex.set(err.wordIndex, list);
    } else {
      errorByIndex.set(err.wordIndex, err);
    }
  }

  function getStatus(index: number): WordStatus {
    const err = errorByIndex.get(index);
    if (!err) return "correct";
    return err.errorType === "omission" ? "omitted" : "incorrect";
  }

  const statusStyles: Record<WordStatus, string> = {
    correct: "text-green-500",
    incorrect: " text-red-600 rounded px-0.5",
    omitted: "bg-neutral-200 text-neutral-400 rounded px-0.5 line-through",
  };

  return (
    <div className="font-sarabun text-[19px] leading-[2.15rem]">
      <p className="m-0">
        {words.map((word, idx) => {
          const status = getStatus(idx);
          const err = errorByIndex.get(idx);
          const insertions = insertionsByIndex.get(idx) ?? [];

          return (
            <span key={idx}>
              <span
                className={statusStyles[status]}
                title={
                  err
                    ? `อ่านเป็น "${err.actualWord}" (ที่ถูก: "${err.expectedWord}")`
                    : undefined
                }
              >
                {word}
              </span>
              {insertions.map((ins, i) => (
                <span
                  key={i}
                  className="mx-0.5 rounded bg-orange-100 px-1 text-orange-600 text-sm"
                  title="คำที่พูดเกินมา (ไม่มีในบท)"
                >
                  +{ins.actualWord}
                </span>
              ))}
            </span>
          );
        })}
      </p>

      {/* คำอธิบายสี */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-[#233A2C]" /> อ่านถูก
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-red-400" /> อ่านผิด
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-neutral-300" /> ข้าม/ไม่ได้อ่าน
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-orange-300" /> พูดเกินมา
        </span>
      </div>
    </div>
  );
}