import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { decryptBuffer } from '@/utils/aes';
import TraceLog from '@/models/Trace';

export async function POST(req) {
  try {
    const { otp } = await req.json();
    await dbConnect();

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    const file = await Upload.findOne({ otp });


    console.log("verify file",file)


   

    const response = await fetch(file.fileUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 1. Decrypt file
    const encryptedBuffer = Buffer.from(await response.arrayBuffer());
    const decryptedBuffer = await decryptBuffer(
      encryptedBuffer,
      otp,
      file.iv,
      file.salt
    );

   /*
 // 3. Delete file and DB (print files are one-time view only)
    cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' })
      .then(() => console.log('✅ Cloudinary file deleted'))
      .catch(err => console.error('❌ Cloudinary delete error:', err));

    Upload.deleteOne({ otp })
      .then(() => console.log('✅ DB record deleted'))
      .catch(err => console.error('❌ DB delete error:', err));

   */



   

   

    // 4. Return decrypted file for inline view
    return new NextResponse(decryptedBuffer, {
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream', // ⭐ DB se mimeType
        'Content-Disposition': 'inline', // ⭐ Browser inline show karega
        'Cache-Control': 'no-cache, no-store, must-revalidate', // ⭐ Security ke liye
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

