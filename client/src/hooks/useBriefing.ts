import { useQuery } from '@tanstack/react-query';
import { getBriefing } from '@/lib/api';

export function useBriefing() {
  return useQuery({
    queryKey: ['briefing'],
    queryFn: getBriefing,
    staleTime: 60_000,
    retry: 2,
  });
}
