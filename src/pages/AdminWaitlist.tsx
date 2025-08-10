import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WaitlistSignup {
  id: string;
  created_at: string;
  email: string;
  full_name: string | null;
  product: string;
  intent: string;
  status: string;
  source: string | null;
}

const AdminWaitlist = () => {
  const [rows, setRows] = useState<WaitlistSignup[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('id, created_at, email, full_name, product, intent, status, source')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) {
        setError(error.message);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Admin Waitlist - Game Guardian AI',
    description: 'Admin view of waitlist and beta signups for the Guardian Ecosystem.',
    url: 'https://gameguardianai.com/admin/waitlist',
  };

  return (
    <>
      <SEOHead
        title="Admin: Waitlist Signups"
        description="Admin view of Guardian OS and Game Guardian device waitlist signups."
        keywords="admin, waitlist, beta, guardian ecosystem"
        canonicalUrl="https://gameguardianai.com/admin/waitlist"
        structuredData={structured}
      />
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist & Beta Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error.includes('permission') ? 'Access denied. You must be an admin.' : error}</AlertDescription>
                </Alert>
              )}
              {loading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                          <TableCell>{r.full_name || '-'}</TableCell>
                          <TableCell>{r.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.product}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{r.intent}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{r.status}</TableCell>
                          <TableCell className="text-muted-foreground">{r.source || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {rows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No signups yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminWaitlist;
