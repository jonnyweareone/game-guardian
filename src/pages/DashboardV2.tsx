import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"

import EducationTab from '@/components/dashboard-v2/EducationTab';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

const ChildSwitcher = ({ children, selectedChild, onChildSelect }: {
  children: Child[];
  selectedChild: Child | null;
  onChildSelect: (child: Child) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8">
          <Avatar className="mr-2 h-4 w-4">
            <AvatarImage src={selectedChild?.avatar_url || ''} />
            <AvatarFallback>{selectedChild?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {selectedChild?.name || 'Select Child'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Child</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children.map((child) => (
          <DropdownMenuItem key={child.id} onSelect={() => onChildSelect(child)}>
            <Avatar className="mr-2 h-4 w-4">
              <AvatarImage src={child.avatar_url || ''} />
              <AvatarFallback>{child.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {child.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id);
      if (error) throw error;
      return data as Child[];
    },
  });

  useEffect(() => {
    if (children && children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, [children]);

      

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Guardian AI Dashboard</h2>
          <div className="flex items-center space-x-2">
            <ChildSwitcher 
              children={children || []} 
              selectedChild={selectedChild} 
              onChildSelect={setSelectedChild} 
            />
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="apps">Apps & Games</TabsTrigger>
            <TabsTrigger value="social-media">Social Media</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Alerts</CardTitle>
                  <CardDescription>All alerts generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Unread Notifications</CardTitle>
                  <CardDescription>Notifications requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Screen Time</CardTitle>
                  <CardDescription>Total screen time this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">14h 32m</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Devices</CardTitle>
                  <CardDescription>Devices currently online</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest conversations flagged by the AI</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full space-y-2">
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Discord Chat</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Conversation</DropdownMenuItem>
                          <DropdownMenuItem>Flag as Safe</DropdownMenuItem>
                          <DropdownMenuItem>Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">Flagged for potential cyberbullying</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Xbox Live Chat</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Conversation</DropdownMenuItem>
                          <DropdownMenuItem>Flag as Safe</DropdownMenuItem>
                          <DropdownMenuItem>Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">Inappropriate language detected</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Used Apps</CardTitle>
                <CardDescription>Apps with the most usage this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full space-y-2">
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">TikTok</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View App Details</DropdownMenuItem>
                          <DropdownMenuItem>Block App</DropdownMenuItem>
                          <DropdownMenuItem>Set Time Limit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">4 hours 22 minutes</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">YouTube</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View App Details</DropdownMenuItem>
                          <DropdownMenuItem>Block App</DropdownMenuItem>
                          <DropdownMenuItem>Set Time Limit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">3 hours 15 minutes</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social-media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Activity</CardTitle>
                <CardDescription>Recent social media usage and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full space-y-2">
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Instagram</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Block Account</DropdownMenuItem>
                          <DropdownMenuItem>Review Activity</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">Potential stranger contact</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Snapchat</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Block Account</DropdownMenuItem>
                          <DropdownMenuItem>Review Activity</DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm text-muted-foreground">Excessive use during school hours</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            {children && children.length > 0 ? (
              <EducationTab childId={children[0].id} childAge={children[0].age ?? 7} />
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">
                Add a child to configure education settings.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}
