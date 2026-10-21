import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Shield, Bell, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileCard } from "@/components/UserProfileCard";
import { PermissionGate } from "@/components/PermissionGate";
import { toast } from "sonner";
import { AiProviderCard } from "@/features/ai-settings/AiProviderCard";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success("Notification preferences updated");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-1 font-bold text-gradient-primary">Settings</h2>
        <p className="text-body text-muted-foreground">Manage your account and system preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile */}
        <UserProfileCard />

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Button
                  variant={notifications.email ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange('email', !notifications.email)}
                >
                  {notifications.email ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Button
                  variant={notifications.sms ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange('sms', !notifications.sms)}
                >
                  {notifications.sms ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Button
                  variant={notifications.push ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange('push', !notifications.push)}
                >
                  {notifications.push ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI provider - bring your own Gemini key */}
      <PermissionGate permission="system:settings">
        <AiProviderCard />
      </PermissionGate>

      {/* System Settings - Admin Only */}
      <PermissionGate permission="system:admin">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Administration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  defaultValue="SilverSync"
                  placeholder="Enter system name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  defaultValue="Asia/Kolkata"
                  placeholder="Select timezone"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Data Management</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">Security Settings</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset All Passwords
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Session Management
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PermissionGate>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                defaultValue="English"
                placeholder="Select language"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Input
                id="date-format"
                defaultValue="DD/MM/YYYY"
                placeholder="Select date format"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Light</Button>
              <Button variant="outline" size="sm">Dark</Button>
              <Button variant="default" size="sm">System</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
