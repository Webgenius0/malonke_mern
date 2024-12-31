import fs from "fs";
import path from "path";
import Profile from "../models/profileModel";

// Function to convert image file to Base64
const convertImageToBase64 = (filePath) => {
  const imageData = fs.readFileSync(filePath);
  return imageData.toString("base64");
};

// POST Route to create or update a profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      userID,
      address,
      city,
      state,
      zip,
      gender,
      birthDate,
      birthCity,
      birthState,
    } = req.body;

    let avatarUrl = "";

    // Handle file upload
    if (req.files && req.files.avatar) {
      const avatarFile = req.files.avatar;
      const fileExtension = avatarFile.name.split(".").pop();
      const fileName = `${userID}-avatar.${fileExtension}`;
      const filePath = path.join(__dirname, "../../uploads", fileName);

      // Save the file to disk
      avatarFile.mv(filePath, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error saving file", error: err.message });
        }
      });

      // Convert the image to Base64
      const base64Image = convertImageToBase64(filePath);

      // Generate the Base64 URL format
      avatarUrl = `data:image/${fileExtension};base64,${base64Image}`;
    }

    // Find an existing profile by userID
    const existingProfile = await Profile.findOne({ userID });

    if (existingProfile) {
      // Update the profile if it exists
      const updatedProfile = await Profile.findByIdAndUpdate(
        existingProfile._id,
        {
          avatar: avatarUrl,
          address,
          city,
          state,
          zip,
          gender,
          birthDate,
          birthCity,
          birthState,
        },
        { new: true, runValidators: true } // Return the updated document and apply validations
      );
      return res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    }

    // Create a new profile if none exists
    const newProfile = new Profile({
      userID,
      avatar: avatarUrl,
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
