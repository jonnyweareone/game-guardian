export async function approveYouTubeUpload(clipId: string) {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.functions.invoke("youtube-upload", {
    body: { clip_id: clipId },
  });
  if (error) throw new Error(error.message || "Upload failed");
  return data as { youtube_video_id: string; youtube_url: string };
}

export async function declineClip(clipId: string) {
  const { supabase } = await import("@/integrations/supabase/client");
  // Cast to any to avoid TS type mismatch until types are regenerated
  const client: any = supabase as any;
  const { error } = await client.from("clips").update({ status: "declined" }).eq("id", clipId);
  if (error) throw new Error(error.message || "Decline failed");
  return true;
}
