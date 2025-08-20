import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      game_events: {
        Row: {
          id: string
          child_id: string
          game: string
          event_type: string
          payload: any
        }
        Insert: {
          child_id: string
          game: string
          event_type: string
          payload: any
        }
      }
      challenge_templates: {
        Row: {
          id: string
          requirement: any
          points: number
          bonus: any
        }
      }
      daily_challenges: {
        Row: {
          id: string
          template_id: string
        }
      }
      challenge_completions: {
        Insert: {
          daily_challenge_id: string
          child_id: string
          event_id?: string
          points_awarded: number
        }
      }
      wallets: {
        Insert: {
          child_id: string
          coins: number
        }
        Update: {
          coins?: number
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

    const { child_id, game, event_type, event_data } = await req.json();

    if (!child_id || !game || !event_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: child_id, game, event_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert game event
    const { data: eventData, error: eventError } = await supabase
      .from('game_events')
      .insert({
        child_id,
        game,
        event_type,
        payload: event_data || {}
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error inserting game event:', eventError);
      throw eventError;
    }

    // Try to match daily challenges
    await tryMatchDailyChallenges(supabase, child_id, eventData.id, game, event_type, event_data || {});

    return new Response(
      JSON.stringify({ success: true, event_id: eventData.id }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in nova-game-event:', error);
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

async function tryMatchDailyChallenges(
  supabase: any, 
  child_id: string, 
  event_id: string, 
  game: string, 
  event_type: string, 
  event_data: any
) {
  const today = new Date().toISOString().slice(0, 10);

  // Get today's scheduled challenges or fallback to all templates
  const { data: dailyChallenges } = await supabase
    .from('daily_challenges')
    .select(`
      id,
      template_id,
      challenge_templates!inner(*)
    `)
    .eq('challenge_date', today);

  let candidates = dailyChallenges || [];
  
  if (!candidates.length) {
    // No scheduled challenges, check all templates
    const { data: allTemplates } = await supabase
      .from('challenge_templates')
      .select('*');
    
    candidates = (allTemplates || []).map((t: any) => ({
      id: null, // No daily_challenge_id for fallback
      template_id: t.id,
      challenge_templates: t
    }));
  }

  for (const candidate of candidates) {
    const template = candidate.challenge_templates;
    const req = template.requirement;

    if (matches(req, { event_type, game, event_data })) {
      // Check if already completed
      if (candidate.id) {
        const { data: existing } = await supabase
          .from('challenge_completions')
          .select('id')
          .eq('daily_challenge_id', candidate.id)
          .eq('child_id', child_id)
          .maybeSingle();
        
        if (existing) continue; // Already completed
      }

      const points = template.points + bonusPoints(template.bonus, event_data);
      
      if (candidate.id) {
        // Insert completion record
        await supabase.from('challenge_completions').insert({
          daily_challenge_id: candidate.id,
          child_id,
          event_id,
          points_awarded: points
        });
      }

      // Award coins via wallet system
      await supabase.rpc('award_coins', {
        p_child: child_id,
        p_delta: points
      });

      console.log(`Awarded ${points} coins to child ${child_id} for completing ${template.title}`);
    }
  }
}

function matches(req: any, ev: { event_type: string; game: string; event_data: any }): boolean {
  if (req.event_type !== ev.event_type) return false;
  if (req.game && req.game !== ev.game) return false;

  // Reading pages challenge
  if (req.event_type === "book_read_pages") {
    const count = Number(ev.event_data?.count || 0);
    return count >= (req.min_pages || 1);
  }

  // Level completion with accuracy
  if (req.event_type === "level_complete") {
    if (typeof req.level === "number" && ev.event_data?.level !== req.level) return false;
    if (typeof req.min_accuracy === "number" && (ev.event_data?.accuracy || 0) < req.min_accuracy) return false;
    
    if (typeof req.max_over_optimal === "number") {
      const used = Number(ev.event_data?.usedBlocks || 999);
      const optimal = Number(ev.event_data?.optimalBlocks || 0);
      if ((used - optimal) > req.max_over_optimal) return false;
    }
  }

  // Project submission with constraints
  if (req.event_type === "project_submit") {
    if (typeof req.min_stitches === "number" && (ev.event_data?.stitches || 0) < req.min_stitches) return false;
  }

  return true;
}

function bonusPoints(bonus: any, data: any): number {
  let add = 0;
  
  if (typeof bonus?.min_accuracy === "number" && (data?.accuracy || 0) >= bonus.min_accuracy) {
    add += Number(bonus.bonus_points || 0);
  }
  
  if (typeof bonus?.max_over_optimal === "number") {
    const over = (data?.usedBlocks || 0) - (data?.optimalBlocks || 0);
    if (over <= bonus.max_over_optimal) {
      add += Number(bonus.bonus_points || 0);
    }
  }
  
  if (typeof bonus?.min_stitches === "number" && (data?.stitches || 0) >= bonus.min_stitches) {
    add += Number(bonus.bonus_points || 0);
  }
  
  return add;
}