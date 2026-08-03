// src/lib/typhoon-asr.ts
import OpenAI from "openai";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";

const client = new OpenAI({
  apiKey: process.env.TYPHOON_API_KEY,
  baseURL: "https://api.opentyphoon.ai/v1",
});

const MODEL = "typhoon-asr-realtime";

// Typhoon รองรับแค่ wav, flac, mp3, ogg, opus เท่านั้น (ไม่รองรับ webm ที่ browser อัดมา)
const SUPPORTED_EXTENSIONS = new Set(["wav", "flac", "mp3", "ogg", "opus"]);

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
 * แปลง buffer เสียง (webm, mp4, ฯลฯ) เป็น wav 16kHz mono ด้วย ffmpeg ผ่าน pipe
 * ไม่ต้องเขียนไฟล์ temp ลง disk
 */
function convertToWav(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg-static binary path not found"));
      return;
    }

    const ffmpeg = spawn(ffmpegPath, [
      "-i", "pipe:0",   // อ่าน input จาก stdin
      "-f", "wav",
      "-ar", "16000",   // 16kHz พอสำหรับ ASR
      "-ac", "1",       // mono
      "pipe:1",         // เขียน output ไปที่ stdout
    ]);

    const outChunks: Buffer[] = [];
    let stderrLog = "";

    ffmpeg.stdout.on("data", (chunk) => outChunks.push(chunk));
    ffmpeg.stderr.on("data", (chunk) => {
      stderrLog += chunk.toString();
    });

    ffmpeg.on("error", (err) => reject(err));

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderrLog}`));
        return;
      }
      resolve(Buffer.concat(outChunks));
    });

    ffmpeg.stdin.on("error", () => {
      // เกิดขึ้นได้ถ้า ffmpeg ปิด stdin เร็วกว่า write เสร็จ ปล่อยให้ event 'close' จัดการ error จริงต่อ
    });
    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

/**
 * ส่งไฟล์เสียงเต็มไป transcribe ครั้งเดียว (batch)
 * ถ้า filename ไม่ใช่ format ที่ Typhoon รองรับ จะแปลงเป็น wav ให้อัตโนมัติก่อนส่ง
 */
export async function transcribeFullAudio(
  audioBuffer: Buffer,
  filename = "attempt.webm",
): Promise<TranscribeResult> {
  let finalBuffer = audioBuffer;
  let finalFilename = filename;

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    try {
      finalBuffer = await convertToWav(audioBuffer);
      finalFilename = filename.replace(/\.[^.]+$/, "") + ".wav";
    } catch (convertErr) {
      console.error("ffmpeg convert to wav failed:", convertErr);
      throw new Error("ไม่สามารถแปลงไฟล์เสียงเป็นรูปแบบที่รองรับได้");
    }
  }

  const file = new File([new Uint8Array(finalBuffer)], finalFilename, {
    type: guessMimeType(finalFilename),
  });

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
      }),
    );

    return { text: transcription.text, words };
  } catch (err) {
    // ถ้า API ไม่รองรับ verbose_json/word timestamp ให้ fallback เป็นแบบ text ธรรมดา
    console.warn(
      "verbose_json/word timestamps ไม่รองรับ, fallback เป็น text ธรรมดา:",
      err,
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
      return "audio/mp3";
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