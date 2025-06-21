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



    // Regular response for viewing
    return NextResponse.json(file);


    


  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}