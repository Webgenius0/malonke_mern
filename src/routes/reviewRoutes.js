import express from "express";
// import verifyToken from "../middlewares/verifyToken.js";
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  updateReview,
} from "../controllers/reviewController.js";
const router = express.Router();

router.post("/", createReview);
router.get("/", getReviews);
router.get("/:id", getReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
