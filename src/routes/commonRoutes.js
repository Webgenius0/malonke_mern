import express from 'express';
import {changePassword, checkForRole, login} from "../controllers/commonController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

router.post("/login", login);
router.post('/change-password',verifyToken,changePassword );
router.get('/check-for-role/:role', checkForRole);

export default router;