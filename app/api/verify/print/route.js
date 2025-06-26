import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { decryptBuffer } from "@/utils/aesClient.js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";




export async function POST(req) {
  try {
      const {otp}=await req.json();

    await dbConnect();

    if(!otp){
        return NextResponse.json({error:"otp is required"},{status:400});
    }

    const file= await Upload.findOne({otp});

    console.log("file print",file)

     if(!file){
        return NextResponse.json({error:"file not found in db"},{status:400});
    }

   

 

    cloudinary.uploader.destroy(file.publicId,{resource_type:"raw"}).then(()=>console.log("cloudinary file delted")).catch((err)=>console.log("file not deleted",err))
     Upload.deleteOne({otp}).then(()=>console.log("file deleted from db")).catch((err)=>console.log("file not deletd from db",err));

   return NextResponse.json({message:"file deleted succesfully"},{status:400})


  }catch (error) {
      console.error(error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}