import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  getPropertyBuyerInterest,
  getPropertyOwners,
  addBuyerInterest,
  updateBuyerInterest,
  deleteBuyerInterest,
  linkOwner,
  unlinkOwner,
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

export function useAddBuyerInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: number; data: { person_id?: number | null; person_name?: string | null; interest_level?: number | null; notes?: string | null; status?: string | null } }) =>
      addBuyerInterest(propertyId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['properties', vars.propertyId, 'buyer-interest'] });
    },
  });
}

export function useUpdateBuyerInterest(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ interestId, data }: { interestId: number; data: { interest_level?: number | null; notes?: string | null; status?: string | null } }) =>
      updateBuyerInterest(interestId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties', propertyId, 'buyer-interest'] });
    },
  });
}

export function useDeleteBuyerInterest(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (interestId: number) => deleteBuyerInterest(interestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties', propertyId, 'buyer-interest'] });
    },
  });
}

export function useLinkOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: number; data: { person_id: number; role?: string | null } }) =>
      linkOwner(propertyId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['properties', vars.propertyId, 'owners'] });
    },
  });
}

export function useUnlinkOwner(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (personId: number) => unlinkOwner(propertyId, personId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties', propertyId, 'owners'] });
    },
  });
}
