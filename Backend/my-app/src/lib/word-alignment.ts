import { tokenizeThai } from "./thai-tokenizer";

export type ErrorType = "substitution" | "omission" | "insertion";

export type WordError = {
    wordIndex: number;
    expectedWord: string;
    actualWord: string | null;
    errorType: ErrorType;
};

export type AlignmentResult = {
    errors: WordError[];
    totalErrors: number; // substitution + omission เท่านั้น (คำที่อ่าน "พลาด" จริงๆ)
    substitutionCount: number;
    omissionCount: number;
    insertionCount: number; // พูดเกิน ไม่นับเป็นคำผิดของการอ่าน แต่เก็บไว้ดู
    matchedCount: number;
    expectedWordCount: number;
};

function editDistanceAlign(expected: string[], actual: string[]) {
    const n = expected.length;
    const m = actual.length;

    // dp[i][j] = จำนวนการแก้ไขน้อยสุดเพื่อแปลง expected[0..i) ให้เป็น actual[0..j)
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
        new Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (expected[i - 1] === actual[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // ตรงกัน ไม่มี cost
            } else {
                dp[i][j] =
                    1 +
                    Math.min(
                        dp[i - 1][j - 1], // substitution
                        dp[i - 1][j], // omission
                        dp[i][j - 1] // insertion
                    );
            }
        }
    }

    // backtrack จากมุมขวาล่างกลับไปจุดเริ่มต้น เพื่อไล่ดูว่าแต่ละก้าวเป็น op ไหน
    const errors: WordError[] = [];
    let matchedCount = 0;
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && expected[i - 1] === actual[j - 1]) {
            matchedCount++;
            i--;
            j--;
            continue;
        }

        const diagCost = i > 0 && j > 0 ? dp[i - 1][j - 1] : Infinity;
        const upCost = i > 0 ? dp[i - 1][j] : Infinity;
        const leftCost = j > 0 ? dp[i][j - 1] : Infinity;
        const minCost = Math.min(diagCost, upCost, leftCost);

        if (i > 0 && j > 0 && diagCost === minCost) {
            errors.push({
                wordIndex: i - 1,
                expectedWord: expected[i - 1],
                actualWord: actual[j - 1],
                errorType: "substitution",
            });
            i--;
            j--;
        } else if (i > 0 && upCost === minCost) {
            errors.push({
                wordIndex: i - 1,
                expectedWord: expected[i - 1],
                actualWord: null,
                errorType: "omission",
            });
            i--;
        } else {
            errors.push({
                wordIndex: i, // อ้างอิงตำแหน่ง "ก่อนคำที่ i" ในบทความ (ยังไม่ถึงคำนี้)
                expectedWord: "",
                actualWord: actual[j - 1],
                errorType: "insertion",
            });
            j--;
        }
    }

    errors.reverse(); // backtrack ไล่จากท้ายมาหน้า ต้องกลับลำดับให้ตรงกับบทความจริง

    return { errors, matchedCount };
}

export function alignPassageWithTranscript(
    passageText: string,
    transcriptText: string
): AlignmentResult {
    const expected = tokenizeThai(passageText);
    const actual = tokenizeThai(transcriptText);

    const { errors, matchedCount } = editDistanceAlign(expected, actual);

    const substitutionCount = errors.filter((e) => e.errorType === "substitution").length;
    const omissionCount = errors.filter((e) => e.errorType === "omission").length;
    const insertionCount = errors.filter((e) => e.errorType === "insertion").length;

    return {
        errors,
        totalErrors: substitutionCount + omissionCount, // ไม่นับ insertion เป็นคำผิดของการอ่าน
        substitutionCount,
        omissionCount,
        insertionCount,
        matchedCount,
        expectedWordCount: expected.length,
    };
}