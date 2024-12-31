import mongoose, { Schema } from "mongoose";
import validator from "validator";

const { ObjectId } = Schema.Types;

const profileSchema = new Schema(
  {
    userID: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    avatar: {
      type: String,
      validate: {
        // Allow either an empty string or a valid Base64 image string
        validator: (v) => v === "" || /^data:image\/[a-z]+;base64,/.test(v),
        message: "Invalid avatar format. Use a Base64 string.",
      },
      default: "",
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
    state: {
      type: String,
      index: true,
      trim: true,
    },
    zip: {
      type: String,
      validate: {
        validator: (v) => validator.isPostalCode(v, "any"),
        message: "Invalid ZIP/Postal code format.",
      },
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
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
  { timestamps: true, versionKey: false }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
