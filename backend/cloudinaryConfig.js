const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Use the name sent from frontend
    let customName = req.body.name || file.originalname;
    // Remove extension if present
    const publicId = customName.replace(/\.[^/.]+$/, "");

    return {
      folder: "my-images",
      public_id: publicId,       // <--- this sets the filename
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 1024, crop: "limit" }],
    };
  },
});


module.exports = { cloudinary, storage };
