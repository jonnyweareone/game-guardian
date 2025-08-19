import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Users, Plus } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";

import EnhancedChildCard from '@/components/dashboard-v2/EnhancedChildCard';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  parent_id: string;
  created_at: string;
}


export default function DashboardPage() {
  const { user } = useAuth();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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


  const handleToggleExpanded = (childId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(childId)) {
      newExpanded.delete(childId);
    } else {
      newExpanded.add(childId);
    }
    setExpandedCards(newExpanded);
  };

  const handleRemoveChild = (child: Child) => {
    console.log('Remove child:', child.name);
  };

  const handleAddTime = (childId: string) => {
    console.log('Add time for child:', childId);
  };

  const handlePauseDevice = (childId: string) => {
    console.log('Pause device for child:', childId);
  };

  const handleViewFullActivity = (childId: string) => {
    console.log('View full activity for child:', childId);
  };

      

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Monitor your children's digital activity and manage their device usage</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {children && children.length > 0 ? (
        <div className="space-y-4">
          {children.map((child) => (
            <EnhancedChildCard
              key={child.id}
              child={child}
              sessions={[]} // Mock empty sessions for now
              totalTodayMinutes={0} // Mock data
              unreadAlerts={0} // Mock data
              isExpanded={expandedCards.has(child.id)}
              onToggleExpanded={handleToggleExpanded}
              onRemoveChild={handleRemoveChild}
              onAddTime={handleAddTime}
              onPauseDevice={handlePauseDevice}
              onViewFullActivity={handleViewFullActivity}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No children profiles found</h3>
              <p className="text-muted-foreground">
                Add a child profile to start monitoring their digital activity
              </p>
            </div>
            <Button asChild>
              <a href="/children">
                <Plus className="mr-2 h-4 w-4" />
                Add Child Profile
              </a>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
