import { useQuery } from '@tanstack/react-query';
import { getChildrenWithParentAddr } from '@/lib/dashboardV2Api';
import EducationTab from '@/components/dashboard-v2/EducationTab';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';

export default function EducationPage() {
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children-with-parent-addr'],
    queryFn: getChildrenWithParentAddr
  });

  if (isLoading) return <div className="p-6">Loading Education…</div>;

  return (
    <>
      <SEOHead 
        title="Education Management - Guardian AI"
        description="Manage your children's education profiles, school settings, and learning preferences with Guardian AI's comprehensive education tools."
      />
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-xl md:text-2xl font-semibold">Education</h1>
        {children.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((c: any) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={c.avatar_url || '/placeholder.svg'}
                    alt={`${c.name}'s avatar`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Age {c.age ?? '—'} {c.city ? `• ${c.city}` : ''} {c.postcode ? `• ${c.postcode}` : ''}
                    </div>
                  </div>
                </div>
                {/* Mirror card content: exact same EducationTab used in DashboardV2 */}
                <EducationTab
                  childId={c.id}
                  childAge={c.age ?? 7}
                  hint={c.postcode || c.city || ''}
                />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-muted-foreground">
            No children yet. Add one from the main Dashboard.
          </Card>
        )}
      </div>
    </>
  );
}