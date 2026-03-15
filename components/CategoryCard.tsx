import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
}

export function CategoryCard({ id, name }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${id}`}
      className="block p-5 h-full bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
    >
      <span className="font-medium text-zinc-900">{name}</span>
    </Link>
  );
}
