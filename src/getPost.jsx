import { supabase } from "./createClient.jsx";

export async function getPosts() {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}
