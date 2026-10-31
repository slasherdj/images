require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const connectDB = require("./db");
const { storage, cloudinary } = require("./cloudinaryConfig");
const { protect } = require("./middleware/auth");
const Image = require("./models/Image");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn("⚠️ MONGO_URI is not set. Database features will be disabled until configured.");
}

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
    return callback(null, true); // Dev permissive
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Multer upload using Cloudinary storage
const upload = multer({ storage });

// Protected Upload Endpoint: Only authenticated users can upload
app.post("/upload", protect, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let savedImage = null;
    if (process.env.MONGO_URI) {
      savedImage = await Image.create({
        userId: req.user._id,
        url: req.file.path,
        publicId: req.file.filename || req.file.path.split("/").pop().split(".")[0],
        name: req.body.name || req.file.originalname,
        size: req.file.size || 0,
      });
    }

    res.json({
      url: req.file.path,
      id: savedImage ? savedImage._id : null,
      name: req.body.name || req.file.originalname,
    });
  } catch (error) {
    console.error("Save Image DB Error:", error);
    res.json({ url: req.file.path }); // Still return Cloudinary URL
  }
});

// Protected Images List: Returns images uploaded by this user (or fallback to Cloudinary)
app.get("/images", protect, async (req, res) => {
  try {
    if (process.env.MONGO_URI) {
      // Find images belonging to this user
      const userImages = await Image.find({ userId: req.user._id }).sort({ createdAt: -1 });
      if (userImages && userImages.length > 0) {
        return res.json(userImages.map((img) => img.url));
      }
    }

    // Fallback or if no records in DB yet: fetch user's folder from Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "my-images",
      max_results: 100,
    });

    const urls = result.resources.map((r) => r.secure_url);
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// ✅ Health check / root route
app.get("/", (req, res) => {
  res.send("✅ slasherdj-images Backend is running successfully with Authentication!");
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
