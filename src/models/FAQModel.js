// Import mongoose
import mongoose, { Schema } from "mongoose";

const FAQSchema = new Schema(
  {
    serial: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    question: {
      type: String,
      index: true,
      trim: true,
    },
    answer: {
      type: String,
      index: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const FAQ = mongoose.model("faqs", FAQSchema);
export default FAQ;
