import express from "express";
import { createAdmin, getAllAdmin } from "../controllers/adminController.js";
import { checkRole } from "../middlewares/checkRole.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/create", verifyToken, checkRole(["superAdmin"]), createAdmin);
router.get("/", getAllAdmin);

export default router;
