import express from "express";
import User from "../Models/User.js"; // Import User model
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

export default router;
