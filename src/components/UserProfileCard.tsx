import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, getRoleDisplayName, getRoleColor, ROLE_PERMISSIONS } from "@/lib/rbac";
import { PermissionGate } from "@/components/PermissionGate";
import { toast } from "sonner";

export function UserProfileCard() {
  const { user, updateUserRole, signOut } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!user) return null;

  const handleRoleChange = () => {
    if (selectedRole && selectedRole !== user.role) {
      updateUserRole(selectedRole);
      toast.success(`Role updated to ${getRoleDisplayName(selectedRole)}`);
      setSelectedRole(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Current Role</p>
          <Badge 
            variant="outline" 
            className={`${getRoleColor(user.role)} border-current`}
          >
            <Shield className="h-3 w-3 mr-1" />
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>

        <PermissionGate permission="system:admin">
          <div className="space-y-2">
            <Label htmlFor="role-select">Change Role (Admin Only)</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedRole || ""} 
                onValueChange={(value: UserRole) => setSelectedRole(value)}
              >
                <SelectTrigger id="role-select" className="flex-1">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ROLE_PERMISSIONS).map((role) => (
                    <SelectItem key={role} value={role as UserRole}>
                      {getRoleDisplayName(role as UserRole)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRoleChange}
                disabled={!selectedRole || selectedRole === user.role}
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PermissionGate>

        <Separator />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Permissions</p>
          <div className="flex flex-wrap gap-1">
            {user.permissions.slice(0, 6).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission.split(':')[1]}
              </Badge>
            ))}
            {user.permissions.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{user.permissions.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant={user.isActive ? "default" : "secondary"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
