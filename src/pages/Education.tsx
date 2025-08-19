import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChildrenWithParentAddr } from '@/lib/dashboardV2Api';
import EducationTab from '@/components/dashboard-v2/EducationTab';
import { Card } from '@/components/ui/card';
import { yearAndKeyStageFromDOB, isBirthdayToday } from '@/lib/ukSchoolYear';
import SEOHead from '@/components/SEOHead';

export default function EducationPage() {
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children-with-parent-addr'],
    queryFn: getChildrenWithParentAddr
  });

  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <div className="p-6">Loading Education…</div>;
  if (!children.length) return <div className="p-6 text-muted-foreground">No children yet. Add one from the main Dashboard.</div>;

  return (
    <>
      <SEOHead 
        title="Education Management - Guardian AI"
        description="Manage your children's education profiles, school settings, and learning preferences with Guardian AI's comprehensive education tools."
      />
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-xl md:text-2xl font-semibold">Education</h1>

        <div className="flex flex-col gap-4">
          {children.map((c:any) => {
            const { yearGroup, keyStage } = yearAndKeyStageFromDOB(c.dob);
            const birthday = c.birthday_today || isBirthdayToday(c.dob);
            return (
              <Card key={c.id} className="p-3">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setOpenId(openId === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-3">
                    <img src={c.avatar_url || '/placeholder.svg'} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {c.name}
                        {birthday && <span className="text-xs px-2 py-0.5 rounded bg-pink-500/10 text-pink-600">🎂 Birthday</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.dob ? `DOB ${new Date(c.dob).toLocaleDateString()}` : 'DOB not set'}
                        {yearGroup ? ` • ${yearGroup}` : ''}{keyStage ? ` • ${keyStage}` : ''}
                        {c.city ? ` • ${c.city}` : ''}{c.postcode ? ` • ${c.postcode}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{openId === c.id ? 'Hide ▲' : 'Open ▼'}</div>
                </button>

                {openId === c.id && (
                  <div className="mt-3">
                    <EducationTab
                      childId={c.id}
                      childAge={c.age ?? undefined}
                      hint={c.postcode ?? ''}
                      // EducationTab will show DOB editor and auto‑compute/save KS/Year
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}