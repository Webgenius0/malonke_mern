import mongoose from "mongoose";

const packageContactSchema = new mongoose.Schema({
    fullName: {type: String, required: true,index: true, trim: true},
    email: {type: String, required: true,index: true, trim: true},
    subject: {type: String, required: true,index: true, trim: true},
    message: {type: String, required: true,index: true, trim: true},
    packageName: {type: String, required: true,index: true, trim: true},
}, { timestamps: true ,versionKey: false });

const PackageContact = mongoose.model("packagecontacts", packageContactSchema);
export default PackageContact;