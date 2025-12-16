import express from "express";
import { protect, authorize } from "../Middleware/authMiddleware.js";
import { addMenuItem, getMenuItems, deleteMenuItem, updateMenuItem  } from "../Controller/menuItemController.js";
import MenuItem from "../Models/MenuItem.js";
import upload from "../Config/multerConfig.js";
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, cateringServiceId } = req.query;
    let query = {};

    if (category) query.category = category;
    
    if (cateringServiceId) query.cateringService = cateringServiceId; // 🔥 Add this line to filter by catering service
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const menuItems = await MenuItem.find(query)
      .populate("category")
      .populate("cateringService"); // Optional: Include catering service details

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

//  Get Menu Items for a Category (Public)
router.get("/:categoryId", getMenuItems);

//  Protected Routes - Only Managers can modify menu items
router.post("/", protect, authorize("manager"), upload.single('image'), addMenuItem);
router.delete("/:id", protect, authorize("manager"), deleteMenuItem);
router.put("/:id", protect, authorize("manager"), upload.single('image'), updateMenuItem);

export default router;
