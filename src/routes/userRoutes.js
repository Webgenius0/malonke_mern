import express from "express";
import {
  createUser,
  getAllusers,
  isUserVerified,
  sendInviteLink,
  verifyMagicLink,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { checkRole } from "../middlewares/checkRole.js";
const router = express.Router();

router.post("/send-link", verifyToken, checkRole(["admin"]), sendInviteLink);
router.post("/verify-link", verifyMagicLink);
router.post("/create-user", createUser);
router.get("/", getAllusers);
router.get("/is-verified/:email", isUserVerified);
router.get("/is-verified/:email", isUserVerified);


export default router;
