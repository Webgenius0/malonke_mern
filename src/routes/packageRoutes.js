import express from "express";
import {createPackage} from "../controllers/packageController.js";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";

const router = express.Router();

router.post("/",verifyToken,checkRole(["superAdmin"]), createPackage);

export default router;