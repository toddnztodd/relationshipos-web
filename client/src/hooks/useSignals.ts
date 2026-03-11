import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSignals, getPersonSignals, getPropertySignals, detectSignals } from '@/lib/signals-api';

export function useSignals(filters?: { signal_type?: string; entity_type?: string; confidence_min?: number }) {
  return useQuery({
    queryKey: ['signals', filters],
    queryFn: () => getSignals(filters),
    staleTime: 60_000,
  });
}

export function usePersonSignals(personId: number | string | undefined) {
  return useQuery({
    queryKey: ['signals', 'person', personId],
    queryFn: () => getPersonSignals(personId!),
    enabled: !!personId,
    staleTime: 60_000,
  });
}

export function usePropertySignals(propertyId: number | string | undefined) {
  return useQuery({
    queryKey: ['signals', 'property', propertyId],
    queryFn: () => getPropertySignals(propertyId!),
    enabled: !!propertyId,
    staleTime: 60_000,
  });
}

export function useDetectSignals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: detectSignals,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signals'] });
      qc.invalidateQueries({ queryKey: ['briefing'] });
    },
  });
}
