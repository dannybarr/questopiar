import { supabase } from "@/integrations/supabase/client";
import type { JournalPhoto } from "@/lib/store";

export async function uploadQuestPhoto(questId: string, file: File): Promise<JournalPhoto> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = crypto.randomUUID();
  const path = `${questId}/${id}.${ext}`;
  const { error } = await supabase.storage.from("quest-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("quest-photos").getPublicUrl(path);
  return { id, url: data.publicUrl, path, addedAt: Date.now() };
}

export async function deleteQuestPhoto(path?: string) {
  if (!path) return;
  await supabase.storage.from("quest-photos").remove([path]);
}
