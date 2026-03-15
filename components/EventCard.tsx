import Link from "next/link";

interface EventCardProps {
  id: string;
  name: string;
}

export function EventCard({ id, name }: EventCardProps) {
  return (
    <Link
      href={`/event/${id}`}
      className="block p-5 h-full bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
    >
      <span className="font-medium text-zinc-900">{name}</span>
    </Link>
  );
}
