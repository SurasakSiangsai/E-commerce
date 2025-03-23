import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const token = searchParams.get("token"); // Extract token from URL

	useEffect(() => {
		if (!token) {
			toast.error("Invalid or missing token");
			navigate("/forgot-password");
		}
	}, [token, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post("/auth/reset-password", { token, password });
			toast.success("Password reset successfully");
			navigate("/login"); // Redirect to login page
		} catch (error) {
			toast.error(error.response?.data?.error || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<h2 className='text-center text-3xl font-extrabold text-emerald-400'>Reset Password</h2>
			<form onSubmit={handleSubmit} className='mt-8 space-y-6'>
				<div>
					<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
						New Password
					</label>
					<input
						id='password'
						type='password'
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white'
					/>
				</div>
				<button
					type='submit'
					className='w-full py-2 px-4 bg-emerald-600 text-white rounded-md'
					disabled={loading}
				>
					{loading ? "Resetting..." : "Reset Password"}
				</button>
			</form>
		</div>
	);
};

export default ResetPasswordPage;
