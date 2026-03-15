import Link from "next/link";

interface PriceCardProps {
  id: string;
  name: string;
}

export function PriceCard({ id, name }: PriceCardProps) {
  return (
    <Link
      href={`/price/${id}`}
      className="block p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all"
    >
      <span className="font-medium text-gray-900">₹{name}</span>
    </Link>
  );
}
