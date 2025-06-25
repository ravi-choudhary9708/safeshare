import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { decryptBuffer } from "@/utils/aes";
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

     const res = await fetch(file.fileUrl);

      if(!res.ok){
        return NextResponse.json({error:"file not found in fetch fiel url"},{status:400});
    }

     const encryptedBuffer = Buffer.from(await res.arrayBuffer());
         console.log("encryptedBuffer buffer",encryptedBuffer)
    const decryptedBuffer = await decryptBuffer(
      encryptedBuffer,
      otp,
      file.iv,
      file.salt
    );

    console.log("decrypted buffer",decryptedBuffer)

    cloudinary.uploader.destroy(file.publicId,{resource_type:"raw"}).then(()=>console.log("cloudinary file delted")).catch((err)=>console.log("file not deleted",err))
     Upload.deleteOne({otp}).then(()=>console.log("file deleted from db")).catch((err)=>console.log("file not deletd from db",err));

     return new NextResponse(decryptedBuffer,
      {
          headers:{
            'Content-Type':file.mimeType || 'application/octet-stream',
            'content-Disposition':'inline',
        },
      }
     )


  } catch (error) {
      console.error(error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }


}