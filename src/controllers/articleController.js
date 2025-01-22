// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
import Article from "../models/articleModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Define __dirname manually for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Function to convert image file to Base64
// const convertImageToBase64 = (filePath) => {
//   const imageData = fs.readFileSync(filePath);
//   return imageData.toString("base64");
// };

// Create article
export const createArticle = async (req, res) => {
  try {
    const { title, description, category, image } = req.body;

    const userID = req.user.id;

    if (!title || !description || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle file upload if avatar is provided
    // if (req.files && req.files.image) {
    //   const imageFile = req.files.image;
    //   const fileExtension = imageFile.name.split(".").pop();
    //   const validExtensions = ["jpeg", "jpg", "png"];

    //   if (!validExtensions.includes(fileExtension.toLowerCase())) {
    //     return res.status(400).json({ message: "Invalid file type for image" });
    //   }

    //   const fileName = `${userID}-image.${fileExtension}`;
    //   const filePath = path.join(__dirname, "../../public/uploads", fileName);

    //   await imageFile.mv(filePath);

    //   const base64Image = convertImageToBase64(filePath);
    //   imgUrl = `data:image/${fileExtension};base64,${base64Image}`;
    // }

    const newArticle = new Article({
      userID,
      title,
      description,
      category,
      image,
    });

    await newArticle.save();

    return res
      .status(201)
      .json({ message: "Article created successfully", newArticle });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const userID = req.user.id;
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Handle file upload if image is provided
    // if (req.files && req.files.image) {
    //   const imageFile = req.files.image;
    //   const fileExtension = imageFile.name.split(".").pop();
    //   const validExtensions = ["jpeg", "jpg", "png"];

    //   if (!validExtensions.includes(fileExtension.toLowerCase())) {
    //     return res.status(400).json({ message: "Invalid file type for image" });
    //   }

    //   const fileName = `${userID}-image.${fileExtension}`;
    //   const filePath = path.join(__dirname, "../../public/uploads", fileName);

    //   await imageFile.mv(filePath);

    //   const base64Image = convertImageToBase64(filePath);
    //   imgUrl = `data:image/${fileExtension};base64,${base64Image}`;
    // }

    article.title = title;
    article.description = description;
    article.image = image;

    await article.save();

    return res
      .status(200)
      .json({ message: "Article updated successfully", article });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get all articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find();

    if (articles.length === 0) {
      return res.status(404).json({ message: "No articles found" });
    }

    return res
      .status(200)
      .json({ message: "Articles retrieved successfully", articles });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Get single article
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid article ID format" });
    }

    // Find the article by ID
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Batch aggregations using $lookup
    const [userData] = await User.aggregate([
      { $match: { _id: article.userID } },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "_id",
          as: "profile",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "adminID",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          "profile.avatar": 1,
          "admin.firstName": 1,
          "admin.lastName": 1,
        },
      },
    ]);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = `${userData.firstName || ""} ${
      userData.lastName || ""
    }`.trim();
    const avatar = userData.profile?.[0]?.avatar || "";
    const adminName = `${userData.admin?.[0]?.firstName || ""} ${
      userData.admin?.[0]?.lastName || ""
    }`.trim();

    const data = {
      article,
      username,
      adminName,
      avatar,
    };

    return res.status(200).json({
      message: "Article and User retrieved successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Related article
export const getRelatedArticles = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid article ID format" });
    }

    // Find the target article
    const targetArticle = await Article.findById(id);

    if (!targetArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Find related articles in the same category, excluding the target article
    const { category } = targetArticle;
    const relatedArticles = await Article.find({
      category: category,
      _id: { $ne: id }, // Exclude the target article
    })
      .limit(5) // Limit to 5 related articles
      .sort({ createdAt: -1 }) // Sort by latest
      .exec();

    // Respond with the related articles
    return res.status(200).json({
      message: "Related articles retrieved successfully",
      relatedArticles,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Latest artiles
export const getLatestArticles = async (req, res) => {
  try {
    // Find the latest article by sorting createdAt in descending order
    const latestArticle = await Article.find().sort({ createdAt: -1 }).exec();

    if (!latestArticle) {
      return res.status(404).json({ message: "No articles found" });
    }

    // Return the latest article
    return res.status(200).json({
      message: "Latest article retrieved successfully",
      article: latestArticle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving the latest article",
      error: error.message,
    });
  }
};

// Get user all articles
export const getUserArticles = async (req, res) => {
  try {
    const { id } = req.user;

    // Find all articles by the user
    const userArticles = await Article.find({ userID: id })
      .sort({ createdAt: -1 })
      .exec();

    if (!userArticles.length) {
      return res
        .status(404)
        .json({ message: "No articles found for this user" });
    }

    // Return the user's articles
    return res.status(200).json({
      message: "User articles retrieved successfully",
      articles: userArticles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving user articles",
      error: error.message,
    });
  }
};
