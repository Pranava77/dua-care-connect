import type { LeaveRequest, Staff } from "@/lib/types";
import { api, query } from "./client";

export type StaffInput = Omit<Staff, "id" | "created_at" | "salary" | "status"> & Partial<Pick<Staff, "salary" | "status">>;

export const staffApi = {
  list: () => api.get<Staff[]>("/staff"),
  create: (data: StaffInput) => api.post<Staff>("/staff", data),
  update: (id: string, data: Partial<StaffInput>) => api.patch<Staff>(`/staff/${id}`, data),
  remove: (id: string) => api.delete(`/staff/${id}`),
  listLeave: (status?: LeaveRequest["status"]) => api.get<LeaveRequest[]>(`/hr/leave${query({ status })}`),
  setLeaveStatus: (id: string, status: LeaveRequest["status"]) => api.patch<LeaveRequest>(`/hr/leave/${id}`, { status }),
};
