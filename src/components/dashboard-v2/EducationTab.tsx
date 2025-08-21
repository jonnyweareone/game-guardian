
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edu } from '@/lib/educationApi';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { yearAndKeyStageFromDOB } from '@/lib/ukSchoolYear';

type Props = { childId: string; childAge?: number; hint?: string };

export default function EducationTab({ childId, childAge = 7, hint = '' }: Props) {
  const qc = useQueryClient();

  // 1) Load profile, catalog, child record (for DOB)
  const childQ = useQuery({
    queryKey: ['child-basic', childId],
    queryFn: async () => {
      const { data, error } = await supabase.from('children').select('id, dob, name').eq('id', childId).single();
      if (error) throw error; return data;
    }
  });

  const profileQ = useQuery({
    queryKey: ['edu-profile', childId],
    queryFn: async()=> (await edu.getProfile(childId)).profile
  });

  const catalogQ = useQuery({
    queryKey: ['edu-interests-catalog'],
    queryFn: async()=> (await edu.interestsCatalog()).interests
  });

  const interestsQ = useQuery({
    queryKey: ['edu-interests', childId],
    queryFn: async()=> {
      const r = await edu.getInterests(childId);
      return r.interests; // normalized in API client
    }
  });

  const [schoolQuery, setSchoolQuery] = useState('');
  const effectiveQuery = schoolQuery || hint || '';

  const schoolsQ = useQuery({
    queryKey: ['edu-schools', childAge, effectiveQuery],
    queryFn: async()=> (await edu.listSchools(childAge, effectiveQuery)).schools,
  });

  const timelineQ = useQuery({
    queryKey: ['edu-timeline', childId],
    queryFn: async()=> await edu.timeline(childId)
  });

  const homeworkQ = useQuery({
    queryKey: ['edu-homework', childId],
    queryFn: async()=> (await edu.homeworkList(childId)).docs,
    refetchInterval: 20000, // light polling so Libre/OS links show up shortly
  });

  // Reading insights query
  const readingInsightsQ = useQuery({
    queryKey: ['reading-insights', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nova_insights')
        .select(`
          *,
          books!nova_insights_book_id_fkey(title, author)
        `)
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // 2) Mutations
  const saveProfileM = useMutation({
    mutationFn: (body:any)=> edu.saveProfile(childId, body),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['edu-profile', childId] }),
  });

  const setInterestsM = useMutation({
    mutationFn: (ids:string[])=> edu.setInterests(childId, ids),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['edu-interests', childId] }),
  });

  // Save DOB to children table then auto‑compute Year/KS and upsert profile
  const saveDobM = useMutation({
    mutationFn: async (dobISO: string) => {
      const { error } = await supabase.from('children').update({ dob: dobISO }).eq('id', childId);
      if (error) throw error;

      // The trigger will automatically update education_profiles, but we can also do it manually for immediate feedback
      const { yearGroup, keyStage } = yearAndKeyStageFromDOB(dobISO);
      await edu.saveProfile(childId, {
        ...(profileQ.data || {}),
        year_group: yearGroup,
        key_stage: keyStage,
      });
    },
    onSuccess: ()=> {
      qc.invalidateQueries({ queryKey: ['child-basic', childId] });
      qc.invalidateQueries({ queryKey: ['edu-profile', childId] });
    }
  });

  // 3) Interests UI state
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  useEffect(()=> {
    if (interestsQ.data?.length) {
      const ids = interestsQ.data.map((i:any)=> i.id);
      setSelectedInterests(ids);
    }
  }, [interestsQ.data]);

  const categories = useMemo(()=>{
    const grouped: Record<string, any[]> = {};
    (catalogQ.data ?? []).forEach((i:any)=> (grouped[i.category] ||= []).push(i));
    return grouped;
  }, [catalogQ.data]);

  const dobISO = childQ.data?.dob ?? undefined;
  const computed = yearAndKeyStageFromDOB(dobISO);
  
  // Show next academic year info if we're before August
  const now = new Date();
  const isBeforeAugust = now.getMonth() < 7; // August is month 7
  const nextYearInfo = isBeforeAugust && dobISO ? 
    yearAndKeyStageFromDOB(dobISO, new Date(now.getFullYear(), 7, 1)) : null;

  return (
    <div className="grid gap-4">
      {/* Profile & School */}
      <Card>
        <CardHeader><CardTitle>Education Profile - {childQ.data?.name}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Date of Birth</label>
              <Input
                type="date"
                defaultValue={dobISO ?? ''}
                onBlur={(e)=> {
                  const v = e.currentTarget.value;
                  if (v && v !== dobISO) saveDobM.mutate(v);
                }}
              />
              {computed.yearGroup && (
                <div className="text-xs text-muted-foreground mt-1">
                  Current: {computed.yearGroup} • {computed.keyStage}
                  {nextYearInfo && nextYearInfo.yearGroup !== computed.yearGroup && (
                    <div className="text-blue-600">
                      Next: {nextYearInfo.yearGroup} from September
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Key Stage</label>
              <Select 
                value={profileQ.data?.key_stage ?? computed.keyStage ?? ''} 
                onValueChange={(v)=>saveProfileM.mutate({ ...(profileQ.data||{}), key_stage:v })}
              >
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KS1">KS1</SelectItem>
                  <SelectItem value="KS2">KS2</SelectItem>
                  <SelectItem value="KS3">KS3</SelectItem>
                  <SelectItem value="KS4">KS4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Year Group</label>
              <Input
                placeholder="e.g., Year 4"
                defaultValue={profileQ.data?.year_group ?? computed.yearGroup ?? ''}
                onBlur={(e)=>saveProfileM.mutate({ ...(profileQ.data||{}), year_group: e.currentTarget.value })}
              />
            </div>
          </div>

          <label className="text-xs text-muted-foreground">Find School (age‑filtered)</label>
          <div className="flex gap-2">
            <Input placeholder="Search name / LA / postcode…" value={schoolQuery} onChange={e=>setSchoolQuery(e.target.value)} />
          </div>
          <div className="max-h-40 overflow-auto border rounded">
            {(schoolsQ.data ?? []).map((s:any)=>(
              <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted"
                onClick={()=>saveProfileM.mutate({ ...(profileQ.data||{}), school_id: s.id })}>
                {s.name} <span className="text-xs text-muted-foreground">({s.phase ?? 'unknown'})</span>
              </button>
            ))}
            {!schoolsQ.data?.length && <div className="text-xs text-muted-foreground p-2">No schools found. Try a different search.</div>}
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader><CardTitle>Child Interests (pick 3+)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(categories).map(([cat, list])=>(
            <div key={cat}>
              <div className="font-medium text-sm mb-1">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {list.map((i:any)=> {
                  const selected = selectedInterests.includes(i.id);
                  return (
                    <button key={i.id} onClick={()=>{
                      setSelectedInterests(prev => selected ? prev.filter(x=>x!==i.id) : [...prev, i.id]);
                    }} className={`px-3 py-1 rounded border ${selected?'bg-primary text-primary-foreground':'bg-background'}`}>
                      {i.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button disabled={selectedInterests.length<3} onClick={()=>setInterestsM.mutate(selectedInterests)}>
            Save Interests
          </Button>
        </CardContent>
      </Card>

      {/* Reading & Summary */}
      <Card>
        <CardHeader><CardTitle>Reading & Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">AI-generated reading insights and summaries from Nova sessions.</div>
          <div className="space-y-3">
            {(readingInsightsQ.data ?? []).map((insight: any) => (
              <div key={insight.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {insight.books?.title || 'Unknown Book'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                  {insight.difficulty_level && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                      insight.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {insight.difficulty_level}
                    </span>
                  )}
                </div>
                
                {insight.ai_summary && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.ai_summary}
                  </p>
                )}
                
                {insight.key_points && insight.key_points.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium">Key points: </span>
                    {insight.key_points.slice(0, 2).join(', ')}
                    {insight.key_points.length > 2 && '...'}
                  </div>
                )}
              </div>
            ))}
            {!readingInsightsQ.data?.length && (
              <div className="text-xs text-muted-foreground">
                No reading insights yet. Start reading with Nova to see AI-generated summaries here!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Homework (Libre/Google links) */}
      <Card>
        <CardHeader><CardTitle>Homework (Docs)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">Links come from Guardian OS / Settings; they appear automatically here.</div>
          <div className="text-sm">
            {(homeworkQ.data ?? []).map((d:any)=>(
              <div key={d.id} className="border rounded p-2 mb-2">
                <a className="underline" href={d.file_url} target="_blank" rel="noreferrer">{d.title}</a>
                <span className="text-muted-foreground ml-2">[{d.provider}]</span>
              </div>
            ))}
            {!homeworkQ.data?.length && <div className="text-xs text-muted-foreground">No documents yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
