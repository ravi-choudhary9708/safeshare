import { signJWT, verifyJWT } from "@/libs/jwt";
import Upload from "@/models/Upload";
import { NextResponse } from "next/server";
import { cloudinary } from "@/libs/cloudinary";
import { Readable } from "stream";
import { dbConnect } from "@/libs/dbConnection";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const mode = formData.get("mode");
    const access = formData.get("access");
    const expiry = formData.get("expiry");
    const salt = formData.get("salt");
    const iv = formData.get("iv");
   

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const byteArray = await file.arrayBuffer();
    const buffer = Buffer.from(byteArray);
    const fileName = file.name.replace(/\s/g, "");

    await dbConnect();
  

    // Upload to Cloudinary
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "fileUpload",
            timeout: 60000,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    console.log("cloud result",result);

    // Handle JWT token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    let uploaderId;

    if (token) {
      try {
        const decoded = verifyJWT(token);
        uploaderId = decoded?.uploaderId;
      } catch (err) {
        console.warn("Invalid token:", err.message);
      }
    }

    if (!uploaderId) {
      uploaderId = crypto.randomUUID();
    }

    const expiryInHours = parseInt(expiry) || 24;
    const expiryAt =
      mode === "share"
        ? new Date(Date.now() + expiryInHours * 60 * 60 * 1000)
        : null;

    // Save to DB
    await Upload.create({
        
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileName,
      mode,
      access,
      mimeType: file.type,
      fileSize: file.size,
      uploaderId,
      salt,
      iv,
      expiryAt,
    });

    // Generate token if not present
  

    return NextResponse.json({
      message: "Uploaded successfully",
      fileName,
      mode,
      access,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      token,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed", message: error.message },
      { status: 400 }
    );
  }
}
