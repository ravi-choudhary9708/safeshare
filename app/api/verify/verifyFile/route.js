import { dbConnect } from "@/libs/dbConnection";
import Upload from "@/models/Upload";
import { NextResponse, userAgent } from "next/server";
import TraceLog from "@/models/Trace";


export async function POST(req) {
 
 const {otp}=req.json();

   // Handle JWT token
     const authHeader = req.headers.get("authorization");
     const token = authHeader?.replace("Bearer ", "");
     
            const decoded= jwtDecode(token);
            const uploaderId= decoded?.uploaderId;

await dbConnect();

const file= await Upload.findOne({otp});

console.log("file verify aawe so",file)

if(!file){
    return NextResponse.json({error:"invalid otp"},{status:400});
};

await TraceLog.create({
    
  uploaderId:file.uploaderId,
  ip:req.headers.get("x-forwarded-for")?.split(",")[0],
  userAgent:req.headers.get("user-Agent"),
  otpUsed:otp,
  accessTime:new Date(),
  fileName:file.fileName,
  fileUrl:file.url,
  publicId:file.publicId

});



  
 return NextResponse.json({
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    fileName: file.fileName,
    salt: file.salt,
    iv: file.iv,
    access: file.access,
    mode:file.mode,
  })

}