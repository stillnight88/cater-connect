import mongoose from 'mongoose';

const CateringServiceSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending", 
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory", 
    },
  ],
  menuItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem", 
    },
  ],
});

const CateringService = mongoose.model("CateringService", CateringServiceSchema);
export default CateringService;