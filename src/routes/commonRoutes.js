import express from 'express';
import {login, refreshAccessToken} from "../controllers/commonController.js";
const router = express.Router();

router.post("/login", login);
router.post('/refresh-token', refreshAccessToken);

export default router;