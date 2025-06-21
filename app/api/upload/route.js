import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Upload from '@/models/Upload';
import { signJWT } from '@/lib/jwt';
import { generateOtp } from '@/utils/generateOtp';
import { Readable } from 'stream';
import { cloudinary } from '@/lib/cloudinary'; 
import { verifyJWT } from '@/lib/jwt'; 
import { encryptBuffer } from '@/utils/aes';


// 🔁 Parse FormData in App Router
export async function POST(req) {
  try {
    // 1. Parse formData and get file
    const formData = await req.formData();
    const file = formData.get('file');

    const mode = formData.get('mode'); // 'print' or 'share'
    const access = formData.get('access') || 'view';
    

    const authHeader = req.headers.get('authorization'); // ✅ correct way
    const token = authHeader?.replace('Bearer ', ''); 


    console.log("mode",mode)
    console.log("access",access)


const fileName = file.name.replace(/\s/g, '')
     
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Connect DB
    await dbConnect();

    
    // 5. Generate OTP and save to DB
    const otp = generateOtp();

     // Encrypt the file
    const { encryptedBuffer, salt, iv } = await encryptBuffer(buffer, otp);

    
console.log("Plain size:", buffer.length);
console.log("Encrypted size:", encryptedBuffer);

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

        Readable.from(encryptedBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(); // wait for Cloudinary result



console.log("upload token",token)

let uploaderId;

if (token) {
  try {
    const decoded = verifyJWT(token);
    uploaderId = decoded?.uploaderId;
  } catch (err) {
    console.warn("⚠ Invalid token:", err.message);
  }
}

 if (!uploaderId) {
      uploaderId = crypto.randomUUID(); // agar token nahi mila to naya id generate karo
    }

    await Upload.create({
      fileName,
      otp,
      fileUrl: result.secure_url,
      publicId: result.public_id,
       mode,
       access,
       uploaderId,
      salt,
      iv,
    });

      // ✅ send token back
    const newToken = signJWT({ uploaderId });

    console.log("uplodeid",uploaderId);
    console.log("token",newToken)


    if (!token) {
  // Only create token if client didn't send any token
  const newToken = signJWT({ uploaderId });
  return NextResponse.json({ message: 'File uploaded', otp ,fileName, token: newToken,  publicId: result.public_id, fileUrl: result.secure_url, });
} else {
  return NextResponse.json({ message: 'File uploaded', otp ,fileName, token,  publicId: result.public_id, fileUrl: result.secure_url, });// Return same token back
}



    

    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}


