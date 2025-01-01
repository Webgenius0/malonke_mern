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
        features: [
            {
                type: String,
                required: [true, "Feature is required"],
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Pricing = mongoose.model("Pricing", pricingSchema);
export default Pricing;
