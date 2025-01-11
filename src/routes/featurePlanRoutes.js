import express from "express";
import {
  createFeature,
  deleteFeature,
  getFeature,
  getFeatures,
  updateFeature,
} from "../controllers/featurePlanController.js";
// import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", createFeature);
router.get("/", getFeatures);
router.get("/:id", getFeature);
router.put("/:id", updateFeature);
router.delete("/:id", deleteFeature);

export default router;
