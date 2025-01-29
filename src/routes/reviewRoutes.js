import express from "express";
// import verifyToken from "../middlewares/verifyToken.js";
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  updateReview,
} from "../controllers/reviewController.js";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
const router = express.Router();

router.post("/",verifyToken, createReview);
router.get("/", getReviews);
router.get("/:id", getReview);
router.put("/:id", updateReview);
router.delete("/:id",verifyToken,checkRole(['superAdmin']), deleteReview);

export default router;
