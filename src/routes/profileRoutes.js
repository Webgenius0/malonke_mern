import express from "express";
import {
  createOrUpdateProfile, getUserInfo, updateAvatar,
} from "../controllers/profileController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrUpdateProfile);
router.get("/user-info",verifyToken,getUserInfo);
router.put("/avatar",verifyToken, updateAvatar);

export default router;
