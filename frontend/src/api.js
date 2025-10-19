const API_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json(); // returns { url }
};

export const getUploadedImages = async () => {
  const res = await fetch(`${API_URL}/images`);
  return res.json(); // returns array of URLs
};
