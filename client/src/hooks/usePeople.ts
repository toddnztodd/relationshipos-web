import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPeople, getPerson, createPerson, updatePerson, getActivities, createActivity,
  vaultContact, restoreContact, makeContactPrivate, bulkVaultContacts, checkDuplicate, deletePerson,
} from '@/lib/api';
import type { PersonCreate, ActivityCreate } from '@/types';

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
    staleTime: 30_000,
  });
}

export function usePerson(id: number | string | undefined) {
  return useQuery({
    queryKey: ['people', id],
    queryFn: () => getPerson(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePersonActivities(id: number | string | undefined) {
  const numId = id ? Number(id) : undefined;
  return useQuery({
    queryKey: ['activities', 'person', id],
    queryFn: () => getActivities({ person_id: numId }),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PersonCreate) => createPerson(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<PersonCreate> }) =>
      updatePerson(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['people', vars.id] });
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityCreate) => createActivity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useVaultContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vaultNote }: { id: number; vaultNote?: string }) =>
      vaultContact(id, vaultNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useRestoreContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useMakeContactPrivate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => makeContactPrivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useBulkVaultContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, vaultNote }: { ids: number[]; vaultNote?: string }) =>
      bulkVaultContacts(ids, vaultNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePerson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: (params: { phone?: string; email?: string; name?: string }) =>
      checkDuplicate(params),
  });
}
