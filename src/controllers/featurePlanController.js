import Pricing from "../models/featurePlanModel.js";

// Create feature
export const createFeature = async (req, res) => {
  try {
    const { planName, price, billingCycle, description, features,popular } = req.body;

    if (!planName || !price || !billingCycle || !description || !features) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPlan = new Pricing({
      planName,
      price,
      billingCycle,
      description,
      features,
      popular
    });

    await newPlan.save();

    return res
      .status(201)
      .json({ message: "Plan created successfully", plan: newPlan });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get all features
export const getFeatures = async (req, res) => {
  try {
    const plans = await Pricing.find();

    if (plans.length === 0) {
      return res.status(404).json({ message: "No features found" });
    }

    return res.status(200).json({ plans });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get single feature
export const getFeature = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID parameter" });
    }

    const feature = await Pricing.findById(id);

    if (!feature) {
      return res.status(404).json({ message: "Feature plan not found" });
    }

    return res
      .status(200)
      .json({ message: "Feature retrieved successfully", data: feature });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Update feature
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, price, billingCycle, description, features, popular } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID parameter" });
    }

    const updateData = {};
    if (planName) updateData.planName = planName;
    if (price) updateData.price = price;
    if (billingCycle) updateData.billingCycle = billingCycle;
    if (description) updateData.description = description;
    if (features) updateData.features = features;
    if (popular !== undefined) updateData.popular = popular;

    const updatedPlan = await Pricing.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedPlan) {
      return res.status(404).json({ message: "Feature plan not found" });
    }

    return res
      .status(200)
      .json({ message: "Feature updated successfully", data: updatedPlan });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Delete feature
export const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeature = await Pricing.findByIdAndDelete(id);

    if (!deletedFeature) {
      return res.status(404).json({ message: "Feature not found" });
    }

    return res.status(200).json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
