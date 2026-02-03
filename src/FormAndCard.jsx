import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { uploadImages } from "./uploadImages";
import { createPost } from "./createPost";
import { getPosts } from "./getPost";
import { deletePost } from "./deletePost"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const FormAndCard = () => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: getPosts,
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ description, images }) => {
      const imageUrls = await uploadImages(images);
      await createPost(description, imageUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["gallery"]); 
      setDescription("");
      setImages([]);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      await deletePost(postId);
      queryClient.invalidateQueries(["gallery"])
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
    }
  });

  const openGallery = (imgs, startIndex) => {
    setLightboxImages(imgs);
    setIndex(startIndex);
    setOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handlePublish = () => {
    if (!description && images.length === 0) {
      alert("اكتب حاجة أو ضيف صور!");
      return;
    }

    createPostMutation.mutate({ description, images });
  };

  return (
    <div style={styles.container} dir="rtl">

      <div style={styles.formCard}>
        <h2 style={{ marginBottom: 15 }}>إنشاء منشور جديد</h2>

        <textarea
          style={styles.textarea}
          placeholder="ضيف وصف للصور ......."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={styles.formActions}>
          <label style={styles.uploadBtn}>
            📸 إضافة صور
            <input
              type="file"
              multiple
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          <button
            style={styles.publishBtn}
            onClick={handlePublish}
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "جاري النشر..." : "نشر الآن"}
          </button>
        </div>

        {images.length > 0 && (
          <p style={{ fontSize: 12, color: '#666' }}>
            تم اختيار {images.length} صور
          </p>
        )}
      </div>

      <div style={styles.feed}>
        {isLoading && <p>جاري التحميل...</p>}

        {posts.map(post => (
          <div key={post.id} style={styles.postCard}>
            <div style={{ padding: 15 }}>
              <p style={{ margin: 0, ...styles.textStyle }}>{post.description}</p>
            </div>

            {post.images?.length > 0 && (
              <div style={styles.imageGrid}>
                {post.images.slice(0, 5).map((src, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.gridItem,
                      gridColumn: post.images.length === 1 ? 'span 3' : 'auto',
                      height: post.images.length === 1 ? 300 : 150,
                    }}
                    onClick={() => openGallery(post.images, i)}
                  >
                    <img src={src} alt="" style={styles.img} />
                  </div>
                ))}

                {post.images.length > 5 && (
                  <div
                    style={styles.moreOverlay}
                    onClick={() => openGallery(post.images, 0)}
                  >
                    <img
                      src={post.images[4]}
                      alt=""
                      style={{ ...styles.img, opacity: 0.4 }}
                    />
                    <div style={styles.overlayText}>
                      <div style={{ fontSize: 22, fontWeight: 'bold' }}>
                        +{post.images.length - 5}
                      </div>
                      <div style={{ fontSize: 12 }}>اضغط للعرض</div>
                    </div>
                  </div>
                )}
              </div>
            )}
             <button onClick={() => deletePostMutation.mutate(post.id)} style={{margin: 10, padding: 5, backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer'}}>حذف</button>
          </div>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={lightboxImages.map(src => ({ src }))}
        plugins={[Zoom]}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: '40px auto',
    padding: '0 20px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    paddingBottom: 40,
    paddingTop: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,.1)',
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    border: 'none',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f0f2f5',
    resize: 'none',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  uploadBtn: {
    backgroundColor: '#e4e6eb',
    padding: '8px 15px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  publishBtn: {
    backgroundColor: '#1877f2',
    color: '#fff',
    border: 'none',
    padding: '8px 25px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,.1)',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 2,
  },
  gridItem: {
    overflow: 'hidden',
    cursor: 'pointer',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  moreOverlay: {
    position: 'relative',
    height: 150,
    backgroundColor: '#000',
    cursor: 'pointer',
  },
  overlayText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    textAlign: 'center',
  },
  textStyle: {
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  },
};

export default FormAndCard;
