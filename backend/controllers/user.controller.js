import Order from "../models/order.model.js";

export const getUserProfile = async (req, res) => {
	try {
		const { name, email, role } = req.user;

		let notifications = [];
		let bills = [];

		if (role === "admin" || role === "seller") {
			notifications = await Order.find({ "products.product.createdBy": req.user._id })
				.populate("products.product", "name")
				.populate("user", "name email")
				.sort({ createdAt: -1 });

			// Fetch bills for sellers
			bills = await Order.find({ "products.product.createdBy": req.user._id })
				.populate("products.product", "name")
				.populate("user", "name email")
				.sort({ createdAt: -1 });
		}

		if (role === "customer") {
			bills = await Order.find({ user: req.user._id })
				.populate("products.product", "name createdBy")
				.sort({ createdAt: -1 });
		}

		res.json({ name, email, role, notifications, bills });
	} catch (error) {
		console.error("Error fetching user profile:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateUserName = async (req, res) => {
	try {
		const { name } = req.body;

		if (!name || name.trim() === "") {
			return res.status(400).json({ message: "Name cannot be empty" });
		}

		req.user.name = name.trim();
		await req.user.save();

		res.json({ message: "Name updated successfully", name: req.user.name });
	} catch (error) {
		console.error("Error updating user name:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
