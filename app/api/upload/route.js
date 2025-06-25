
import { signJWT, verifyJWT } from "@/libs/jwt";
import Upload from "@/models/Upload";
import { encryptBuffer } from "@/utils/aes";
import { generateOtp } from "@/utils/generateOtp";
import { NextResponse } from "next/server";
import { cloudinary } from "@/libs/cloudinary";
import { Readable } from 'stream';
import { dbConnect } from "@/libs/dbConnection";

export async function POST(req) {
 
    try {
        const formData= await req.formData();
        const file= formData.get("file");
        const mode= formData.get("mode");
        const access= formData.get("access");
      

          const authHeader = req.headers.get('authorization'); // ✅ correct way
          const token = authHeader?.replace('Bearer ', ''); 

        console.log("file",file);
        console.log("access",access);
         console.log("token bhai",token);
         
      const fileName= file.name.replace(/\s/g,"")
         
      if(!file){
        return NextResponse.json({error:"no file provided"},{status:400})
      };

      const byte= await file.arrayBuffer();
      const buffer=Buffer.from(byte);

      await dbConnect();

      const otp = generateOtp();

      const {encryptedBuffer,salt,iv}= await encryptBuffer(buffer,otp);

       const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'fileUpload', // ✅ Cloudinary folder
            timeout: 60000, // optional: increase timeout to 60s
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        Readable.from(encryptedBuffer).pipe(stream);
      });
    };

    const result = await streamUpload();
  console.log("result",result)
    let uploaderId;
    if(token){
        try {
            const decoded=verifyJWT(token);
            uploaderId=decoded?.uploaderId;

        } catch (error) {
            console.warn("invalid token",error.message)
        }
    }

    if(!uploaderId){
        uploaderId=crypto.randomUUID();
    }

     await Upload.create({
        otp,
        fileUrl:result.secure_url,
        publicId: result.public_id,
        fileName,
        mode,
        access,
        mimeType:file.type,
        fileSize:file.size,
        uploaderId,
        salt,
        iv,
        

     })

     if(!token){
        const newtoken = signJWT({uploaderId});
        return NextResponse.json({message:"uploaded successfully",otp,fileName,mode,access,fileUrl:result.secure_url,publicId: result.public_id,token:newtoken})
     }else{
         return NextResponse.json({message:"uploaded successfully",otp,fileName,mode,access,fileUrl:result.secure_url,publicId: result.public_id,token})
     }
    } catch (error) {
        return NextResponse.json({error:"upload failed",message:error.message},{status:400})
    }
}