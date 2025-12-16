import express from "express";
import { registerUser, loginUser, getMe, updateUserProfile, registerManager } from "../Controller/authController.js";
import { protect } from "../Middleware/authMiddleware.js";
import upload from "../Config/multerConfig.js";

const router = express.Router();


router.post("/register", upload.single("image"), registerUser);
router.post("/register-manager", upload.single("image"), registerManager);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("image"), updateUserProfile);

export default router;