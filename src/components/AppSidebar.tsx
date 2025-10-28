import { Home, Users, FileText, Heart, DollarSign, UserCog, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleAccess } from "@/components/PermissionGate";
import { getRoleDisplayName, getRoleColor } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, module: "dashboard" },
  { title: "Residents", url: "/residents", icon: Users, module: "residents" },
  { title: "Medical Records", url: "/medical", icon: Heart, module: "medical" },
  { title: "Documents", url: "/documents", icon: FileText, module: "documents" },
  { title: "Accounting", url: "/accounting", icon: DollarSign, module: "accounting" },
  { title: "HR & Staff", url: "/hr", icon: UserCog, module: "hr" },
  { title: "Reports", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Settings", url: "/settings", icon: Settings, module: "settings" },
];

export function AppSidebar() {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-sidebar-primary animate-pulse" />
          <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">SilverSync</span>
        </div>
        {user && (
          <div className="mt-2 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Badge 
              variant="outline" 
              className={`${getRoleColor(user.role)} border-current text-xs`}
            >
              {getRoleDisplayName(user.role)}
            </Badge>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <ModuleAccess key={item.title} module={item.module}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `group transition-all duration-200 hover:translate-x-1 ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground hover-glow"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </ModuleAccess>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user && (
          <div className="space-y-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-sidebar-muted-foreground" />
              <span className="text-sm text-sidebar-muted-foreground">{user.name}</span>
            </div>
            <div className="text-xs text-sidebar-muted-foreground">
              {user.email}
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
