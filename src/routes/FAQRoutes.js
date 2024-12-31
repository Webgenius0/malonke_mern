import express from "express";
import {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} from "../controllers/FAQController.js";

const router = express.Router();

// Route to create a new FAQ
router.post("/", createFAQ);

// Route to get all FAQs
router.get("/", getAllFAQs);

// Route to update an existing FAQ
router.put("/:id", updateFAQ);

// Route to delete an FAQ
router.delete("/:id", deleteFAQ);

export default router;
