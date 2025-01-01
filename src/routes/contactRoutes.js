import express from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContact,
} from "../controllers/contractController.js";
const router = express.Router();

router.post("/", createContact);
router.get("/", getAllContacts);
router.get("/:id", getContact);
router.delete("/:id", deleteContact);

export default router;
