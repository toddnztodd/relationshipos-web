import { useQuery } from '@tanstack/react-query';
import { getBriefing, getDashboard, getNextBestContacts } from '@/lib/api';

export function useBriefing() {
  return useQuery({
    queryKey: ['briefing'],
    queryFn: getBriefing,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useNextBestContacts() {
  return useQuery({
    queryKey: ['next-best-contacts'],
    queryFn: getNextBestContacts,
    staleTime: 60_000,
    retry: 2,
  });
}
