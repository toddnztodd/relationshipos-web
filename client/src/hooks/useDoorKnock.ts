import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startDoorKnockSession, endDoorKnockSession, getDoorKnockSession,
  logDoorKnockEntry, createContactFromEntry, getNearbySuggestions,
  getFollowUpTasks, createFollowUpTask, updateFollowUpTask,
} from '@/lib/api';

export function useDoorKnockSession(id: string | null) {
  return useQuery({
    queryKey: ['door-knock-session', id],
    queryFn: () => getDoorKnockSession(id!),
    enabled: !!id,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => startDoorKnockSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['door-knock-session'] }),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endDoorKnockSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['door-knock-session'] }),
  });
}

export function useLogEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => logDoorKnockEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['door-knock-session'] }),
  });
}

export function useCreateContactFromEntry() {
  return useMutation({
    mutationFn: (entryId: string) => createContactFromEntry(entryId),
  });
}

export function useNearbySuggestions(propertyId: string | null) {
  return useQuery({
    queryKey: ['nearby', propertyId],
    queryFn: () => getNearbySuggestions(propertyId!),
    enabled: !!propertyId,
  });
}

export function useFollowUpTasks() {
  return useQuery({
    queryKey: ['follow-up-tasks'],
    queryFn: getFollowUpTasks,
  });
}

export function useCreateFollowUpTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createFollowUpTask(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follow-up-tasks'] }),
  });
}

export function useUpdateFollowUpTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFollowUpTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follow-up-tasks'] }),
  });
}
