import { supabase } from "./createClient.jsx";

export async function uploadImages(files) {
  const urls = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${ext}`;
    const filePath = `gallery/${fileName}`;

    const { error } = await supabase
      .storage
      .from("images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase
      .storage
      .from("images")
      .getPublicUrl(filePath);

    urls.push(data.publicUrl);
  }

  return urls;
}
