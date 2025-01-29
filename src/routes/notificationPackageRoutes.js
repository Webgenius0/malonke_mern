import express from "express";
import {
    createContactSubmission,
    getAllNotifications,
    getNotification, markAsRead
} from "../controllers/packageContactConrtroller.js";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
const router = express.Router();

router.post("/", createContactSubmission);
router.get("/", verifyToken, checkRole(['superAdmin']), getAllNotifications);
router.get("/:id", verifyToken, checkRole(['superAdmin']), getNotification);
router.put("/mark-read/:id",verifyToken,checkRole(['superAdmin']),markAsRead);

export default router;