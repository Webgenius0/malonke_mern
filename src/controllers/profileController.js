import Profile from "../models/profileModel.js";
import catchAsync from "../utils/catchAsync.js";
import {getModelByRole} from "../utils/getModelByRole.js";
import AppError from "../utils/AppError.js";

// POST Route to create or update a profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const role = req.user.role;
    const Model = await getModelByRole(role);
    const {
      firstName,lastName,phone,
      address,
      city,
      state,
      zip,
      gender,
      birthDate,
      birthCity,
      birthState,
    } = req.body;

    // Update personal info in the relevant collection only if fields are new and different
    const existingUser = await Model.findById(userID);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

// Check if the provided fields are new
    const hasChanges =
        (firstName && firstName !== existingUser.firstName) ||
        (lastName && lastName !== existingUser.lastName);

    if (hasChanges) {
      const updatedUser = await Model.findByIdAndUpdate(
          userID,
          { firstName, lastName },
          { new: true, runValidators: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
    }


    // Check if a profile already exists for the user
    let profile = await Profile.findOne({ userID });

    if (profile) {
      // Update the existing profile
      profile = await Profile.findByIdAndUpdate(
          profile._id,
          {
            address,
            city,
            state,
            zip,
            gender,
            birthDate,
            birthCity,
            birthState,
            phone
          },
          { new: true, runValidators: true }
      );
      return res
          .status(200)
          .json({ message: "Profile updated successfully", profile });
    }

    // Create a new profile if none exists
    profile = new Profile({
      userID,
      address,
      city,
      state,
      zip,
      gender,
      birthDate,
      birthCity,
      birthState,
    });

    await profile.save();
    return res
        .status(201)
        .json({ message: "Profile created successfully", profile });
  } catch (error) {
    console.error(error);
    return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
  }
};

//User info
export const getUserInfo = catchAsync(async (req, res,next) => {
  const {id,role} = req.user;
  const Model = getModelByRole(role);

  const userData = await Model.findOne(
      { _id: id }, // Query filter
      { _id: 1, firstName: 1, lastName: 1, email: 1,role:1 }
  );

  if (!userData) {
    return next(new AppError("User not found",200));
  }
  const profileData = await Profile.findOne({userID: id});
  res.status(200).json({status:"success", user:{userData,profileData}});
})


export const updateAvatar = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  console.log(id);
  const { avatar } = req.body;

  // Find the user profile by userID
  const user = await Profile.findOne({ userID: id });

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  // Update the avatar field
  user.avatar = avatar;

  // Save the updated user profile
  await user.save();

  // Send the updated profile back to the client
  res.status(200).json({
    status: 'success',
    message: 'Avatar updated successfully',

  });
});