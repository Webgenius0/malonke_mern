import express from "express";
import upload from "../middlewares/multer-config.js";
import {checkPackageTimeLimit, checkStorageLimit, uploadFile} from "../controllers/fileController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();


router.post('/upload',verifyToken, upload.single('file'), checkStorageLimit, uploadFile);
router.get("/check-limit",verifyToken,checkStorageLimit);
router.get("/check-time",verifyToken,checkPackageTimeLimit);


export default router;
