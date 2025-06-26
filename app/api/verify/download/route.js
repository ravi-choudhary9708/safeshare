import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";

import { NextResponse } from "next/server";


export async function POST(req) {
  const { publicId, publicIds } = await req.json();
  const finalPublicId = publicId || publicIds;
  
  const file = await Upload.findOne({ publicId: finalPublicId });

    console.log("aage badho:",file)

    console.log("imp file",file)

    if(!file){
        return NextResponse.json({error:"otp or fileid invlaid"},{status:400})
    };
return NextResponse.json({ fileUrl: file.fileUrl,
  iv: file.iv,
  salt: file.salt,
  fileName: file.fileName,
  mimeType: file.mimeType, })

  

   

    
  





}