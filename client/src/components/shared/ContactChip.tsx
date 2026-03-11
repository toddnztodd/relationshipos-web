import { cn } from '@/lib/utils';
import type { Tier } from '@/types';

const TIER_COLORS: Record<Tier, string> = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
  D: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface ContactChipProps {
  name: string;
  tier?: Tier;
  className?: string;
  onClick?: () => void;
}

export function ContactChip({ name, tier, className, onClick }: ContactChipProps) {
  const tierClasses = tier ? TIER_COLORS[tier] : 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80',
        tierClasses,
        className
      )}
    >
      {tier && (
        <span className="w-4 h-4 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px] font-bold">
          {tier}
        </span>
      )}
      <span>{name}</span>
    </button>
  );
}
