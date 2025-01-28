import express from 'express';
import {
    changePassword,
    checkForRole,
    login,
    requestPasswordReset,
    resetPassword,
    verifyOTP
} from "../controllers/commonController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/login", login);
router.post('/change-password',verifyToken,changePassword );
router.get('/check-for-role/:role', checkForRole);
router.post("/reset-password",requestPasswordReset);
router.post("/verify-otp",verifyOTP);
router.post('/set-password',resetPassword);


export default router;