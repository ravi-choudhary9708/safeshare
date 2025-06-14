import path from "path";
import fs from "fs";
import { dbConnect } from "../../lib/dbConnect";
import Upload from "../../models/Upload";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { otp } = req.body;
  if (!otp) return res.status(400).json({ error: "OTP is required" });

  await dbConnect();

  const upload = await Upload.findOne({ otp });
  if (!upload) return res.status(400).json({ error: "Invalid or expired OTP" });

  const filePath = path.join(process.cwd(), "public", "uploads", upload.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${upload.fileName}"`);
  res.setHeader("Content-Type", "application/octet-stream");

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
