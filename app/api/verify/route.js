import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const { otp, download } = await req.json();
    await dbConnect();

    const file = await Upload.findOne({ otp });
   
   

    if (!file) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 404 });
    }

    
  console.log("file",file);

    // If download is requested
    if (download) {
      const response = await fetch(file.fileUrl);
      
      if (!response.ok) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const buffer = await response.arrayBuffer();

      
// ✅ Delete in background (non-blocking)
  cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' })
    .then(() => console.log('✅ Cloudinary file deleted'))
    .catch(err => console.error('❌ Cloudinary delete error:', err));

  Upload.deleteOne({ otp })
    .then(() => console.log('✅ DB record deleted'))
    .catch(err => console.error('❌ DB delete error:', err));

     
      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${file.fileName || 'download.jpg'}"`,
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        },
      });
    }







    // Regular response for viewing
    return NextResponse.json({ 
      fileUrl: file.fileUrl,
      fileName: file.fileName || 'null',
      mode:file.mode,
      access:file.access
    });


    


  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
