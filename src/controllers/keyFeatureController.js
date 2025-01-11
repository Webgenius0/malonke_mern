import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * Create a Key Feature
 */
export const createKeyFeature = catchAsync(async (req, res, next) => {
  const { title, description, icon } = req.body;
  if (!title || !description || !icon) {
    return next(new AppError("Please provide all the fields", 400));
  }
  const keyFeature = await KeyFeature.create({ title, description, icon });
  res.status(201).json({
    status: "success",
    data: keyFeature,
  });
});

/**
 * Get Key Features
 */
export const getKeyFeatures = catchAsync(async (req, res, next) => {
  let data = await KeyFeature.find();
  res.status(200).json({
    status: "success",
    data,
  });
});

/**
 * Update a Key Features
 */
export const updateKeyFeature = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, icon } = req.body;
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (icon) updateFields.icon = icon;
  const keyFeature = await KeyFeature.updateOne({ _id: id }, updateFields);
  if (!keyFeature) {
    return next(new AppError("Key Feature not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: keyFeature,
  });
});

// Delete a Key Feature
export const deleteKeyFeature = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedKeyFeature = await KeyFeature.findByIdAndDelete(id);

  if (!deletedKeyFeature) {
    return next(new AppError("Key Feature not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: deletedKeyFeature,
  });
});
