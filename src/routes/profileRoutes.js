import express from "express";
import {
  createOrUpdateProfile,
  getProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/", createOrUpdateProfile);
router.get("/:userID", getProfile);

export default router;
