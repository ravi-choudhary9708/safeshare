import mongoose from "mongoose";

const UploadFileSchema= new mongoose.Schema({
    otp:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String,
        required:true
    },
    fileName:{
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:['print','share'],
        required:true
    },
    access:{
        type:String,
        enum:['view','download'],
        default:"view",
    },
    publicId:{
        type:String,
        required:true
    },
    mimeType:{
        type:String,
        required:true
    },
   
     uploaderId:{
        type:String,
        required:true
    },
     salt:{
        type:String,
        required:true
    },
     iv:{
        type:String,
        required:true
    },
     uploadedAt:{
        type:Date,
        default:Date.now(),
        expires:86400
    },
     expiryAt: { type: Date, required: false },
})

export default mongoose.models.UploadFile || mongoose.model("UploadFile",UploadFileSchema);