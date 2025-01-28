import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
import {createAdminContact, getAdminContact, getAllAdminContacts,deleteAdminContact} from "../controllers/adminContactController.js";
const router = express.Router();

router.post("/contact", verifyToken, createAdminContact);
router.get("/contact",verifyToken,checkRole(["superAdmin"]), getAllAdminContacts);
router.get("/contact/:id",checkRole(["superAdmin"]), getAdminContact);
router.delete("/contact/:id",verifyToken,checkRole(["superAdmin"]), deleteAdminContact);

export default router;
