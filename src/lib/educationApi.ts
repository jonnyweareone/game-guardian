
import { supabase } from '@/integrations/supabase/client';

const baseUrl = `https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/guardian-education`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}

export const edu = {
  listSchools: async (age: number, q = '', hint = '') => {
    const params = new URLSearchParams();
    if (age) params.set('age', String(age));
    const query = q || hint || '';
    if (query) params.set('q', query);
    return apiCall(`/schools?${params}`);
  },
  
  getProfile: async (childId: string) => {
    return apiCall(`/profile?child_id=${childId}`);
  },
  
  saveProfile: async (childId: string, body: any) => {
    return apiCall(`/profile?child_id=${childId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  interestsCatalog: async () => {
    return apiCall('/interests-catalog');
  },
  
  getInterests: async (childId: string) => {
    const r = await apiCall(`/interests?child_id=${childId}`);
    // normalize to array of { id, code, name, category }
    const items = (r.interests ?? []).map((row:any) => {
      const i = row.interests || row; // support both shapes
      return { id: i.id, code: i.code, name: i.name, category: i.category };
    });
    return { interests: items };
  },
  
  setInterests: async (childId: string, interest_ids: string[]) => {
    return apiCall(`/interests?child_id=${childId}`, {
      method: 'POST',
      body: JSON.stringify({ interest_ids }),
    });
  },
  
  getPlanner: async (childId: string) => {
    return apiCall(`/planner?child_id=${childId}`);
  },
  
  addPlannerOverride: async (childId: string, body: any) => {
    return apiCall(`/planner?child_id=${childId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  timeline: async (childId: string) => {
    return apiCall(`/timeline?child_id=${childId}`);
  },
  
  homeworkList: async (childId: string) => {
    return apiCall(`/homework?child_id=${childId}`);
  },
  
  homeworkAdd: async (childId: string, doc: any) => {
    return apiCall(`/homework?child_id=${childId}`, {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  }
};
