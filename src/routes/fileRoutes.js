import express from "express";
import upload from "../middlewares/multer-config.js";
import {
    checkPackageTimeLimit,
    checkStorageLimit,
    fileList, getAdminUserFile,
    startedFile, unstarredFile,
    uploadFiles
} from "../controllers/fileController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();


router.post('/upload', verifyToken, upload.array('files', 5), uploadFiles);

router.get("/check-limit",verifyToken,checkStorageLimit);
router.get("/check-time",verifyToken,checkPackageTimeLimit);
router.get("/list",verifyToken,fileList);
router.post("/star-file/:id",verifyToken,startedFile);
router.post("/unstar-file/:id",verifyToken,unstarredFile);
router.get("/user-file",verifyToken, getAdminUserFile);


export default router;
