import mongoose from "mongoose";


const otpSchema = new mongoose.Schema({
    otp:{type:String , required: [true,"Otp is required!"],index:true},
    userID:{type:mongoose.Types.ObjectId, required: [true, "Otp is required!"]},
    email:{type:String,required: [true, "Otp is required!"],index:true},
    purpose:{type:String,required: [true, "Otp Purpose is required!"],index:true,enum:["registration","forgotPassword"]},
    isUsed:{type:Boolean , required: [true, "isUsed is required!"]},
},
    {timestamps:true,versionKey:false});

const Otp = mongoose.model("otps", otpSchema);
export default Otp;