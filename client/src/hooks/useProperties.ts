import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  getPropertyBuyerInterest,
  getPropertyOwners,
} from '@/lib/api';
import type { PropertyCreate } from '@/types';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
    staleTime: 30_000,
  });
}

export function useProperty(id: number | string | undefined) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePropertyBuyerInterest(id: number | string | undefined) {
  return useQuery({
    queryKey: ['properties', id, 'buyer-interest'],
    queryFn: () => getPropertyBuyerInterest(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePropertyOwners(id: number | string | undefined) {
  return useQuery({
    queryKey: ['properties', id, 'owners'],
    queryFn: () => getPropertyOwners(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyCreate) => createProperty(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<PropertyCreate> }) =>
      updateProperty(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['properties', vars.id] });
    },
  });
}
