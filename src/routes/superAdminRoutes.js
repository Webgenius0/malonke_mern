import express from 'express';
import {createSuperAdmin, totalWebFileUser} from "../controllers/superAdminController.js";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
const router = express.Router();

router.post('/create', createSuperAdmin);
router.get('/stats', verifyToken,checkRole(['superAdmin']),totalWebFileUser);

export default router;