import express from "express";
import { getMenuByPrice } from "../Controller/menuController.js";

const router = express.Router();

// Get Menu Items by Price Range
router.get("/filter", getMenuByPrice);

export default router;
