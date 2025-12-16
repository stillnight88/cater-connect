import Contact from "../Models/Contact.js";

// User Sends a Contact Message
export const sendMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const newContact = await Contact.create({
      user: req.user._id,
      subject,
      message,
    });

    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Admin Gets All Contact Messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().populate("user", "name email").sort({ date: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
