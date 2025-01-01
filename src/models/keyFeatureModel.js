import mongoose from "mongoose";

const keyFeatureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            index: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            index: true,
            trim: true,
        },
        icon: {
            type: String,
            required: [true, "Icon is required"],
            index: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const KeyFeature = mongoose.model("keyfeatures", keyFeatureSchema);
export default KeyFeature;
