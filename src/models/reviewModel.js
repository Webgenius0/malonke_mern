import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    rating: {
      type: String,
      required: [true, "Rating is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
