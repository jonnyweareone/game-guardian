
import { NavLink, Outlet } from "react-router-dom";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function OtaDemoLayout() {
  const { signOut } = useAuth();
  
  const tabs = [
    { to: "/admin/ota-demo", label: "Update Manager" },
    { to: "/admin/ota-demo/reports", label: "Reports" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <NavLink to="/admin/devices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </NavLink>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">OTA Demo</span>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-6 px-6">
          {tabs.map(tab => (
            <NavLink 
              key={tab.to} 
              to={tab.to} 
              end 
              className={({ isActive }) => 
                `py-3 border-b-2 ${
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

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
