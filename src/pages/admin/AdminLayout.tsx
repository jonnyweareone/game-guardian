
import { NavLink, Outlet } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout() {
  const { signOut } = useAuth();
  
  const tabs = [
    { to: "/admin/devices", label: "Device Management" },
    { to: "/admin/app-catalog", label: "App Catalog" },
    { to: "/admin/ui-themes", label: "UI Themes" },
    { to: "/admin/content-push", label: "Content Push" },
    { to: "/admin/ota-demo", label: "OTA Demo" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Guardian Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <NavLink to="/dashboard">Back to Dashboard</NavLink>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b border-border">
        <nav className="flex px-6">
          {tabs.map(tab => (
            <NavLink 
              key={tab.to} 
              to={tab.to} 
              className={({ isActive }) => 
                `py-4 px-4 border-b-2 transition-colors ${
                  isActive 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
