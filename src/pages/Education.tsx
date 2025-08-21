
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import EducationTab from '@/components/dashboard-v2/EducationTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EducationTimeline } from '@/components/education/EducationTimeline';
import { ReadingProgress } from '@/components/education/ReadingProgress';

import { getChildren } from '@/lib/api';
import { getWallet } from '@/lib/rewardsApi';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function EducationPage() {
  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren
  });

  const [wallets, setWallets] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Load wallets when children are loaded
  useEffect(() => {
    if (children?.length) {
      (async () => {
        // Load wallets for all children
        for (const child of children) {
          try {
            const wallet = await getWallet(child.id);
            setWallets(prev => ({ ...prev, [child.id]: wallet }));
          } catch (error) {
            console.error('Error loading wallet for child:', child.id, error);
          }
        }
      })();
    }
  }, [children]);

  const handleNovaLearning = async (child: any) => {
    // Pre-open blank tab to avoid popup blockers
    const novaTab = window.open('', '_blank');
    
    try {
      // Mint a child token for Nova Learning access
      const { data, error } = await supabase.functions.invoke('nova-mint-child-token', {
        body: { child_id: child.id }
      });

      if (error) throw error;

      if (data?.nova_url && novaTab) {
        // Navigate the pre-opened tab to Nova Learning
        novaTab.location.href = data.nova_url;
        
        toast({
          title: "Nova Learning Opened",
          description: `${child.name} can now access Nova Learning directly.`,
        });
      } else if (!novaTab) {
        throw new Error('Failed to open new tab');
      }
    } catch (error) {
      console.error('Error opening Nova Learning:', error);
      
      // Close the blank tab if it was opened
      if (novaTab) {
        novaTab.close();
      }
      
      toast({
        title: "Error",
        description: "Failed to open Nova Learning. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading Education…</div>;
  if (!children?.length) return <div>No children yet.</div>;

  return (
    <div className="space-y-6">
      <SEOHead
        title="Guardian AI | Education Management"
        description="Manage your children's educational journey with personalized learning paths, progress tracking, and AI-powered insights."
      />
      
      <h1 className="text-3xl font-bold">📚 Nova Education</h1>
      
      {children.map((child) => {
        const { yearGroup, keyStage } = yearAndKeyStageFromDOB(child.dob);
        const now = new Date();
        const isBeforeAugust = now.getMonth() < 7; // August is month 7
        
        // Show next year group if we're before August 1st
        const nextYearInfo = isBeforeAugust && child.dob ? 
          yearAndKeyStageFromDOB(child.dob, new Date(now.getFullYear(), 7, 1)) : null;
        
        return (
        <Card key={child.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {child.avatar_url && (
                  <img 
                    src={child.avatar_url} 
                    alt={`${child.name}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{child.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Coins: {wallets[child.id]?.coins ?? 0}</span>
                    
                    {yearGroup && <span>Year: {yearGroup}</span>}
                    {keyStage && <span>Key Stage: {keyStage}</span>}
                    {nextYearInfo && nextYearInfo.yearGroup !== yearGroup && (
                      <span className="text-blue-600">Next: {nextYearInfo.yearGroup} from September</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleNovaLearning(child)}
                title="Open Nova Learning"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">👤 Profile</TabsTrigger>
                <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
                <TabsTrigger value="reading">📚 Reading</TabsTrigger>
                <TabsTrigger value="courses">🎓 Books & Courses</TabsTrigger>
                <TabsTrigger value="summary">📊 Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <EducationTab childId={child.id} childAge={child.age} />
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <EducationTimeline childId={child.id} />
              </TabsContent>

              <TabsContent value="reading" className="mt-6">
                <ReadingProgress childId={child.id} />
              </TabsContent>

              <TabsContent value="courses" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Available books and courses will be shown here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Education summary and insights will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        );
      })}

    </div>
  );
}
