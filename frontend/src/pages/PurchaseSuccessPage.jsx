import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; // Import useSearchParams
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { useCartStore } from "../stores/useCartStore";

const PurchaseSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const [bill, setBill] = useState(null);
	const [error, setError] = useState(null);
	const { clearCart } = useCartStore();
	const [searchParams] = useSearchParams(); // Use useSearchParams to get query parameters

	useEffect(() => {
		const handleCheckoutSuccess = async () => {
			const sessionId = searchParams.get("session_id"); // Ensure session_id is retrieved correctly
			if (!sessionId) {
				setError("No session ID found in the URL");
				setIsProcessing(false);
				return;
			}

			try {
				const res = await axios.post("/payments/checkout-success", {
					sessionId,
				});
				setBill(res.data.bill); // Ensure the bill is set correctly
				clearCart(); // Clear the cart after successful payment
			} catch (error) {
				console.error("Error in checkout success:", error.response?.data || error.message);
				setError(error.response?.data?.message || "An error occurred");
			} finally {
				setIsProcessing(false);
			}
		};

		handleCheckoutSuccess();
	}, [clearCart, searchParams]);

	if (isProcessing) return "Processing...";

	if (error) return `Error: ${error}`;

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>

					{/* Display Bill */}
					{bill && (
						<div className='bg-gray-700 rounded-lg p-4 mb-6'>
							<h2 className='text-lg font-semibold text-emerald-400 mb-4'>Your Bill</h2>
							<p className='text-sm text-gray-400'>Order ID: {bill.orderId}</p>
							<p className='text-sm text-gray-400'>Name: {bill.user.name}</p>
							<p className='text-sm text-gray-400'>Email: {bill.user.email}</p>
							<p className='text-sm text-gray-400'>Total Amount: ${bill.totalAmount.toFixed(2)}</p>
							<p className='text-sm text-gray-400'>Date: {new Date(bill.createdAt).toLocaleString()}</p>
							<ul className='mt-4'>
								{bill.products.map((product, index) => (
									<li key={index} className='text-sm text-gray-400'>
										{product.product.name} - Quantity: {product.quantity} - Price: $
										{product.price.toFixed(2)} - Sold by: {product.sellerName || "N/A"}
									</li>
								))}
							</ul>
						</div>
					)}

					<div className='space-y-4'>
						<button
							className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
