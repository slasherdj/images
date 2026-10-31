const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number, // in bytes
    },
    format: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
