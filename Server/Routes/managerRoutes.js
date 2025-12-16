import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Example: Only Catering Managers can manage services
router.get("/manage", protect, authorize("manager"), (req, res) => {
  res.json({ message: "Welcome, Catering Manager!", user: req.user });
});

export default router;