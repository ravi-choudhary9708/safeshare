import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { generateOtp } from '@/utils/generateOtp';

const uploadDir = 'public/uploads';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + '-' + file.name;

    const savePath = path.join(process.cwd(), uploadDir, filename);
    await fs.writeFile(savePath, buffer);

    await dbConnect();
    const otp = generateOtp();

    await Upload.create({ otp, fileName: filename });

    return NextResponse.json({ message: 'Uploaded successfully', otp });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

