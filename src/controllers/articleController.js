import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Article from "../models/articleModel.js";

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert image file to Base64
const convertImageToBase64 = (filePath) => {
  const imageData = fs.readFileSync(filePath);
  return imageData.toString("base64");
};

// Create article
export const createArticle = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userID = "67811b2e3cc1346af57fd510" || req.user.id;
    let imgUrl = "";

    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle file upload if avatar is provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const fileExtension = imageFile.name.split(".").pop();
      const validExtensions = ["jpeg", "jpg", "png"];

      if (!validExtensions.includes(fileExtension.toLowerCase())) {
        return res.status(400).json({ message: "Invalid file type for image" });
      }

      const fileName = `${userID}-image.${fileExtension}`;
      const filePath = path.join(__dirname, "../../public/uploads", fileName);

      await imageFile.mv(filePath);

      const base64Image = convertImageToBase64(filePath);
      imgUrl = `data:image/${fileExtension};base64,${base64Image}`;
    }

    const newArticle = new Article({
      userID,
      title,
      description,
      image: imgUrl,
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
    const { title, description } = req.body;
    const userID = "67811b2e3cc1346af57fd510" || req.user.id;
    const { id } = req.params;
    let imgUrl = "";

    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Handle file upload if image is provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const fileExtension = imageFile.name.split(".").pop();
      const validExtensions = ["jpeg", "jpg", "png"];

      if (!validExtensions.includes(fileExtension.toLowerCase())) {
        return res.status(400).json({ message: "Invalid file type for image" });
      }

      const fileName = `${userID}-image.${fileExtension}`;
      const filePath = path.join(__dirname, "../../public/uploads", fileName);

      await imageFile.mv(filePath);

      const base64Image = convertImageToBase64(filePath);
      imgUrl = `data:image/${fileExtension};base64,${base64Image}`;
    }

    article.title = title;
    article.description = description;
    article.image = imgUrl || article.image; // Update image only if new one is provided

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

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res
      .status(200)
      .json({ message: "Article retrieved successfully", article });
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
