import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
import {
    createExternalContact, deleteExternalContact,
    getAllExternalContacts,
    getExternalContactById
} from "../controllers/externalContactController.js";
const router = express.Router();

router.post("/contact", verifyToken, createExternalContact);
router.get("/contact",verifyToken,checkRole(["superAdmin"]), getAllExternalContacts);
router.get("/contact/:id",checkRole(["superAdmin"]), getExternalContactById);
router.delete("/contact/:id",verifyToken,checkRole(["superAdmin"]), deleteExternalContact);

export default router;
