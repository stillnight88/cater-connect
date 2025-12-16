import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import { addCategory, deleteCategory } from "../Controller/menuCategoryController.js";
import MenuCategory from "../Models/MenuCategory.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { cateringServiceId } = req.query;
    console.log("GET /api/categories - cateringServiceId:", cateringServiceId);

    if (cateringServiceId && !mongoose.Types.ObjectId.isValid(cateringServiceId)) {
      return res.status(400).json({ message: "Invalid cateringServiceId" });
    }

    const filter = cateringServiceId ? { cateringService: cateringServiceId } : {};
    const categories = await MenuCategory.find(filter);
    console.log("Categories retrieved:", categories);
    res.json(categories);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    res.status(500).json({ message: "Server error while fetching categories", error: error.message });
  }
});

router.post("/", protect, authorize("manager"), addCategory);
router.delete("/:id", protect, authorize("manager"), deleteCategory);

export default router;