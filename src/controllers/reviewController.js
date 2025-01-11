import Review from "../models/reviewModel.js";

// Create new review
export const createReview = async (req, res) => {
  try {
    const { rating, message } = req.body;
    const userID = "67811b2e3cc1346af57fd512" || req.user.id;

    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ userID });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed",
      });
    }

    // Create a new review
    const newReview = new Review({ userID, rating, message });

    await newReview.save();

    return res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get single reviews
export const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ review });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, message } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID parameter" });
    }

    if (rating === undefined && message === undefined) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (message !== undefined) updateData.message = message;

    const review = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res
      .status(200)
      .json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID parameter" });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
