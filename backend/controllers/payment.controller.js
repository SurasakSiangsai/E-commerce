import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js"; // Import the Product model
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js"; // Ensure User model is imported
import nodemailer from "nodemailer"; // Import nodemailer
import { io } from "../server.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		// Validate products array
		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		// Validate and prepare line items
		const lineItems = products.map((product) => {
			if (!product.name || !product.price || !product.quantity) {
				throw new Error("Product data is incomplete");
			}

			const amount = Math.round(product.price * 100); // Convert to cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: product.image ? [product.image] : [], // Ensure image is optional
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		// Handle coupon logic
		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.FRONTEND_URL}/purchase-cancel`,
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error in createCheckoutSession:", error.message);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		if (!sessionId) {
			return res.status(400).json({ message: "Session ID is required" });
		}

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					 }
				 );
			}

			// Create a new Order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: await Promise.all(
					products.map(async (product) => {
						const productDetails = await Product.findById(product.id).populate("createdBy", "name");
						if (!productDetails) {
							throw new Error(`Product with ID ${product.id} not found`);
						}
						return {
							product: product.id,
							quantity: product.quantity,
							price: product.price,
							sellerId: productDetails.createdBy._id, // Include seller's ID
							sellerName: productDetails.createdBy.name, // Include seller's name
						};
					})
				),
				totalAmount: session.amount_total / 100, // Convert from cents to dollars
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			// Clear the user's cart after successful payment
			const user = await User.findById(session.metadata.userId);
			if (!user) {
				throw new Error(`User with ID ${session.metadata.userId} not found`);
			}
			user.cartItems = [];
			await user.save();

			// Generate a bill
			const bill = {
				orderId: newOrder._id,
				user: {
					name: user.name,
					email: user.email,
				},
				products: newOrder.products,
				totalAmount: newOrder.totalAmount,
				createdAt: newOrder.createdAt,
			};

			 // Add the bill to each seller's record
			 for (const product of bill.products) {
				const seller = await User.findById(product.sellerId);
				if (seller) {
					if (!seller.bills) seller.bills = [];
					seller.bills.push({
						orderId: bill.orderId,
						totalAmount: bill.totalAmount,
						createdAt: bill.createdAt,
						products: bill.products.filter((p) => p.sellerId.toString() === seller._id.toString()),
					});
					await seller.save();
				}
			}

			// Send email to sellers
			await sendEmailToSellers(bill);

			// Notify sellers in real-time
			for (const product of bill.products) {
				const seller = await User.findById(product.sellerId);
				if (seller) {
					io.to(seller._id.toString()).emit("new-order", {
						message: `Your product "${product.product.name}" has been purchased.`,
						orderId: bill.orderId,
						quantity: product.quantity,
						totalAmount: bill.totalAmount,
						buyer: bill.user,
					});
				}
			}

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				bill,
			});
		} else {
			res.status(400).json({ message: "Payment not completed" });
		}
	} catch (error) {
		console.error("Error in checkoutSuccess:", error.message);
		res.status(500).json({ message: "Internal Server Error", error: error.message });
	}
};

async function sendEmailToSellers(bill) {
	try {
		// Configure nodemailer
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// Send email to each seller
		for (const product of bill.products) {
			const seller = await User.findById(product.product.createdBy); // Fetch seller details
			if (seller && seller.email) {
				console.log(`Sending email to seller: ${seller.email}`); // Debug log
				await transporter.sendMail({
					from: process.env.EMAIL_USER,
					to: seller.email,
					subject: "New Purchase Notification",
					html: `
						<h3>New Purchase Notification</h3>
						<p>Dear ${seller.name},</p>
						<p>Your product <strong>${product.product.name}</strong> has been purchased.</p>
						<p>Quantity: ${product.quantity}</p>
						<p>Price: $${product.price.toFixed(2)}</p>
						<p>Total Amount: $${bill.totalAmount.toFixed(2)}</p>
						<p>Order ID: ${bill.orderId}</p>
						<p>Buyer: ${bill.user.name} (${bill.user.email})</p>
						<p>Date: ${new Date(bill.createdAt).toLocaleString()}</p>
					`,
					});
				console.log(`Email sent successfully to ${seller.email}`); // Debug log
			} else {
				console.log(`Seller not found or email missing for product: ${product.product.name}`); // Debug log
			}
		}
	} catch (error) {
		console.error("Error sending email to sellers:", error.message);
	}
}

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
