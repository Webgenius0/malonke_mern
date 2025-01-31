import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User ID is required"],
            ref:"users"
        },
        fileUrl: {
            type: String,
            required: [true, "Please choose a file!"],
            index: true,
            trim: true,
        },
        fileName: {
            type: String,
            required: [true, "File name is required!"],
            index: true,
            trim: true,
        },
        size: {
            type: Number,
            required: [true, "File size is required"],
            index: true,
            trim: true,
        },
        starred:{type:Boolean,default:false},
        mimetype:{
            type: String,
            required: [true, "File type is required"],
            index: true,
            trim: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const File = mongoose.model("File", fileSchema);
export default File;
