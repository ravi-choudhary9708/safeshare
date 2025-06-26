import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { decryptBuffer } from "@/utils/aesClient.js";
import { NextResponse } from "next/server";


export async function POST(req) {
    const{otp,fileId}=await req.json();
    await dbConnect();

    if(!otp || !fileId || typeof fileId==null){
        return NextResponse.json({error:"otp or fileid isrequired"},{status:400})
    }

    const file = await Upload.findOne({otp,publicId:fileId});

    console.log("imp file",file)

    if(!file){
        return NextResponse.json({error:"otp or fileid invlaid"},{status:400})
    };

  

   

    
  

   return NextResponse.json({message:"success file is found",})





}