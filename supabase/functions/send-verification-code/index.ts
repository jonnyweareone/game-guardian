
// Edge function to send verification codes via email or SMS
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

    const { channelId } = await req.json()

    // Get the notification channel
    const { data: channel, error: channelError } = await supabase
      .from('notification_channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single()

    if (channelError || !channel) {
      return new Response(JSON.stringify({ error: 'Channel not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store verification code
    const { error: insertError } = await supabase
      .from('notification_channel_verifications')
      .insert({
        channel_id: channelId,
        verification_code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    if (insertError) {
      console.error('Failed to store verification code:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to generate verification code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send verification code based on channel type
    if (channel.kind === 'EMAIL') {
      // For now, we'll just log the code (in production, use Resend or similar)
      console.log(`Verification code for ${channel.destination}: ${verificationCode}`)
      
      // TODO: Implement actual email sending with Resend
      // const resendApiKey = Deno.env.get('RESEND_API_KEY')
      // Send email with verification code
      
    } else if (channel.kind === 'SMS') {
      // For now, we'll just log the code (in production, use Twilio or similar)
      console.log(`SMS verification code for ${channel.destination}: ${verificationCode}`)
      
      // TODO: Implement actual SMS sending
      // const twilioApiKey = Deno.env.get('TWILIO_API_KEY')
      // Send SMS with verification code
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-verification-code function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
