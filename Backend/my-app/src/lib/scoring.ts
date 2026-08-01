import { countThaiWords } from "./thai-tokenizer";

export type SpeedFlag = "slow" | "fast" | "ok";
export type AttemptStatus = "passed" | "failed";

export type ScoringInput = {
    transcriptText: string;
    durationSeconds: number;
    totalErrors: number;
    minWpm: number;
    maxWpm: number;
    maxAllowedErrors: number;
};

export type ScoringResult = {
    wpm: number;
    speedFlag: SpeedFlag;
    status: AttemptStatus;
};

/**
 * คำนวณ WPM จาก transcript ที่นักเรียนอ่านจริง (ไม่ใช่จากบทความต้นฉบับ)
 * เพราะถ้าอ่านตกคำ/เพิ่มคำ ความเร็วจริงต้องอิงจากสิ่งที่พูดออกมาจริง
 */
export function calculateWpm(
    transcriptText: string,
    durationSeconds: number
): number {
    if (durationSeconds <= 0) return 0;

    const wordCount = countThaiWords(transcriptText);
    const wpm = (wordCount / durationSeconds) * 60;

    return Math.round(wpm * 100) / 100; // ปัดทศนิยม 2 ตำแหน่ง ให้ตรงกับ numeric(6,2) ใน DB
}

function getSpeedFlag(wpm: number, minWpm: number, maxWpm: number): SpeedFlag {
    if (wpm < minWpm) return "slow";
    if (wpm > maxWpm) return "fast";
    return "ok";
}

/**
 * ประเมินผลรวม: ผ่าน/ไม่ผ่าน ต้องทั้งความเร็วอยู่ในเกณฑ์ "ok"
 * และจำนวนคำผิดไม่เกิน max_allowed_errors พร้อมกันทั้งสองเงื่อนไข
 */
export function evaluateAttempt(input: ScoringInput): ScoringResult {
    const wpm = calculateWpm(input.transcriptText, input.durationSeconds);
    const speedFlag = getSpeedFlag(wpm, input.minWpm, input.maxWpm);

    const passed = speedFlag === "ok" && input.totalErrors <= input.maxAllowedErrors;

    return {
        wpm,
        speedFlag,
        status: passed ? "passed" : "failed",
    };
}