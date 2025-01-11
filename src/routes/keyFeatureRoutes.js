import express from "express";
const router = express.Router();
import { createKeyFeature, getKeyFeatures,updateKeyFeature,deleteKeyFeature } from "../controllers/keyFeatureController.js";
import {checkRole} from "../middlewares/checkRole.js";
import verifyToken from "../middlewares/verifyToken.js";

router.post("/create",verifyToken,checkRole(["superAdmin"]), createKeyFeature);
router.get("/all", getKeyFeatures);
router.put("/update/:id",verifyToken,checkRole(["superAdmin"]), updateKeyFeature);
router.delete("/remove/:id",verifyToken,checkRole(["superAdmin"]), deleteKeyFeature);

export default router;