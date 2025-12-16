import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import { createBooking, getUserBookings, getCateringBookings, updateBookingStatus,getAllBookings } from "../Controller/bookingController.js";

const router = express.Router();

//  User Routes
router.post("/", protect, authorize("user"), createBooking);
router.get("/my", protect, authorize("user"), getUserBookings);

//  Catering Manager Routes
router.get("/:cateringServiceId", protect, authorize("manager"), getCateringBookings);
router.put("/:id", protect, authorize("manager"), updateBookingStatus);

// Admin Route
router.get("/", protect, authorize("admin"), getAllBookings);

export default router;
