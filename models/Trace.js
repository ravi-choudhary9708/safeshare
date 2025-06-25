import mongoose from "mongoose";


const TraceLogSchema= new mongoose.Schema({
    uploaderId:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true
    },
    userAgent:{
        type:String,
        required:true
    },
    otpUsed:{
        type:String,
        required:true
    },
    accessTime:{
        type:Date,
        required:true
    },
    fileName:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String,
        
    },
    publicId:{
        type:String,
        required:true
    },

})

export default mongoose.models.TraceLog || mongoose.model("TraceLog",TraceLogSchema)