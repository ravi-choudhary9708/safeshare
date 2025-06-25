import { cloudinary } from "@/libs/cloudinary";
import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { decryptBuffer } from "@/utils/aes";
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

    const res= await fetch(file.fileUrl);

    if(!res.ok){
         return NextResponse.json({error:"file not found"},{status:400})
    }

    const encryptedBuffer =  Buffer.from(await res.arrayBuffer());
    const decryptedBuffer=await decryptBuffer(encryptedBuffer,otp,file.iv,file.salt);

      cloudinary.uploader.destroy(file.publicId,{resource_type:"raw"}).then(()=>console.log("cloudinary file delted")).catch((err)=>console.log("file not deleted",err))
         Upload.deleteOne({otp}).then(()=>console.log("file deleted from db")).catch((err)=>console.log("file not deletd from db",err));

    
  

    return new NextResponse(decryptedBuffer,{
        headers:{
       

             'Content-Disposition': `attachment; filename="${file.fileName || 'download.jpg'}"`,
          'Content-Type': file.mimeType || 'image/jpeg',
        }
    })





}