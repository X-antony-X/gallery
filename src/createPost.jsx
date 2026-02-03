import { supabase } from "./createClient.jsx";

export async function createPost(description, images) {
  const { error } = await supabase
    .from("gallery")
    .insert([
      {
        description,
        images
      }
    ]);

  if (error) throw error;
}
