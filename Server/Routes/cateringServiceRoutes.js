import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import {
  addCateringService,
  getCateringServices,
  updateCateringService,
  deleteCateringService,
  getCateringByCategory,
  getCateringServiceById,
  updateCateringServiceStatus,
} from "../Controller/cateringServiceController.js";
import upload from "../Config/multerConfig.js";
import CateringService from "../Models/CateringService.js"; 
const router = express.Router();

// Public Routes - View Catering Services
router.get("/", getCateringServices); // Get all catering services
router.get("/filter", getCateringByCategory); // Get by Veg/Non-Veg category

// Protected Route - Fetch managed catering services 
router.get("/managed", protect, authorize("manager"), async (req, res) => {
  try {
    console.log("Fetching managed services for manager:", req.user._id);
    const cateringServices = await CateringService.find({ manager: req.user._id })
      .populate("categories", "name")
      .populate("menuItems", "name price");
    console.log("Fetched catering services:", cateringServices);
    res.json(cateringServices);
  } catch (error) {
    console.error("Error fetching managed catering services:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Public Route - Get a specific catering service by ID 
router.get("/:id", getCateringServiceById);

// Protected Routes - Only Managers can modify services
router.post("/", protect, authorize("manager"), upload.single("image"), addCateringService);
router.put("/:id", protect, authorize("manager"), upload.single("image"), updateCateringService);
router.delete("/:id", protect, authorize("manager"), deleteCateringService);

// Admin Route - Update Catering Service Status
router.put("/:id/status", protect, authorize("admin"), updateCateringServiceStatus);

export default router;