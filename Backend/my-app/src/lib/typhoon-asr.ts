// src/lib/typhoon-asr.ts
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.TYPHOON_API_KEY,
    baseURL: "https://api.opentyphoon.ai/v1",
});

const MODEL = "typhoon-asr-realtime";

export type WordTimestamp = {
    word: string;
    start: number; // วินาที
    end: number;
};

export type TranscribeResult = {
    text: string;
    words: WordTimestamp[]; // ว่างเปล่าถ้า API ไม่รองรับ word timestamp
};

/**
 * ส่งไฟล์เสียงเต็มไป transcribe ครั้งเดียว (batch)
 */
export async function transcribeFullAudio(
    audioBuffer: Buffer,
    filename = "attempt.webm"
): Promise<TranscribeResult> {
    const file = new File([new Uint8Array(audioBuffer)], filename, { type: guessMimeType(filename) });

    try {
        // พยายามขอ word-level timestamp ก่อน (ตาม OpenAI-compatible spec)
        const transcription = (await client.audio.transcriptions.create({
            file,
            model: MODEL,
            response_format: "verbose_json",
            // timestamp_granularities: ["word"],
        } as any)) as any;
        const words: WordTimestamp[] = (transcription.words ?? []).map(
            (w: any) => ({
                word: w.word,
                start: w.start,
                end: w.end,
            })
        );

        return { text: transcription.text, words };
    } catch (err) {
        // ถ้า API ไม่รองรับ verbose_json/word timestamp ให้ fallback เป็นแบบ text ธรรมดา
        console.warn(
            "verbose_json/word timestamps ไม่รองรับ, fallback เป็น text ธรรมดา:",
            err
        );

        const fallback = await client.audio.transcriptions.create({
            file,
            model: MODEL,
        });

        return { text: fallback.text, words: [] };
    }
}

function guessMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "mp3":
            return "audio/mp3"; // 👈 เปลี่ยนจาก "audio/mpeg" เป็น "audio/mp3"
        case "wav":
            return "audio/wav";
        case "webm":
            return "audio/webm";
        case "ogg":
            return "audio/ogg";
        case "flac":
            return "audio/flac";
        default:
            return "audio/mp3";
    }
}