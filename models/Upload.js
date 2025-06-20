// models/Upload.js
import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
    unique: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ['print', 'share'],
    required: true
  },
  access: {
    type: String,
    enum: ['view', 'download'],
    default: 'view'
  }, // for 'share' mode only

  publicId: {
    type: String,
    required: true,
  },
  uploaderId: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // ⏳ Auto-delete document after 24 hours
  },
});

export default mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
