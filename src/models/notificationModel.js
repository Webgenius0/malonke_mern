import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    packageContactID:{type:mongoose.Schema.Types.ObjectId,required: true},
    message:{type:String,required:true,index:true},
    isRead:{type:Boolean,default:false},
},
    {versionKey: false, timestamps: true});

const Notification = mongoose.model("notifications", notificationSchema);
export default Notification;