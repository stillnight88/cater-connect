import express from "express";
import dotenv from "dotenv";
import dbconnection from "./Config/db.js";
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import managerRoutes from "./Routes/managerRoutes.js";
import cateringServiceRoutes from "./Routes/cateringServiceRoutes.js";
import menuCategoryRoutes from "./Routes/menuCategoryRoutes.js";
import menuItemRoutes from "./Routes/menuItemRoutes.js";
import bookingRoutes from "./Routes/bookingRoutes.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import contactRoutes from "./Routes/contactRoutes.js";
import menuRoutes from "./Routes/menuRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/catering-services", cateringServiceRoutes);
app.use("/api/categories", menuCategoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/menu", menuRoutes);

const startServer = async () => {
  await dbconnection(); // Wait for DB connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});