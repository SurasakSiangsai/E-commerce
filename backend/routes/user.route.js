import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserProfile, updateUserName } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", protectRoute, getUserProfile);
router.put("/profile/name", protectRoute, updateUserName); // Add route to update name

export default router;
