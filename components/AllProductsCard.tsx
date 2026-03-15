import Link from "next/link";

export function AllProductsCard() {
  return (
    <Link
      href="/products"
      className="flex items-center justify-center p-8 min-w-[220px] bg-primary-600 text-white rounded-2xl shadow-card hover:shadow-card-hover hover:bg-primary-700 transition-all duration-200"
    >
      <span className="font-semibold text-lg">All Products</span>
    </Link>
  );
}
