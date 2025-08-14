
// Edge function to verify notification channels with codes
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { channelId, code } = await req.json()

    // Get the verification record
    const { data: verification, error: verificationError } = await supabase
      .from('notification_channel_verifications')
      .select('*')
      .eq('channel_id', channelId)
      .eq('verification_code', code)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (verificationError) {
      console.error('Verification lookup error:', verificationError)
      return new Response(JSON.stringify({ error: 'Verification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!verification) {
      // Increment attempts for any existing verification
      await supabase
        .from('notification_channel_verifications')
        .update({ attempts: supabase.raw('attempts + 1') })
        .eq('channel_id', channelId)
        .gt('expires_at', new Date().toISOString())

      return new Response(JSON.stringify({ error: 'Invalid or expired verification code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Mark channel as verified
    const { error: updateError } = await supabase
      .from('notification_channels')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', channelId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to verify channel:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to verify channel' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean up verification records for this channel
    await supabase
      .from('notification_channel_verifications')
      .delete()
      .eq('channel_id', channelId)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in verify-notification-channel function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
