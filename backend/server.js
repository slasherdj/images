require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { storage, cloudinary } = require("./cloudinaryConfig");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

// Enable CORS
app.use(cors({ origin: FRONTEND_URL }));

// Multer upload using Cloudinary storage
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  // Cloudinary returns secure_url
  res.json({ url: req.file.path });
});

// Optional: List uploaded images
app.get("/images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "my-images",
      max_results: 100, // adjust as needed
    });

    const urls = result.resources.map((r) => r.secure_url);
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images from Cloudinary" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
