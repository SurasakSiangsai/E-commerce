import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
	console.error("STRIPE_SECRET_KEY is not defined in the .env file");
	throw new Error("Stripe secret key is missing");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
