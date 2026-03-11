import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTerritories, getTerritory, createTerritory, updateTerritory, deleteTerritory,
  getTerritoryCoverage, getTerritorySignals, logCoverageActivity,
  getTerritoryFarmingPrograms, createFarmingProgram, updateFarmingProgram, deleteFarmingProgram,
  linkPropertyToTerritory, unlinkPropertyFromTerritory,
} from '@/lib/api';

export function useTerritories() {
  return useQuery({ queryKey: ['territories'], queryFn: getTerritories });
}

export function useTerritory(id: string | undefined) {
  return useQuery({
    queryKey: ['territory', id],
    queryFn: () => getTerritory(id!),
    enabled: !!id,
  });
}

export function useTerritoryCoverage(id: string | undefined) {
  return useQuery({
    queryKey: ['territory-coverage', id],
    queryFn: () => getTerritoryCoverage(id!),
    enabled: !!id,
  });
}

export function useTerritorySignals(id: string | undefined) {
  return useQuery({
    queryKey: ['territory-signals', id],
    queryFn: () => getTerritorySignals(id!),
    enabled: !!id,
  });
}

export function useTerritoryFarmingPrograms(id: string | undefined) {
  return useQuery({
    queryKey: ['territory-programs', id],
    queryFn: () => getTerritoryFarmingPrograms(id!),
    enabled: !!id,
  });
}

export function useCreateTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTerritory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  });
}

export function useUpdateTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTerritory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territories'] });
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useDeleteTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTerritory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  });
}

export function useLinkProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ territoryId, propertyId }: { territoryId: string; propertyId: string }) =>
      linkPropertyToTerritory(territoryId, propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
      qc.invalidateQueries({ queryKey: ['territory-coverage'] });
    },
  });
}

export function useUnlinkProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ territoryId, propertyId }: { territoryId: string; propertyId: string }) =>
      unlinkPropertyFromTerritory(territoryId, propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
      qc.invalidateQueries({ queryKey: ['territory-coverage'] });
    },
  });
}

export function useLogCoverageActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logCoverageActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territory-coverage'] }),
  });
}

export function useCreateFarmingProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFarmingProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territory-programs'] }),
  });
}

export function useUpdateFarmingProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFarmingProgram(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territory-programs'] }),
  });
}

export function useDeleteFarmingProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFarmingProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territory-programs'] }),
  });
}
