import express from 'express';
import {registration, verifyOtp} from "../controllers/userController.js";
const router = express.Router();

router.post("/registration", registration);
router.post("/verify-otp", verifyOtp);

export default router;