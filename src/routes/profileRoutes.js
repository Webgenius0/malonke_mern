import express from "express";
import {
  createOrUpdateProfile,
  getProfile,
} from "../controllers/profileController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrUpdateProfile);
router.get("/:userID", getProfile);

export default router;
