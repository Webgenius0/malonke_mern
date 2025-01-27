import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Price must be a positive number",
      },
    },
    billingCycle: {
      type: String,
      default: "Per Year",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    features: [
      {
        type: String,
        required: [true, "Feature is required"],
        trim: true,
      },
    ],
      popular:{type:Boolean,default: false},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Pricing = mongoose.model("pricings", pricingSchema);
export default Pricing;
