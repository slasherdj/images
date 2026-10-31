const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth APIs
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid credentials");
  return data;
};

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  return data;
};

// Image APIs
export const uploadImage = async (file, name) => {
  const formData = new FormData();
  formData.append("file", file);
  if (name) formData.append("name", name);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
};

export const getUploadedImages = async () => {
  const res = await fetch(`${API_URL}/images`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch images");
  return data;
};
