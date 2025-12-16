import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Example: Only Admins can manage catering services
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome, Admin!", user: req.user });
});

export default router;