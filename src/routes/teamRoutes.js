import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {checkRole} from "../middlewares/checkRole.js";
import {
    createTeamMember,
    deleteTeamMember, getAllTeamMembers, getCEO,
    getTeamMemberById, getTeamWithoutCEO,
    updateTeamMember
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/", verifyToken, checkRole(['superAdmin']),createTeamMember);
router.get("/:id", getTeamMemberById);
router.put("/:id", verifyToken, checkRole(['superAdmin']),updateTeamMember);
router.delete("/:id", verifyToken, checkRole(['superAdmin']),deleteTeamMember);
router.get("/ceo/data",getCEO);
router.get("/without-ceo/data",getTeamWithoutCEO);
router.get('/',getAllTeamMembers);


export default router;