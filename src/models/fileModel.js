import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User ID is required"],
        },
        file: {
            type: String,
            required: [true, "Please choose a file!"],
        },
        fileName: {
            type: String,
            required: [true, "File name is required!"],
            index: true,
            trim: true,
        },
        size: {
            type: String,
            required: [true, "File size is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const File = mongoose.model("File", fileSchema);
export default File;
