// src/lib/thai-tokenizer.ts
const segmenter = new Intl.Segmenter("th", { granularity: "word" });

/** ตัดข้อความไทยเป็น array คำ (กรองช่องว่าง/วรรคตอนออก) */
export function tokenizeThai(text: string): string[] {
  const segments = segmenter.segment(text.trim());
  const words: string[] = [];
  for (const seg of segments) {
    if (seg.isWordLike) words.push(seg.segment);
  }
  return words;
}

/** นับจำนวนคำ ใช้ตอนสร้างโจทย์ */
export function countThaiWords(text: string): number {
  return tokenizeThai(text).length;
}