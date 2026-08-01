// src/test-asr.ts
import { transcribeFullAudio } from "./typhoon-asr";
import { readFile } from "node:fs/promises";
import { tokenizeThai } from "./thai-tokenizer";
import { alignPassageWithTranscript } from "./word-alignment";
async function main() {
    const audioBuffer = await readFile("./test-audio.mp3"); // 👈 เปลี่ยนเป็น .mp3

    console.log("กำลังส่งไฟล์ไป transcribe...");
    // const result = await transcribeFullAudio(audioBuffer, "test-audio.mp3"); // 👈 เปลี่ยนตรงนี้ด้วย

    console.log("=== ผลลัพธ์ ===");
    // console.log("text:", result.text);
    // console.log("words:", JSON.stringify(result.words, null, 2));

    const alignmentResult = alignPassageWithTranscript(
        "แมววิ่งไปที่สวน",
        "แมวลิ่งไปสวน"
    );
    console.log("=== Alignment Result ===");
    console.log(JSON.stringify(alignmentResult, null, 2));
}

main().catch(console.error);