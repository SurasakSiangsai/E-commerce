import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		throw error; // Ensure the error propagates to the caller
	}
};
