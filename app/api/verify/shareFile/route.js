import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import TraceLog from '@/models/Trace';
import { decryptBuffer } from '@/utils/aes';

export async function POST(req) {
  try {
    const { otp ,fileId} = await req.json();
    await dbConnect();

    if (!otp || !fileId || typeof fileId === null) {
  return NextResponse.json({ error: 'OTP and File ID required' }, { status: 400 });
}

    const file = await Upload.findOne({ otp, publicId: fileId });
   
   

    if (!file) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 404 });
    }



   
    
      const response = await fetch(file.fileUrl);
      
      if (!response.ok) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

       const encryptedBuffer = Buffer.from(await response.arrayBuffer());
      const decryptedBuffer = await decryptBuffer(encryptedBuffer, otp, file.iv, file.salt);

      console.log('file.iv:', file.iv);
console.log('file.salt:', file.salt);



  await TraceLog.create({
  uploaderId: file.uploaderId, // from Upload DB
  fileDeleted: true,           // or false depending on file.mode
  ip: req.headers.get("x-forwarded-for")?.split(',')[0] || "Unknown IP",
  userAgent: req.headers.get("user-agent") || "Unknown Agent",
  otpUsed: otp,
  accessTime: new Date(),
  ...(file.mode === 'share' ? {
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    publicId: file.publicId,
    fileDeleted: false
  } : {
    fileDeleted: true // no file info stored
  })
});



      
// ✅ Delete in background (non-blocking)
  cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' })
    .then(() => console.log('✅ Cloudinary file deleted'))
    .catch(err => console.error('❌ Cloudinary delete error:', err));

  Upload.deleteOne({ otp })
    .then(() => console.log('✅ DB record deleted'))
    .catch(err => console.error('❌ DB delete error:', err));

     
      return new NextResponse(decryptedBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${file.fileName || 'download.jpg'}"`,
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        },
      });
    




  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
