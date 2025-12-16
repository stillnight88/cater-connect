// In Controller/menuItemController.js
import MenuItem from "../Models/MenuItem.js";
import MenuCategory from "../Models/MenuCategory.js";

// ✅ Add a Menu Item (Only by Catering Manager)
export const addMenuItem = async (req, res) => {
  try {
    const { categoryId, cateringServiceId, name, price } = req.body;
    
    // Check if category exists
    const category = await MenuCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Handle the image path
    const imagePath = req.file ? req.file.path : undefined;
    
    // Create menu item
    const menuItem = await MenuItem.create({ 
      category: categoryId, 
      cateringService: cateringServiceId, 
      name, 
      price,
      image: imagePath 
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Menu Items for a Category
export const getMenuItems = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const menuItems = await MenuItem.find({ category: categoryId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a Menu Item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a Menu Item
// Controller/menuItemController.js
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, cateringServiceId } = req.body;

    console.log("Update request:", {
      userId: req.user._id,
      userRole: req.user.role,
      itemId: id,
      body: req.body,
      file: req.file ? req.file.path : "No file uploaded",
    });

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    console.log("Menu item cateringService:", menuItem.cateringService);
    console.log("User's managedServices:", req.user.managedServices);

    // Check if the user manages the catering service
    if (menuItem.cateringService.toString() !== cateringServiceId) {
      return res.status(403).json({
        message: "You can only update menu items for catering services you manage",
      });
    }

    // Update fields only if provided in the request
    menuItem.name = name || menuItem.name;
    menuItem.price = price || menuItem.price;
    menuItem.category = categoryId || menuItem.category;
    menuItem.cateringService = cateringServiceId || menuItem.cateringService;

    // Handle image upload if a new file is provided
    if (req.file) {
      menuItem.image = `/uploads/${req.file.filename}`.replace(/\\/g, "/");
    }

    // Save the updated menu item
    const updatedMenuItem = await menuItem.save();
    console.log("Updated menu item:", updatedMenuItem);

    res.json(updatedMenuItem);
  } catch (error) {
    console.error("Update error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};