import type { HealthStatus } from '@/types';
import { cn } from '@/lib/utils';

const CONFIG: Record<HealthStatus, { label: string; classes: string }> = {
  healthy: { label: 'Healthy', classes: 'bg-green-100 text-green-700' },
  at_risk: { label: 'At Risk', classes: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700' },
};

interface HealthBadgeProps {
  status?: HealthStatus;
  className?: string;
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
  if (!status) return null;
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        cfg.classes,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
