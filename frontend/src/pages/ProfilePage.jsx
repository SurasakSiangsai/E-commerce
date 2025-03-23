import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [newName, setNewName] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await axios.get("/user/profile");
				setProfile(res.data);
			} catch (error) {
				console.error("Error fetching profile:", error.response?.data?.message || error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const handleNameChange = async () => {
		try {
			const res = await axios.put("/user/profile/name", { name: newName });
			setProfile((prev) => ({ ...prev, name: res.data.name }));
			toast.success("Name updated successfully");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update name");
		}
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className='max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg'>
			<h1 className='text-2xl font-bold text-emerald-400 mb-4'>Profile</h1>
			<p className='text-gray-300'>
				<strong>Name:</strong> {profile?.name || "N/A"}
			</p>
			<p className='text-gray-300'>
				<strong>Email:</strong> {profile?.email || "N/A"}
			</p>
			<p className='text-gray-300'>
				<strong>Role:</strong> {profile?.role || "N/A"}
			</p>

			 {/* Edit Name Section */}
			 {isEditing ? (
				<div className='mt-4'>
					<input
						type='text'
						className='w-full p-2 rounded bg-gray-700 text-white'
						placeholder='Enter new name'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
					/>
					<div className='flex gap-2 mt-2'>
						<button
							className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded'
							onClick={handleNameChange}
						>
							Save
						</button>
						<button
							className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded'
							onClick={() => setIsEditing(false)}
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<button
					className='mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded'
					onClick={() => setIsEditing(true)}
				>
					Change Name
				</button>
			)}

			{/* Notifications for Admin/Seller */}
			{profile?.notifications?.length > 0 && (
				<div className='mt-6'>
					<h2 className='text-xl font-semibold text-emerald-400 mb-2'>Notifications</h2>
					<ul className='space-y-4'>
						{profile.notifications.map((notification) => (
							<li key={notification?._id} className='p-4 bg-gray-700 rounded-lg'>
								<p className='text-gray-300'>
									<strong>Product:</strong> {notification?.products?.[0]?.product?.name || "N/A"}
								</p>
								<p className='text-gray-300'>
									<strong>Buyer:</strong> {notification?.user?.name || "N/A"} (
									{notification?.user?.email || "N/A"})
								</p>
								<p className='text-gray-300'>
									<strong>Total Amount:</strong> $
									{notification?.totalAmount?.toFixed(2) || "0.00"}
								</p>
								<p className='text-gray-300'>
									<strong>Date:</strong>{" "}
									{notification?.createdAt
										? new Date(notification.createdAt).toLocaleString()
										: "N/A"}
								</p>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Bills for Sellers */}
			{profile?.role === "seller" && profile?.bills?.length > 0 && (
				<div className='mt-6'>
					<h2 className='text-xl font-semibold text-emerald-400 mb-2'>Your Sales</h2>
					<ul className='space-y-4'>
						{profile.bills.map((bill) => (
							<li key={bill?._id} className='p-4 bg-gray-700 rounded-lg'>
								<p className='text-gray-300'>
									<strong>Order ID:</strong> {bill?._id || "N/A"}
								</p>
								<p className='text-gray-300'>
									<strong>Buyer:</strong> {bill?.user?.name || "N/A"} ({bill?.user?.email || "N/A"})
								</p>
								<p className='text-gray-300'>
									<strong>Total Amount:</strong> ${bill?.totalAmount?.toFixed(2) || "0.00"}
								</p>
								<p className='text-gray-300'>
									<strong>Date:</strong>{" "}
									{bill?.createdAt ? new Date(bill.createdAt).toLocaleString() : "N/A"}
								</p>
								<ul className='mt-2'>
									{bill?.products
										.filter((product) => product.product.createdBy === profile._id)
										.map((product, index) => (
											<li key={index} className='text-gray-300'>
												{product?.product?.name || "N/A"} - Quantity: {product?.quantity || 0}
											</li>
										))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Bills for Customers */}
			{profile?.role === "customer" && profile?.bills?.length > 0 && (
				<div className='mt-6'>
					<h2 className='text-xl font-semibold text-emerald-400 mb-2'>Your Bills</h2>
					<ul className='space-y-4'>
						{profile.bills.map((bill) => (
							<li key={bill?._id} className='p-4 bg-gray-700 rounded-lg'>
								<p className='text-gray-300'>
									<strong>Order ID:</strong> {bill?._id || "N/A"}
								</p>
								<p className='text-gray-300'>
									<strong>Total Amount:</strong> ${bill?.totalAmount?.toFixed(2) || "0.00"}
								</p>
								<p className='text-gray-300'>
									<strong>Date:</strong>{" "}
									{bill?.createdAt ? new Date(bill.createdAt).toLocaleString() : "N/A"}
								</p>
								<ul className='mt-2'>
									{bill?.products?.map((product, index) => (
										<li key={index} className='text-gray-300'>
											{product?.product?.name || "N/A"} - Quantity: {product?.quantity || 0} - Seller:{" "}
											{product?.product?.createdBy?.name || "N/A"}
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default ProfilePage;
