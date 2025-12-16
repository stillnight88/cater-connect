import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import { createFeedback, getFeedbackForService, getAllFeedbacks,deleteFeedback,getFeedbackForManagerService } from "../Controller/feedbackController.js";

const router = express.Router();

//  Users: Submit Feedback
router.post("/", protect, authorize("user"), createFeedback);

// Public: Get Feedback for a Catering Service
router.get("/:cateringServiceId", getFeedbackForService);

router.get("/:cateringServiceId", protect, authorize("manager"), getFeedbackForManagerService);


//  Admin: Get All Feedbacks
router.get("/", protect, authorize("admin"), getAllFeedbacks);

//  Admin: Delete Feedback
router.delete("/:id", protect, authorize("admin"), deleteFeedback);


export default router;
