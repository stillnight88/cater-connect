import Booking from "../Models/Booking.js";
import MenuItem from "../Models/MenuItem.js";

//  Create a Booking
export const createBooking = async (req, res) => {
  try {
    const { cateringServiceId, menuItems, eventDate, eventLocation } = req.body;

    // Check if menu items exist
    for (let item of menuItems) {
      const menuItem = await MenuItem.findById(item.item);
      if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      cateringService: cateringServiceId,
      menuItems,
      eventDate,
      eventLocation,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("cateringService", "name location")
      .populate("menuItems.item", "name price")
      .select("eventDate eventLocation status cateringService menuItems"); // ✅ Include status

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Bookings for Catering Manager
export const getCateringBookings = async (req, res) => {
  try {
    let query = {};
    if (req.params.cateringServiceId) {
      // If a specific cateringServiceId is provided (optional use case)
      query = { cateringService: req.params.cateringServiceId };
    } else {
      // Fetch all catering services managed by the user
      const cateringServices = await CateringService.find({ manager: req.user._id });
      const serviceIds = cateringServices.map(service => service._id);
      query = { cateringService: { $in: serviceIds } };
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email")
      .populate("menuItems.item")
      .populate("cateringService", "name"); // Add cateringService name for clarity

    res.json(bookings);
  } catch (error) {
    console.error("Error in getCateringBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

//  Approve/Reject Booking (Only Manager)
export const updateBookingStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
  
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
  
      // ✅ Update the status only
      booking.status = status;
      await booking.save();
  
      res.json({ message: `Booking status updated to ${status}`, booking });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get All Bookings for Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("cateringService", "name location")
      .populate("menuItems.item", "name price")
      .select("eventDate eventLocation status cateringService menuItems user");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  