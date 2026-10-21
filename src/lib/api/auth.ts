import type { UserRole, User } from "@/lib/rbac";
import { api, type Session } from "./client";

interface AuthResponse {
  user: User;
  session: Session;
}

export const authApi = {
  signIn: (email: string, password: string) => api.post<AuthResponse>("/auth/login", { email, password }),
  signUp: (email: string, password: string, name?: string) =>
    api.post<AuthResponse>("/auth/signup", { email, password, name }),
  me: () => api.get<User>("/auth/me"),
  listUsers: () => api.get<User[]>("/users"),
  setRole: (userId: string, role: UserRole) => api.patch<User>(`/users/${userId}/role`, { role }),
};
