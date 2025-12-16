import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const role = "user"; 
    
    
    let imagePath = "";
    if (req.file) {
      imagePath = req.file.path;
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create user
    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      role,
      phoneNumber,
      image: imagePath 
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber,
      image: newUser.image,
      token: generateToken(newUser._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manager Registration
export const registerManager = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, cateringService } = req.body; // Add cateringService
    const role = "manager";

    let imagePath = "";
    if (req.file) {
      imagePath = req.file.path;
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      role,
      phoneNumber,
      image: imagePath,
      cateringService // Save it
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber,
      image: newUser.image,
      cateringService: newUser.cateringService, // Return it
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        image: user.image,
        cateringService: user.cateringService, // Add this
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    
    // Update image if a new one was uploaded
    if (req.file) {
      user.image = req.file.path;
    }
    
    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      image: updatedUser.image,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};