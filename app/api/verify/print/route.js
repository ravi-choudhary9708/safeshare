import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { decryptBuffer } from "@/utils/aesClient.js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";




export async function POST(req) {
  try {
    const { otp } = await req.json();
     
      
      const file = await Upload.findOne({ printOtp:otp});

     if(!file){
        return NextResponse.json({error:"file not found in db"},{status:400});
    }

   

 

    cloudinary.uploader.destroy(file.publicId,{resource_type:"raw"}).then(()=>console.log("cloudinary file delted")).catch((err)=>console.log("file not deleted",err))
     Upload.deleteOne({printOtp:otp}).then(()=>console.log("file deleted from db")).catch((err)=>console.log("file not deletd from db",err));

   return NextResponse.json({ fileUrl: file.fileUrl,
  iv: file.iv,
  salt: file.salt,
  fileName: file.fileName,
  mimeType: file.mimeType, })


  }catch (error) {
      console.error(error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}