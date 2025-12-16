import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cateringService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CateringService",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
