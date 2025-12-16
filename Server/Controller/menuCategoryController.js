import MenuCategory from "../Models/MenuCategory.js";
import CateringService from "../Models/CateringService.js";

// Add a Category (Only by Catering Manager)
export const addCategory = async (req, res) => {
  try {
    const { cateringServiceId, name } = req.body;
    const cateringService = await CateringService.findById(cateringServiceId);
    if (!cateringService) return res.status(404).json({ message: "Catering service not found" });
    if (cateringService.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to add categories to this service" });
    }
    const category = await MenuCategory.create({ cateringService: cateringServiceId, name });
    cateringService.categories.push(category._id);
    await cateringService.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Category (Only by Catering Manager)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MenuCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const cateringService = await CateringService.findById(category.cateringService);
    if (cateringService.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this category" });
    }

    await MenuCategory.findByIdAndDelete(id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};