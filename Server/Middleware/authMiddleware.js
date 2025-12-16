import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

//  Protect Routes (Check if User is Logged In)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password"); // Attach user to request

      if (!req.user) {
        console.log("🔴 User not found in DB!");
        return res.status(401).json({ message: "User not found!" });
      }

      console.log("✅ Authenticated User:", req.user);
      next();
    } catch (error) {
      console.log("🔴 Invalid Token:", error);
      return res.status(401).json({ message: "Invalid or expired token!" });
    }
  } else {
    console.log("🔴 No token provided");
    return res.status(401).json({ message: "Access denied! No token provided." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("🔹 Checking authorization...");
    console.log("🔹 User Role:", req.user?.role);
    console.log("🔹 Required Roles:", roles);
    console.log("🔹 User ID:", req.user?._id);
    
    if (!req.user) {
      console.log("🔴 User is not logged in");
      return res.status(401).json({ message: "Not authorized!" });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`🔴 Access Denied! User role: ${req.user.role}, Required: ${roles.join(", ")}`);
      return res.status(403).json({ 
        message: `Access denied! User role: ${req.user.role}, Required roles: ${roles.join(', ')}` 
      });
    }

    console.log("✅ User authorized!");
    next();
  };
};


