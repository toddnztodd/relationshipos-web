import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  value: number; // 0-1
  colorClass?: string;
  className?: string;
}

export function ConfidenceBar({ value, colorClass = 'bg-emerald-500', className }: ConfidenceBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn('h-1 rounded-full bg-gray-200 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full opacity-70', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
