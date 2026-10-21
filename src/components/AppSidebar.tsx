import { Home, Users, FileText, HeartPulse, PoundSterling, UserCog, BarChart3, Settings, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useDoorNavigate } from "@/hooks/useDoorNavigate";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleAccess } from "@/components/PermissionGate";
import { getRoleDisplayName } from "@/lib/rbac";
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

// The lobby directory board: every department, with a "you are here" marker on the current one.
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, module: "dashboard" },
  { title: "Residents", url: "/residents", icon: Users, module: "residents" },
  { title: "Medical", url: "/medical", icon: HeartPulse, module: "medical" },
  { title: "Documents", url: "/documents", icon: FileText, module: "documents" },
  { title: "Accounting", url: "/accounting", icon: PoundSterling, module: "accounting" },
  { title: "HR & staff", url: "/hr", icon: UserCog, module: "hr" },
  { title: "Reports", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Settings", url: "/settings", icon: Settings, module: "settings" },
];

export function DoorMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M8 30V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v24z" fill="#1E6B47" />
      <rect x="12" y="7" width="8" height="4.5" rx="1" fill="#fff" />
      <circle cx="20.5" cy="18" r="1.4" fill="#fff" />
      <rect x="11" y="0" width="10" height="2" rx="1" fill="#F0A202" />
    </svg>
  );
}

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const go = useDoorNavigate();
  // Computed here: the menu button's Slot merges class names as strings, so NavLink's function form is lost.
  const isHere = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-5 pt-6 pb-4 group-data-[collapsible=icon]:px-2">
        <NavLink to="/dashboard" className="brand-link flex items-center gap-2.5 rounded-sm" aria-label="SilverSync, go to dashboard">
          <DoorMark />
          <span className="text-lg font-extrabold tracking-[-0.03em] group-data-[collapsible=icon]:hidden">SilverSync</span>
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="sign-label text-muted-foreground px-2">Directory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {menuItems.map((item) => (
                <ModuleAccess key={item.title} module={item.module}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title} className="h-10 rounded-md hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent">
                      <NavLink
                        to={item.url}
                        className={`directory-item group/dir ${isHere(item.url) ? "is-here" : ""}`}
                        aria-current={isHere(item.url) ? "page" : undefined}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || isHere(item.url)) return;
                          e.preventDefault();
                          go(item.url);
                        }}
                      >
                        <span className="directory-marker" aria-hidden="true" />
                        <item.icon className="h-[18px] w-[18px]" />
                        <span className="directory-label">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </ModuleAccess>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        {user && (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{getRoleDisplayName(user.role)} · {user.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="btn-plate grid h-9 w-9 flex-none place-items-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
