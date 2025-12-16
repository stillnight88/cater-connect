import mongoose from 'mongoose'

const MenuItemSchema = new mongoose.Schema({
  cateringService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CateringService",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuCategory",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: "default-food-image.jpg" // You can set a default image
  }
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
export default MenuItem;