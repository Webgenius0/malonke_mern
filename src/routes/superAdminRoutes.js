import express from 'express';
import {createSuperAdmin} from "../controllers/superAdminController.js";
const router = express.Router();

router.post('/create', createSuperAdmin);

export default router;