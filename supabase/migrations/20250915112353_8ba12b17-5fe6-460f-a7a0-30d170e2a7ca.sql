-- Add ISP management tables for bridge integration

-- Create ISP tenants table
CREATE TABLE public.isp_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  api_key TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  bridge_endpoint TEXT,
  webhook_secret TEXT DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on isp_tenants
ALTER TABLE public.isp_tenants ENABLE ROW LEVEL SECURITY;

-- Create policy for ISP admin access to their tenant data
CREATE POLICY "ISP admins can access their tenant data" 
ON public.isp_tenants
FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'isp_code' = isp_code
);

-- Create bridge authentication tokens table for ISP integration
CREATE TABLE public.bridge_auth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_tenant_id UUID NOT NULL REFERENCES public.isp_tenants(id) ON DELETE CASCADE,
  device_code TEXT NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(isp_tenant_id, device_code)
);

-- Enable RLS on bridge_auth_tokens
ALTER TABLE public.bridge_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for ISP tenant access to their bridge tokens
CREATE POLICY "ISP tenants can manage their bridge tokens" 
ON public.bridge_auth_tokens
FOR ALL
USING (
  isp_tenant_id IN (
    SELECT id FROM public.isp_tenants 
    WHERE isp_code = current_setting('request.jwt.claims', true)::json->>'isp_code'
  )
);

-- Create bridge sync logs for tracking communication with ISP systems
CREATE TABLE public.bridge_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_tenant_id UUID NOT NULL REFERENCES public.isp_tenants(id) ON DELETE CASCADE,
  device_code TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'policy_push', 'device_status', 'client_data', etc.
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bridge_sync_logs
ALTER TABLE public.bridge_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for ISP tenant access to their sync logs
CREATE POLICY "ISP tenants can view their sync logs" 
ON public.bridge_sync_logs
FOR SELECT
USING (
  isp_tenant_id IN (
    SELECT id FROM public.isp_tenants 
    WHERE isp_code = current_setting('request.jwt.claims', true)::json->>'isp_code'
  )
);

-- Create indexes for performance
CREATE INDEX idx_bridge_auth_tokens_device_code ON public.bridge_auth_tokens(device_code);
CREATE INDEX idx_bridge_auth_tokens_parent_id ON public.bridge_auth_tokens(parent_id);
CREATE INDEX idx_bridge_auth_tokens_expires_at ON public.bridge_auth_tokens(expires_at);
CREATE INDEX idx_bridge_sync_logs_device_code ON public.bridge_sync_logs(device_code);
CREATE INDEX idx_bridge_sync_logs_created_at ON public.bridge_sync_logs(created_at);

-- Add trigger for updated_at on isp_tenants
CREATE TRIGGER update_isp_tenants_updated_at
  BEFORE UPDATE ON public.isp_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo ISP tenant
INSERT INTO public.isp_tenants (isp_code, name, contact_email, bridge_endpoint)
VALUES ('ISP001', 'Demo ISP Provider', 'admin@isp.com', 'https://bridge-api.demo-isp.com');