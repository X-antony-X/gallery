import { supabase } from "./createClient";

export async function deletePost(postId) {
  if (!postId) throw new Error("Post ID is required");

  const { data: post, error: fetchError } = await supabase
    .from("gallery")
    .select("images")
    .eq("id", postId)
    .single();

  if (fetchError) {
    console.error(fetchError);
    throw new Error("Failed to fetch post images");
  }

  const imageUrls = post.images || [];

  if (imageUrls.length > 0) {
    const paths = imageUrls
    .map((url) => {
        const parts = url.split("/storage/v1/object/public/images/");
        return parts[1] || null; // gallery/filename.jpg
    })
    .filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from("images")
        .remove(paths);

      if (storageError) {
        console.error(storageError);
        throw new Error("Failed to delete images from storage");
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("gallery")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    console.error(deleteError);
    throw new Error("Failed to delete post");
  }
}

export default deletePost