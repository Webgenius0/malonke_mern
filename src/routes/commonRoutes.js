import express from 'express';
import {changePassword, login, refreshAccessToken} from "../controllers/commonController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/login", login);
router.post('/refresh-token',verifyToken, refreshAccessToken);
router.post('/change-password',verifyToken,changePassword );

export default router;