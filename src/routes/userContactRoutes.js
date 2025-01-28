import express from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContact,
} from "../controllers/userContractController.js";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
const router = express.Router();

router.post("/contact", verifyToken, createContact);
router.get("/contact",verifyToken,checkRole(["superAdmin,admin"]), getAllContacts);
router.get("/contact/:id",checkRole(["superAdmin,admin"]), getContact);
router.delete("/contact/:id",verifyToken,checkRole(["superAdmin,admin"]), deleteContact);

export default router;
