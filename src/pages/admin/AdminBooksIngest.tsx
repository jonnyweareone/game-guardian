import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Shield, RefreshCw } from 'lucide-react';

export default function AdminBooksIngest() {
  const [limit, setLimit] = useState(20);
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runBatch = async () => {
    try {
      setLoading(true);
      
      // Use the book IDs from the database for testing
      const testBookIds = [
        '579faa1c-89a8-4f06-8d57-43bdd9ace00c',
        '0498599e-45a2-4afa-9c1a-e401cf421d39'
      ];

      console.log('Triggering admin reingest for books:', testBookIds);

      const { data, error } = await supabase.functions.invoke('admin-books-reingest', {
        body: {
          book_ids: testBookIds,
          limit: Math.min(limit, testBookIds.length)
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const totalCount = data.processed || 0;
      
      toast({ 
        title: 'Batch Complete', 
        description: `Processed ${successCount}/${totalCount} books successfully.` 
      });
      
      console.log('Batch results:', data);
    } catch (e: any) {
      console.error('Batch error:', e);
      toast({ title: 'Batch Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const structured = {
    '@type': 'WebPage',
    name: 'Admin Books Ingest',
    description: 'Run batch ingestion of books for Nova Reader.',
    url: 'https://gameguardianai.com/admin/books',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEOHead
        title="Admin Books Ingest - Game Guardian AI"
        description="Admin tool to batch re-ingest books into the database."
        canonicalUrl="https://gameguardianai.com/admin/books"
        keywords="admin, books, ingest, nova reader"
        structuredData={structured}
      />

      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5" />
        <h1 className="text-2xl font-semibold">Books Ingest</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Re-ingest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input id="limit" type="number" min={1} max={200} value={limit} onChange={(e) => setLimit(parseInt(e.target.value || '1'))} />
            </div>
            <div className="flex items-center justify-between md:items-end md:justify-start gap-3">
              <div className="space-y-1">
                <Label htmlFor="force">Force Re-ingest</Label>
                <div className="text-sm text-muted-foreground">Process even if already ingested</div>
              </div>
              <Switch id="force" checked={force} onCheckedChange={setForce} />
            </div>
          </div>

          <Button onClick={runBatch} disabled={loading} className="mt-2">
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> Run Batch
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
