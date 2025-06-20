import mongoose from 'mongoose';

const traceLogSchema = new mongoose.Schema({
  uploaderId: String,
  fileName: String,        // only if file not deleted
  fileUrl: String,
  publicId: String,
  otpUsed: String,
  fileDeleted: Boolean,
  ip: String,
  userAgent: String,
  accessTime: { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.models.TraceLog || mongoose.model('TraceLog', traceLogSchema);

