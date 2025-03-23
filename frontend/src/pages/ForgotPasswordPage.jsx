import { useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post("/auth/forgot-password", { email });
			toast.success("Password reset email sent successfully");
		} catch (error) {
			toast.error(error.response?.data?.error || "Failed to send reset email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<h2 className='text-center text-3xl font-extrabold text-emerald-400'>Forgot Password</h2>
			<form onSubmit={handleSubmit} className='mt-8 space-y-6'>
				<div>
					<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
						Email address
					</label>
					<input
						id='email'
						type='email'
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white'
					/>
				</div>
				<button
					type='submit'
					className='w-full py-2 px-4 bg-emerald-600 text-white rounded-md'
					disabled={loading}
				>
					{loading ? "Sending..." : "Send Reset Email"}
				</button>
			</form>
		</div>
	);
};

export default ForgotPasswordPage;
