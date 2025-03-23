import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

export const protectRoute = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;
			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};

export const isSellerOrAdmin = (req, res, next) => {
	if (req.user.role === "seller" || req.user.role === "admin") {
		next();
	} else {
		res.status(403).json({ message: "Access denied. Only sellers or admins can perform this action." });
	}
};

export const socketAuth = (socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) throw new Error("Authentication token is missing");

		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		socket.user = decoded;
		next();
	} catch (error) {
		console.error("Socket authentication error:", error.message);
		next(new Error("Unauthorized"));
	}
};
