import express from "express";
import { createProduct, deleteProduct } from "../controllers/product.controller.js";
import { protectRoute, isSellerOrAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, isSellerOrAdmin, createProduct); // Sellers can create their own products
router.delete("/:id", protectRoute, isSellerOrAdmin, deleteProduct); // Admins can delete any product, sellers can delete their own

export default router;