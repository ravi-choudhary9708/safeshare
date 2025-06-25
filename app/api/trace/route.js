import { dbConnect } from "@/libs/dbConnection";
import Upload from '@/models/Upload';
import { NextResponse } from 'next/server';
import TraceLog from '@/models/Trace';

export async function POST(req) {
  try {
    const { uploaderId } = await req.json();
    await dbConnect();
    const logs = await TraceLog.find({ uploaderId }).sort({ createdAt: -1 });
    console.log("server uplloaasd",logs.length)
    return NextResponse.json({ logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}