import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import EducationTab from '@/components/dashboard-v2/EducationTab';
import ChildEducationTabs from '@/components/education/ChildEducationTabs';
import SEOHead from '@/components/SEOHead';
import { getChildren } from '@/lib/api';
import { getWallet } from '@/lib/rewardsApi';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';

export default function EducationPage() {
  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: getChildren
  });

  const [openId, setOpenId] = useState<string>("");
  const [wallets, setWallets] = useState<Record<string, any>>({});

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
                    {child.dob && <span>DOB: {child.dob}</span>}
                    {yearGroup && <span>Year: {yearGroup}</span>}
                    {keyStage && <span>Key Stage: {keyStage}</span>}
                  </div>
                </div>
              </div>
              
            </div>

            
            <div 
              className="mt-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors p-2 rounded"
              onClick={() => setOpenId(openId === child.id ? "" : child.id)}
            >
              <span className="font-medium">Education Details</span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${
                  openId === child.id ? 'transform rotate-180' : ''
                }`}
              />
            </div>
            
            {openId === child.id && (
              <div className="border-t mt-2 pt-4 space-y-4">
                <EducationTab 
                  childId={child.id}
                  childAge={child.age ?? undefined}
                  hint={''}
                />
                <ChildEducationTabs childId={child.id} />
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}

    </div>
  );
}