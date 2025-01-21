import Profile from "../models/profileModel.js";

// POST Route to create or update a profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const {
      avatar,
      address,
      city,
      state,
      zip,
      gender,
      birthDate,
      birthCity,
      birthState,
    } = req.body;

    // Find an existing profile by userID
    const existingProfile = await Profile.findOne({ userID });

    if (existingProfile) {
      // Update the profile if it exists
      const updatedProfile = await Profile.findByIdAndUpdate(
        existingProfile?._id,
        {
          avatar,
          address,
          city,
          state,
          zip,
          gender,
          birthDate,
          birthCity,
          birthState,
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    }

    // Create a new profile if none exists
    const newProfile = new Profile({
      userID,
      avatar,
      address,
      city,
      state,
      zip,
      gender,
      birthDate,
      birthCity,
      birthState,
    });

    await newProfile.save();
    return res
      .status(201)
      .json({ message: "Profile created successfully", profile: newProfile });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// GET Route to fetch a user's profile
export const getProfile = async (req, res) => {
  try {
    const { userID } = req.params;

    // Find the profile by userID
    const profile = await Profile.findOne({ userID });

    // If no profile is found, return a 404 error
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Return the profile data
    return res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
