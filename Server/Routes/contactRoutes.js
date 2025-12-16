import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import { sendMessage, getAllMessages } from "../Controller/contactController.js";

const router = express.Router();

//  Users & Catering Managers: Send a Message
router.post("/", protect, authorize("user", "manager"), sendMessage);

//  Admin: View All Messages
router.get("/", protect, authorize("admin"), getAllMessages);

export default router;
