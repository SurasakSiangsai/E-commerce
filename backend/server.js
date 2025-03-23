import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import userRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import { socketAuth } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user", userRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err.message);
	process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err.message);
	process.exit(1);
});

// Start the server and initialize Socket.io
const server = app.listen(PORT, async () => {
	try {
		await connectDB();
		console.log("Server is running on http://localhost:" + PORT);
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error.message);
		process.exit(1);
	}
});

const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL,
		credentials: true,
	},
});

// Apply socketAuth middleware
io.use(socketAuth);

io.on("connection", (socket) => {
	console.log("New client connected:", socket.id);

	// Join the seller to their room
	if (socket.user.role === "seller") {
		socket.join(socket.user._id.toString());
		console.log(`Seller joined room: ${socket.user._id}`);
	}

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

export { io };
