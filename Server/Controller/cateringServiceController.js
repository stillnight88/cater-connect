import CateringService from "../Models/CateringService.js";
import MenuCategory from "../Models/MenuCategory.js";
import MenuItem from "../Models/MenuItem.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add a Catering Service (Only for Managers)
export const addCateringService = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    console.log("Request body:", req.body);
    console.log("Request file:", req.file); 

    let imageData = {};
    if (req.file) {
      imageData.image = `/uploads/${req.file.filename}`.replace(/\\/g, "/");
    } else {
      console.log("No image uploaded");
    }

    const cateringService = await CateringService.create({
      name,
      description,
      location,
      manager: req.user._id,
      ...imageData,
    });

    res.status(201).json(cateringService);
  } catch (error) {
    console.error("Error in addCateringService:", error); 
    res.status(500).json({ 
      message: "Failed to create catering service", 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Get All Catering Services (With Category & Menu)
export const getCateringServices = async (req, res) => {
  try {
    const cateringServices = await CateringService.find()
      .populate("manager", "name email") // Show manager details
      .populate("categories", "name") // Show category name
      .populate("menuItems", "name price"); // Show menu items

    res.json(cateringServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Catering Service (Only by the Manager who created it)
export const updateCateringService = async (req, res) => {
  try {
    const { id } = req.params;
    const cateringService = await CateringService.findById(id);
    if (!cateringService) return res.status(404).json({ message: "Catering service not found" });
    if (cateringService.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this service" });
    }
    console.log("Updating catering service with data:", req.body); // Optional log
    let updateData = { ...req.body };
    if (req.file) {
      if (cateringService.image) {
        const oldImagePath = path.join(__dirname, "..", cateringService.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const updatedService = await CateringService.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedService);
  } catch (error) {
    console.error("Error in updateCateringService:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a Catering Service (Only by the Manager who created it)
export const deleteCateringService = async (req, res) => {
  try {
    const { id } = req.params;
    const cateringService = await CateringService.findById(id);

    if (!cateringService) return res.status(404).json({ message: "Catering service not found" });

    if (cateringService.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }

    // Delete associated image from the filesystem
    if (cateringService.image) {
      const imagePath = path.join(__dirname, "..", cateringService.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await CateringService.findByIdAndDelete(id);
    res.json({ message: "Catering service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Catering Services by Category (Veg/Non-Veg)
export const getCateringByCategory = async (req, res) => {
  try {
    const { category } = req.query; // Get filter category from query params

    if (!category || !["Veg", "Non-Veg"].includes(category)) {
      return res.status(400).json({ message: "Invalid category. Use 'Veg' or 'Non-Veg'" });
    }

    // Find Menu Categories matching the filter
    const menuCategories = await MenuCategory.find({ name: category });

    // Extract Catering Service IDs from the categories
    const cateringServiceIds = menuCategories.map((menu) => menu.cateringService);

    // Find Catering Services that match the IDs
    const cateringServices = await CateringService.find({ _id: { $in: cateringServiceIds } });

    res.json(cateringServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Catering Service by ID
export const getCateringServiceById = async (req, res) => {
  try {
    const service = await CateringService.findById(req.params.id)
      .populate("manager", "name email phoneNumber"); // Add email and phoneNumber
    if (!service) {
      return res.status(404).json({ message: "Catering Service Not Found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Catering Service Status (Only by Admin)
export const updateCateringServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const cateringService = await CateringService.findById(id);
    if (!cateringService) {
      return res.status(404).json({ message: "Catering service not found" });
    }

    // Update the status
    cateringService.status = status;
    const updatedService = await cateringService.save();

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};