import mongoose from 'mongoose'

const MenuCategorySchema = new mongoose.Schema({
  cateringService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CateringService",
    required: true,
  },
  name: {
    type: String,
    enum: ["Veg", "Non-Veg"],
    required: true,
  },
});

const MenuCategory = mongoose.model("MenuCategory", MenuCategorySchema);
export default MenuCategory;
