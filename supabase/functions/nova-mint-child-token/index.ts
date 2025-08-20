import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { child_id } = await req.json();

    if (!child_id) {
      return new Response(
        JSON.stringify({ error: 'child_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create authenticated client
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Verify user owns the child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, parent_id, name')
      .eq('id', child_id)
      .single();

    if (childError || !child) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== child.parent_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate short-lived token (expires in 1 hour)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    const { data: tokenData, error: tokenError } = await supabase
      .from('nova_child_tokens')
      .insert({
        token,
        child_id,
        parent_user_id: user.id,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to create token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Nova child token minted: ${token} for child ${child_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        token,
        child_id,
        child_name: child.name,
        expires_at: expiresAt,
        nova_url: `${req.headers.get('origin') || 'https://app.example.com'}/novalearning?token=${token}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in nova-mint-child-token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});