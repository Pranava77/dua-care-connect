// Role-based access control types and utilities
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'accountant' | 'hr' | 'receptionist';

export type Permission = 
  // Resident permissions
  | 'residents:read' | 'residents:create' | 'residents:update' | 'residents:delete'
  // Medical permissions
  | 'medical:read' | 'medical:create' | 'medical:update' | 'medical:delete'
  // Document permissions
  | 'documents:read' | 'documents:create' | 'documents:update' | 'documents:delete'
  // Accounting permissions
  | 'accounting:read' | 'accounting:create' | 'accounting:update' | 'accounting:delete'
  // HR permissions
  | 'hr:read' | 'hr:create' | 'hr:update' | 'hr:delete'
  // Reports permissions
  | 'reports:read' | 'reports:generate' | 'reports:export'
  // Dashboard permissions
  | 'dashboard:read'
  // System permissions
  | 'system:admin' | 'system:settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
}

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'residents:read', 'residents:create', 'residents:update', 'residents:delete',
    'medical:read', 'medical:create', 'medical:update', 'medical:delete',
    'documents:read', 'documents:create', 'documents:update', 'documents:delete',
    'accounting:read', 'accounting:create', 'accounting:update', 'accounting:delete',
    'hr:read', 'hr:create', 'hr:update', 'hr:delete',
    'reports:read', 'reports:generate', 'reports:export',
    'dashboard:read',
    'system:admin', 'system:settings'
  ],
  doctor: [
    'residents:read', 'residents:create', 'residents:update',
    'medical:read', 'medical:create', 'medical:update', 'medical:delete',
    'documents:read', 'documents:create',
    'reports:read', 'reports:generate',
    'dashboard:read'
  ],
  nurse: [
    'residents:read', 'residents:update',
    'medical:read', 'medical:create', 'medical:update',
    'documents:read', 'documents:create',
    'dashboard:read'
  ],
  accountant: [
    'residents:read',
    'accounting:read', 'accounting:create', 'accounting:update', 'accounting:delete',
    'documents:read', 'documents:create',
    'reports:read', 'reports:generate', 'reports:export',
    'dashboard:read'
  ],
  hr: [
    'residents:read',
    'hr:read', 'hr:create', 'hr:update', 'hr:delete',
    'documents:read', 'documents:create',
    'reports:read', 'reports:generate',
    'dashboard:read'
  ],
  receptionist: [
    'residents:read', 'residents:create', 'residents:update',
    'documents:read', 'documents:create',
    'dashboard:read'
  ]
};

// Utility functions for permission checking
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user || !user.isActive) return false;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  if (!user || !user.isActive) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  if (!user || !user.isActive) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

export const canAccessModule = (user: User | null, module: string): boolean => {
  if (!user || !user.isActive) return false;
  
  const modulePermissions: Record<string, Permission[]> = {
    residents: ['residents:read'],
    medical: ['medical:read'],
    documents: ['documents:read'],
    accounting: ['accounting:read'],
    hr: ['hr:read'],
    reports: ['reports:read'],
    dashboard: ['dashboard:read'],
    settings: ['system:settings']
  };
  
  const requiredPermissions = modulePermissions[module] || [];
  return hasAnyPermission(user, requiredPermissions);
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    doctor: 'Doctor',
    nurse: 'Nurse',
    accountant: 'Accountant',
    hr: 'HR Manager',
    receptionist: 'Receptionist'
  };
  return roleNames[role];
};

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    admin: 'text-red-600',
    doctor: 'text-blue-600',
    nurse: 'text-green-600',
    accountant: 'text-purple-600',
    hr: 'text-orange-600',
    receptionist: 'text-gray-600'
  };
  return roleColors[role];
};
