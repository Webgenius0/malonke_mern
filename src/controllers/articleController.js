// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
import Article from "../models/articleModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

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
    const { title, description, image,category } = req.body;
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
    article.category = category;

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
      return res.status(200).json({ message: "Article not found" });
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
    const { category } = req.params;
    const relatedArticles = await Article.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') },
    })
        .limit(3)
        .sort({ createdAt: -1 })
        .exec();

    if (relatedArticles.length === 0) {
      return res.status(404).json({ message: "No related articles found" });
    }

    return res.status(200).json({
      message: "Related articles retrieved successfully",
      relatedArticles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving related articles",
      error: error.message,
    });
  }
};



//Latest article
export const getLatestArticles = catchAsync(async (req, res, next) => {
  const pipeline = [
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "users",
        localField: "userID",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "user.adminID",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: {
        path: "$admin",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        title: 1,
        content: 1,
        image: 1,
        "admin.firstName": 1,
        "admin.lastName": 1,
        createdAt: 1,
      },
    },
  ];

  const latestArticle = await Article.aggregate(pipeline);

  if (!latestArticle || latestArticle.length === 0) {
    return next(new AppError("No articles found", 404));
  }

  res.status(200).json({
    message: "Latest article retrieved successfully",
    article: latestArticle[0],
  });
});


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
        .status(200)
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

//get all articles using aggregation
export const getArticles = catchAsync(async (req, res,next) => {
   const matchStage = {};
   const joinWithUser = {
    $lookup: {
      from: "users",
      localField: "userID",
      foreignField: "_id",
      as: "user",
    },
  };

  const unwindStage = {
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  };

  const joinWithAdmin ={$lookup: {
      from:"admins",localField: "user.adminID", foreignField: "_id",as: "admin",
    }}

  const unwindAdmin ={$unwind: {
      path: "$admin",
      preserveNullAndEmptyArrays: true,
    },}

  const projectStage = {
    $project: {
      title: 1,
      description: 1,
       image: 1,
      "admin.firstName": 1,
      "admin.lastName": 1,
      createdAt: 1,
    },
  };

  const data = await Article.aggregate([
    { $match: matchStage },
    joinWithUser,
    unwindStage,
    joinWithAdmin,
    unwindAdmin,
    projectStage
  ]);

  if (!data || data.length === 0) {
    return next(new AppError("No data found", 404));
  }

  res.status(200).json({ status: "success", data });
})
