import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const { otp,  } = await req.json();
    await dbConnect();

    const file = await Upload.findOne({ otp });
   
   

    if (!file) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 404 });
    }

    
  console.log("file",file);

 if(file.mode=="print"){
     // ✅ Delete in background (non-blocking)
    cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' })
      .then(() => console.log('✅ Cloudinary file deleted'))
      .catch(err => console.error('❌ Cloudinary delete error:', err));
  
    Upload.deleteOne({ otp })
      .then(() => console.log('✅ DB record deleted'))
      .catch(err => console.error('❌ DB delete error:', err));
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
