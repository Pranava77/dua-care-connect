import { useMutation, useQuery } from "@tanstack/react-query";
import { staffApi, type StaffInput } from "@/lib/api/staff";
import type { LeaveRequest } from "@/lib/types";
import { keys, useInvalidate } from "./keys";

export const useStaff = (enabled = true) => useQuery({ queryKey: keys.staff, queryFn: staffApi.list, enabled });

export const useLeaveRequests = (enabled = true) =>
  useQuery({ queryKey: keys.leave, queryFn: () => staffApi.listLeave(), enabled });

export function useCreateStaff() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: StaffInput) => staffApi.create(data), onSuccess: () => invalidate(keys.staff) });
}

export function useUpdateStaff() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffInput> }) => staffApi.update(id, data),
    onSuccess: () => invalidate(keys.staff, keys.leave),
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => staffApi.remove(id), onSuccess: () => invalidate(keys.staff, keys.leave) });
}

export function useSetLeaveStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveRequest["status"] }) => staffApi.setLeaveStatus(id, status),
    onSuccess: () => invalidate(keys.leave),
  });
}
