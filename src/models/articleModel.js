import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
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
    image: {
      type: String,
      required: [true, "Image is required"],
      index: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Image is required"],
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Article = mongoose.model("articles", articleSchema);
export default Article;
