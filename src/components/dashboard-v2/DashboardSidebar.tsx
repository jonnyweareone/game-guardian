
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Shield, 
  Users, 
  Settings,
  Bell,
  Home,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ChildRemovalDialog from './ChildRemovalDialog';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface DashboardSidebarProps {
  children: Child[];
  selectedChildren: string[];
  onChildrenChange: (childIds: string[]) => void;
  alertCounts: Record<string, { total: number; critical: number }>;
  onChildRemoved: (childId: string) => void;
}

const DashboardSidebar = ({ 
  children, 
  selectedChildren, 
  onChildrenChange,
  alertCounts,
  onChildRemoved 
}: DashboardSidebarProps) => {
  const { collapsed } = useSidebar();
  const { signOut } = useAuth();
  const [childToRemove, setChildToRemove] = useState<Child | null>(null);

  const toggleChild = (childId: string) => {
    const newSelection = selectedChildren.includes(childId)
      ? selectedChildren.filter(id => id !== childId)
      : [...selectedChildren, childId];
    onChildrenChange(newSelection);
  };

  return (
    <>
      <Sidebar className={collapsed ? "w-14" : "w-80"} collapsible>
        <SidebarHeader className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary flex-shrink-0" />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">Guardian AI™</h1>
                <p className="text-xs text-muted-foreground">Dashboard V2</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/dashboard">
                      <Home className="h-4 w-4" />
                      {!collapsed && <span>Dashboard V1</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive>
                    <Link to="/dashboard-v2">
                      <Shield className="h-4 w-4" />
                      {!collapsed && <span>Dashboard V2</span>}
                      {!collapsed && <Badge variant="secondary" className="ml-auto">Beta</Badge>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/dashboard">
                      <Settings className="h-4 w-4" />
                      {!collapsed && <span>Settings</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {!collapsed && <span>Children ({children.length})</span>}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {children.map((child) => {
                  const isSelected = selectedChildren.includes(child.id);
                  const alerts = alertCounts[child.id] || { total: 0, critical: 0 };
                  
                  return (
                    <SidebarMenuItem key={child.id}>
                      <SidebarMenuButton
                        onClick={() => toggleChild(child.id)}
                        className={`relative ${isSelected ? 'bg-muted text-primary font-medium' : ''}`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={child.avatar_url} alt={child.name} />
                          <AvatarFallback className="text-xs">
                            {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                          <>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{child.name}</div>
                              {child.age && (
                                <div className="text-xs text-muted-foreground">{child.age} years old</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {alerts.critical > 0 && (
                                <Badge variant="destructive" className="text-xs px-1">
                                  {alerts.critical}
                                </Badge>
                              )}
                              {alerts.total > 0 && alerts.critical === 0 && (
                                <Badge variant="outline" className="text-xs px-1">
                                  {alerts.total}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChildToRemove(child);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </Sidebar>

      <ChildRemovalDialog
        child={childToRemove}
        open={!!childToRemove}
        onOpenChange={() => setChildToRemove(null)}
        onConfirm={(childId) => {
          onChildRemoved(childId);
          setChildToRemove(null);
        }}
      />
    </>
  );
};

export default DashboardSidebar;
