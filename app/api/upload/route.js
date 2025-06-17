import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';

import { generateOtp } from '@/utils/generateOtp';
import { Readable } from 'stream';
import { cloudinary } from '@/lib/cloudinary'; 

// 🔁 Parse FormData in App Router
export async function POST(req) {
  try {
    // 1. Parse formData and get file
    const formData = await req.formData();
    const file = formData.get('file');

const fileName = file.name.replace(/\s/g, '')
      console.log("filename",fileName)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Connect DB
    await dbConnect();

    // 4. Upload to Cloudinary
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'fileUpload', // ✅ Cloudinary folder
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(); // wait for Cloudinary result

    // 5. Generate OTP and save to DB
    const otp = generateOtp();

    await Upload.create({
      fileName,
      otp,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    });

    return NextResponse.json({ message: 'File uploaded', otp ,fileName});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}


