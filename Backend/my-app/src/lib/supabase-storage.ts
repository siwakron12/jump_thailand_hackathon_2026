import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "assignment-audio";

export async function uploadReferenceAudio(
  assignmentId: string,
  file: File | Blob,
  filename = "reference.webm"
) {
  const path = `${assignmentId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true, // อัปเดตทับได้ถ้าครูอัปโหลดใหม่
      contentType: "audio/webm",
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteReferenceAudio(assignmentId: string, filename = "reference.webm") {
  const path = `${assignmentId}/${filename}`;
  await supabase.storage.from(BUCKET).remove([path]);
}

//student 
// เพิ่มต่อท้ายไฟล์เดิม (จากส่วน reference audio ที่ทำไว้ก่อนหน้า)

const STUDENT_BUCKET = "student-recordings";

export async function uploadStudentRecording(
  attemptId: string,
  file: File | Blob,
  filename = "recording.webm"
) {
  const path = `${attemptId}/${filename}`;

  const { error } = await supabase.storage
    .from(STUDENT_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: "audio/webm",
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STUDENT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}