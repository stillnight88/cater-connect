import MenuItem from "../Models/MenuItem.js";

//  Get Menu Items by Price Range
export const getMenuByPrice = async (req, res) => {
  try {
    let { minPrice, maxPrice } = req.query;

    // Convert query params to numbers
    minPrice = Number(minPrice) || 0;
    maxPrice = Number(maxPrice) || Infinity;

    if (minPrice < 0 || maxPrice < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (minPrice > maxPrice) {
      return res.status(400).json({ message: "minPrice cannot be greater than maxPrice" });
    }

    // Find menu items within the price range
    const menuItems = await MenuItem.find({
      price: { $gte: minPrice, $lte: maxPrice },
    }).populate("cateringService", "name");

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
