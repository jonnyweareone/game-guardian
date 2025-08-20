import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      challenge_templates: {
        Row: {
          id: string
          title: string
          description: string
          subject: string
          item_slug: string
          points: number
          requirement: any
          bonus: any
        }
      }
      daily_challenges: {
        Row: {
          id: string
          challenge_date: string
          template_id: string
        }
      }
      challenge_completions: {
        Row: {
          daily_challenge_id: string
          child_id: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Get scheduled challenges for today; if none, pick 4 default templates
    const { data: scheduled } = await supabase
      .from('daily_challenges')
      .select(`
        id, 
        template_id, 
        challenge_date,
        challenge_templates!inner(*)
      `)
      .eq('challenge_date', today);

    let templates = scheduled?.map((r: any) => ({ 
      ...r.challenge_templates, 
      daily_challenge_id: r.id 
    })) || [];

    if (!templates.length) {
      const { data: defaultTemplates } = await supabase
        .from('challenge_templates')
        .select('*')
        .limit(4);
      templates = defaultTemplates || [];
    }

    // Map to UI format
    const challenges = templates.slice(0, 4).map((t: any) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      description: t.description,
      points: t.points,
      done: false, // TODO: check completions when child_id available
      ctaHref: routeFor(t)
    }));

    return new Response(
      JSON.stringify({ challenges }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in nova-challenges-today:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function routeFor(template: any): string {
  if (template.subject === "Reading") return "/education";
  if (template.item_slug?.includes("blockly")) return "/education?tab=games";
  if (template.item_slug === "tuxmath") return "/education?tab=games";
  if (template.item_slug === "turtlestitch") return "/education?tab=activities";
  return "/education";
}