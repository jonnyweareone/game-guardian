import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeviceRegistration {
  device_code: string;
  device_info?: {
    os: string;
    version: string;
    hardware_id: string;
  };
}

function generateDeviceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  // Generate GG-XXXX-XXXX format
  segments.push('GG');
  
  for (let i = 0; i < 2; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      // Register a new device (called by Guardian AI box)
      const data: DeviceRegistration = await req.json();
      
      let deviceCode = data.device_code;
      
      // Generate device code if not provided
      if (!deviceCode) {
        deviceCode = generateDeviceCode();
        
        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from('devices')
            .select('id')
            .eq('device_code', deviceCode)
            .single();
          
          if (!existing) break;
          
          deviceCode = generateDeviceCode();
          attempts++;
        }
      }

      // Create device record (not paired yet)
      const { data: device, error } = await supabase
        .from('devices')
        .insert({
          device_code: deviceCode,
          is_active: false, // Will be activated when paired
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Registered new device:', deviceCode);

      return new Response(
        JSON.stringify({ 
          device_code: deviceCode,
          device_id: device.id,
          status: 'registered',
          pairing_required: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201 
        }
      );
    }

    if (req.method === 'GET') {
      // Check device status (called by Guardian AI box)
      const url = new URL(req.url);
      const deviceCode = url.searchParams.get('device_code');
      
      if (!deviceCode) {
        throw new Error('Device code required');
      }

      const { data: device, error } = await supabase
        .from('devices')
        .select('*, children(name), profiles!devices_parent_id_fkey(full_name)')
        .eq('device_code', deviceCode)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          device_code: deviceCode,
          is_paired: device.is_active,
          parent_name: device.profiles?.full_name,
          child_name: device.children?.name,
          paired_at: device.paired_at,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Error in device registration:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});