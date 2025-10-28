import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, hasPermission, canAccessModule } from '@/lib/rbac';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();
  
  if (!hasPermission(user, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RoleGateProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();
  
  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface ModuleAccessProps {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleAccess({ module, children, fallback = null }: ModuleAccessProps) {
  const { user } = useAuth();
  
  if (!user || !canAccessModule(user, module)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
