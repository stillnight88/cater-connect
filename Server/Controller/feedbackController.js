import Feedback from "../Models/Feedback.js";
import CateringService from "../Models/CateringService.js";

// Create Feedback (Only Users)
export const createFeedback = async (req, res) => {
  try {
    const { cateringServiceId, rating, comment } = req.body;

    // Check if Catering Service exists
    const cateringService = await CateringService.findById(cateringServiceId);
    if (!cateringService) {
      return res.status(404).json({ message: "Catering service not found" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      cateringService: cateringServiceId,
      rating,
      comment,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Feedback for a Catering Service
export const getFeedbackForService = async (req, res) => {
  try {
    const { cateringServiceId } = req.params;

    const feedbacks = await Feedback.find({ cateringService: cateringServiceId })
      .populate("user", "name")
      .sort({ date: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Feedback for Catering Manager's Service
export const getFeedbackForManagerService = async (req, res) => {
  try {
    const { cateringServiceId } = req.params;

    // Check if the logged-in manager owns this catering service
    const cateringService = await CateringService.findOne({
      _id: cateringServiceId,
      manager: req.user._id, // Ensure the manager owns this service
    });

    if (!cateringService) {
      return res.status(403).json({ message: "Access denied" });
    }

    const feedbacks = await Feedback.find({ cateringService: cateringServiceId })
      .populate("user", "name")
      .sort({ date: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Feedbacks (For Admin)
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name")
      .populate("cateringService", "name")
      .sort({ date: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Feedback (Admin Only)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete feedback with ID:", id);

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      console.log("Feedback not found in database.");
      return res.status(404).json({ message: "Feedback not found" });
    }

    await feedback.deleteOne();
    console.log("Feedback deleted successfully:", id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: error.message });
  }
};
