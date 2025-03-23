import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
	{ href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
	{ href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
	{ href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<>
			{/* Hero Section */}
			<div className='flex flex-col sm:flex-row border-x-0 border-y-0 border-b border-[#fffff] mx-auto p-6 max-w-7xl'>
				{/* Hero Section left */}
				<div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
					<div className='text-[#34d399]'>
						<div className='flex items-center gap-2'>
							<p className='w-8 md:w-11 h-[2px] bg-[#ffffff]'></p>
							<p className='font-medium text-sm md:text-base'>Our Bestsellers</p>
						</div>
						<h1 className='text-3xl sm:py-3 lg:text-5xl leading-relaxed'>Latest Arrivals</h1>
						<div className='flex items-center gap-2'>
							<p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
							<p className='w-8 md:w-11 h-[1px] bg-[#ffffff]'></p>
						</div>
					</div>
				</div>
				{/* Hero Section Right */}
				<div>
					<img className='w-2/3 sm:w-1/2' src="/image-he.jpg" alt="Hero" />
				</div>
			</div>

			<div className='relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16'>
				<h1 className='text-center text-6xl sm:text-7xl font-bold text-emerald-400 mb-6'>
					Explore Our Categories
				</h1>
				<p className='text-center text-2xl text-gray-300 mb-12'>
					Discover the latest trends in eco-friendly fashion
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{categories.map((category) => (
						<div
							key={category.name}
							className='rounded-lg p-4 hover:shadow-lg transition-shadow duration-300'>
							<CategoryItem category={category} />
						</div>
					))}
				</div>

				{!isLoading && products.length > 0 && (
					<div className='mt-16'>
						<FeaturedProducts
							featuredProducts={products.map((product) => ({
								...product,
								seller: product.createdBy?.name,
							}))}
						/>
					</div>
				)}
			</div>
		</>
	);
};
export default HomePage;
