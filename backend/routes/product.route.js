import express from "express";
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getFeaturedProducts,
	getProductsByCategory,
	getRecommendedProducts,
	toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute, isSellerOrAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, isSellerOrAdmin, getAllProducts); // Allow sellers to fetch their own products
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, isSellerOrAdmin, createProduct); // Ensure only sellers or admins can create products
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct); // Only admins can toggle featured
router.delete("/:id", protectRoute, isSellerOrAdmin, deleteProduct); // Admins can delete any product, sellers can delete their own

export default router;
