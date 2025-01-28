import mongoose, {Schema} from "mongoose";
import validator from "validator";

const {ObjectId} = Schema.Types;

const contactSchema = new Schema(
    {
        userID: {
            type: ObjectId,
            ref: "users",
            required: true,
        },
        adminID: {
            type: ObjectId,
            ref: "admins",
            required: true,
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            validate: {
                validator: (value) => /^[a-zA-Z\s]+$/.test(value),
                message: "Name must contain only letters and spaces",
            },
        },
        lastName: {
            type: String,
            required: [true, "Last lame is required"],
            trim: true,
            validate: {
                validator: (value) => /^[a-zA-Z\s]+$/.test(value),
                message: "Name must contain only letters and spaces",
            },
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Email is invalid",
            },
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

const UserContact = mongoose.model("usercontacts", contactSchema);
export default UserContact;
