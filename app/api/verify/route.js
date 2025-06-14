import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { otp } = await req.json();
    await dbConnect();

    const file = await Upload.findOne({ otp });

    if (!file) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 404 });
    }

    return NextResponse.json({ fileName: file.fileName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
