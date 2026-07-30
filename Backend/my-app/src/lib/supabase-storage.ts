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