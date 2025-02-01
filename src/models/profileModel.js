import mongoose, {Schema} from "mongoose";
import validator from "validator";

const {ObjectId} = Schema.Types;

const profileSchema = new Schema(
    {
        userID: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        avatar: {
            type: String,
            index: true,
            trim: true,
            default:
                "https://coenterprises.com.au/wp-content/uploads/2018/02/male-placeholder-image.jpeg",
        },
        address: {
            type: String,
            index: true,
            trim: true,
        },
        city: {
            type: String,
            index: true,
            trim: true,
        },
        phone: {
            type: String,
            index: true,
            trim: true,
        },
        state: {
            type: String,
            index: true,
            trim: true,
        },
        zip: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            default: "Male",
            trim: true,
        },
        birthDate: {
            type: Date,
            index: true,
        },
        birthCity: {
            type: String,
            trim: true,
        },
        birthState: {
            type: String,
            trim: true,
        },
    },
    {timestamps: true, versionKey: false}
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
