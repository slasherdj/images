require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { storage, cloudinary } = require("./cloudinaryConfig");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow both deployed domain and local Vite dev server
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://image-manager-rho.vercel.app"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev
  },
  credentials: true,
}));

app.use(express.json());

// Multer upload using Cloudinary storage
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: req.file.path }); // Cloudinary returns secure_url
});

// List uploaded images
app.get("/images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "my-images",
      max_results: 100,
    });

    const urls = result.resources.map((r) => r.secure_url);
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images from Cloudinary" });
  }
});

// ✅ Health check / root route
app.get("/", (req, res) => {
  res.send("✅ Image Manager Backend is running successfully!");
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
