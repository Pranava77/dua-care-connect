import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, getRoleDisplayName, ROLE_PERMISSIONS } from "@/lib/rbac";
import { PermissionGate } from "@/components/PermissionGate";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";

export function UserProfileCard() {
  const { user, signOut } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const queryClient = useQueryClient();
  const isAdmin = !!user?.permissions.includes("system:admin");
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: authApi.listUsers, enabled: isAdmin });
  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => authApi.setRole(id, role),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${updated.name} is now ${getRoleDisplayName(updated.role)}`);
      setSelectedRole(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return null;

  const otherUsers = users.filter((u) => u.id !== user.id);
  const selectedUser = otherUsers.find((u) => u.id === selectedUserId);

  const handleRoleChange = () => {
    if (selectedUser && selectedRole && selectedRole !== selectedUser.role) {
      setRole.mutate({ id: selectedUser.id, role: selectedRole });
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
          Your profile
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
            <p className="text-lg font-semibold [overflow-wrap:anywhere]">{user.email}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Current role</p>
          <Badge 
            variant="outline" 
            className="border-foreground/30 text-foreground"
          >
            <Shield className="h-3 w-3 mr-1" />
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>

        <PermissionGate permission="system:admin">
          <div className="space-y-2">
            <Label htmlFor="role-select">Change a colleague’s role</Label>
            <Select value={selectedUserId} onValueChange={(value) => { setSelectedUserId(value); setSelectedRole(null); }}>
              <SelectTrigger id="role-select" aria-label="User">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({getRoleDisplayName(u.role)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select 
                value={selectedRole || ""} 
                onValueChange={(value: UserRole) => setSelectedRole(value)}
                disabled={!selectedUser}
              >
                <SelectTrigger className="flex-1" aria-label="New role">
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
                disabled={!selectedUser || !selectedRole || selectedRole === selectedUser.role || setRole.isPending}
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>
        </PermissionGate>

        <Separator />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Areas you can open</p>
          <div className="flex flex-wrap gap-1">
            {[...new Set(user.permissions.map((p) => p.split(":")[0]).filter((m) => !["system", "dashboard"].includes(m)))].map((area) => (
              <Badge key={area} variant="secondary" className="text-xs capitalize">
                {area}
              </Badge>
            ))}
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
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
