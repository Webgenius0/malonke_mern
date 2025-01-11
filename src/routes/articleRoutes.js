import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  updateArticle,
} from "../controllers/articleController.js";
// import verifyToken from "../middlewares/verifyToken.js";
// import {checkRole} from "../middlewares/checkRole.js";
const router = express.Router();

router.post("/", createArticle);
router.get("/", getArticles);
router.get("/:id", getArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
