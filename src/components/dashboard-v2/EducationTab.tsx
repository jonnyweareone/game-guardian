
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edu } from '@/lib/educationApi';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function EducationTab({ childId, childAge = 7, hint = '' }: { childId: string; childAge?: number; hint?: string }) {
  const qc = useQueryClient();

  const profileQ = useQuery({ 
    queryKey: ['edu-profile', childId], 
    queryFn: async () => (await edu.getProfile(childId)).profile 
  });
  
  const catalogQ = useQuery({ 
    queryKey: ['edu-interests-catalog'], 
    queryFn: async () => (await edu.interestsCatalog()).interests 
  });
  
  const interestsQ = useQuery({ 
    queryKey: ['edu-interests', childId], 
    queryFn: async () => (await edu.getInterests(childId)).interests 
  });
  
  const timelineQ = useQuery({ 
    queryKey: ['edu-timeline', childId], 
    queryFn: async () => await edu.timeline(childId) 
  });
  
  const homeworkQ = useQuery({ 
    queryKey: ['edu-homework', childId], 
    queryFn: async () => (await edu.homeworkList(childId)).docs 
  });

  const [schoolQuery, setSchoolQuery] = useState('');
  const schoolsQ = useQuery({
    queryKey: ['edu-schools', childAge, schoolQuery, hint],
    queryFn: async () => (await edu.listSchools(childAge, schoolQuery, hint)).schools,
    enabled: schoolQuery.length > 2 || childAge > 0,
  });

  const saveProfileM = useMutation({
    mutationFn: (body: any) => edu.saveProfile(childId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['edu-profile', childId] }),
  });

  const setInterestsM = useMutation({
    mutationFn: (ids: string[]) => edu.setInterests(childId, ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['edu-interests', childId] }),
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (interestsQ.data?.length) {
      setSelectedInterests(interestsQ.data.map((ci: any) => ci.interest_id));
    }
  }, [interestsQ.data]);

  const categories = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    (catalogQ.data ?? []).forEach((i: any) => (grouped[i.category] ||= []).push(i));
    return grouped;
  }, [catalogQ.data]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Profile & School */}
      <Card>
        <CardHeader><CardTitle>Education Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Key Stage</label>
              <Select 
                onValueChange={(v) => saveProfileM.mutate({ ...(profileQ.data || {}), key_stage: v })}
                value={profileQ.data?.key_stage || ''}
              >
                <SelectTrigger><SelectValue placeholder="Select Key Stage" /></SelectTrigger>
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
                defaultValue={profileQ.data?.year_group ?? ''} 
                placeholder="e.g., Year 4"
                onBlur={(e) => saveProfileM.mutate({ ...(profileQ.data || {}), year_group: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Find School (filters by age {childAge})</label>
            <Input 
              placeholder="Search school name / LA / postcode…" 
              value={schoolQuery} 
              onChange={e => setSchoolQuery(e.target.value)} 
            />
          </div>
          
          {schoolQuery.length > 2 && (
            <div className="max-h-40 overflow-auto border rounded">
              {(schoolsQ.data ?? []).map((s: any) => (
                <button 
                  key={s.id} 
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  onClick={() => saveProfileM.mutate({ ...(profileQ.data || {}), school_id: s.id })}
                >
                  {s.name} <span className="text-xs text-muted-foreground">({s.phase ?? 'unknown'})</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader><CardTitle>Child Interests (pick 3+)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(categories).map(([cat, list]) => (
            <div key={cat}>
              <div className="font-medium text-sm mb-1">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {list.map((i: any) => {
                  const selected = selectedInterests.includes(i.id);
                  return (
                    <button 
                      key={i.id} 
                      onClick={() => {
                        const next = selected 
                          ? selectedInterests.filter(x => x !== i.id) 
                          : [...selectedInterests, i.id];
                        setSelectedInterests(next);
                      }} 
                      className={`px-3 py-1 rounded border text-sm ${
                        selected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {i.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button 
            disabled={selectedInterests.length < 3} 
            onClick={() => setInterestsM.mutate(selectedInterests)}
          >
            Save Interests ({selectedInterests.length}/3+)
          </Button>
        </CardContent>
      </Card>

      {/* Learning Timeline */}
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Learning Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">Achievements, study sessions and reading progress</div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <div className="font-medium mb-1">Achievements</div>
              <ul className="text-sm space-y-1 max-h-40 overflow-auto">
                {(timelineQ.data?.achievements ?? []).map((a: any) => (
                  <li key={a.id}>• {a.kind ?? a.type} — {new Date(a.created_at).toLocaleString()}</li>
                ))}
                {!timelineQ.data?.achievements?.length && (
                  <li className="text-muted-foreground">No achievements yet</li>
                )}
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1">Study Sessions</div>
              <ul className="text-sm space-y-1 max-h-40 overflow-auto">
                {(timelineQ.data?.study ?? []).map((s: any) => (
                  <li key={s.id}>• {s.source} {s.subject ? `(${s.subject})` : ''} — {s.minutes}m</li>
                ))}
                {!timelineQ.data?.study?.length && (
                  <li className="text-muted-foreground">No study sessions yet</li>
                )}
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1">Reading</div>
              <ul className="text-sm space-y-1 max-h-40 overflow-auto">
                {(timelineQ.data?.reading ?? []).map((r: any) => (
                  <li key={r.id}>• session {r.id.slice(0, 8)}… — pages {r.pages_completed ?? 0}</li>
                ))}
                {!timelineQ.data?.reading?.length && (
                  <li className="text-muted-foreground">No reading sessions yet</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Planner Override */}
      <PlannerOverrides childId={childId} />
      
      {/* Homework */}
      <HomeworkLinks childId={childId} homeworkQ={homeworkQ} />
    </div>
  );
}

function PlannerOverrides({ childId }: { childId: string }) {
  const qc = useQueryClient();
  const plannerQ = useQuery({ 
    queryKey: ['edu-planner', childId], 
    queryFn: async () => (await edu.getPlanner(childId)).overrides 
  });
  
  const addM = useMutation({ 
    mutationFn: (b: any) => edu.addPlannerOverride(childId, b), 
    onSuccess: () => qc.invalidateQueries({ queryKey: ['edu-planner', childId] }) 
  });
  
  const [term, setTerm] = useState('2024-Autumn');
  const [subject, setSubject] = useState('');
  const [action, setAction] = useState<'include' | 'exclude' | 'replace'>('replace');
  const [note, setNote] = useState('');
  
  return (
    <Card className="md:col-span-2">
      <CardHeader><CardTitle>Curriculum Planner (Overrides)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-4 gap-2">
          <Input 
            placeholder="Term code" 
            value={term} 
            onChange={e => setTerm(e.target.value)} 
          />
          <Input 
            placeholder="Subject or topic name" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
          />
          <Select value={action} onValueChange={(v: any) => setAction(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
              <SelectItem value="replace">Replace</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => addM.mutate({ term_code: term, subject, action, note })}
            disabled={!term || !subject}
          >
            Add Override
          </Button>
        </div>
        <Textarea 
          placeholder="Note (e.g., Titanic moved to Spring)" 
          value={note} 
          onChange={e => setNote(e.target.value)} 
        />
        <div className="text-sm space-y-2">
          {(plannerQ.data ?? []).map((o: any) => (
            <div key={o.id} className="border rounded p-2">
              <span className="font-medium">[{o.term_code}]</span> {o.action} — {o.subject || o.topic_id}
              {o.note && <span className="text-muted-foreground ml-2">{o.note}</span>}
            </div>
          ))}
          {!plannerQ.data?.length && (
            <div className="text-muted-foreground">No curriculum overrides configured</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HomeworkLinks({ childId, homeworkQ }: { childId: string; homeworkQ: any }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'libre' | 'other'>('google');
  const [url, setUrl] = useState('');
  
  const addM = useMutation({
    mutationFn: () => edu.homeworkAdd(childId, { provider, title, file_url: url }),
    onSuccess: () => { 
      setTitle(''); 
      setUrl(''); 
      qc.invalidateQueries({ queryKey: ['edu-homework', childId] }); 
    }
  });
  
  return (
    <Card className="md:col-span-2">
      <CardHeader><CardTitle>Homework (Docs)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-4 gap-2">
          <Input 
            placeholder="Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Docs</SelectItem>
              <SelectItem value="microsoft">Microsoft 365</SelectItem>
              <SelectItem value="libre">LibreOffice (link)</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Share URL" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
          />
          <Button 
            onClick={() => addM.mutate()}
            disabled={!title || !url}
          >
            Add
          </Button>
        </div>
        <div className="text-sm space-y-2">
          {(homeworkQ.data ?? []).map((d: any) => (
            <div key={d.id} className="border rounded p-2">
              <a className="underline text-primary" href={d.file_url} target="_blank" rel="noopener noreferrer">
                {d.title}
              </a> 
              <span className="text-muted-foreground ml-2">[{d.provider}]</span>
            </div>
          ))}
          {!homeworkQ.data?.length && (
            <div className="text-muted-foreground">No homework links added yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
