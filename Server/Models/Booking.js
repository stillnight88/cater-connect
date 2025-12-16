import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // The user who booked
    required: true,
  },
  cateringService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CateringService", // The catering service booked
    required: true,
  },
  menuItems: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      }
    }
  ],
  eventDate: {
    type: Date,
    required: true,
  },
  eventLocation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
