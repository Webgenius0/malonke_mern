import mongoose, {Schema} from "mongoose";
import validator from "validator";

const externalContactSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
            maxlength: [150, "Subject must be less than 150 characters long"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters long"],
            maxlength: [500, "Message must be less than 500 characters long"],
        },
    },
    {timestamps: true, versionKey: false}
);

const Contact = mongoose.model("contacts", externalContactSchema);
export default Contact;
