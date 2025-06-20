import { dbConnect } from '@/lib/dbConnect';
import TraceLog from '@/models/Trace';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { publicId } = await req.json();
    await dbConnect();
    const logs = await TraceLog.find({ publicId }).sort({ accessTime: -1 });
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: 'Trace fetch failed' }, { status: 500 });
  }
}
