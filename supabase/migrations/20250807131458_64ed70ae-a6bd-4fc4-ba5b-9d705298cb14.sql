-- Update devices table to ensure proper device codes
ALTER TABLE public.devices 
ADD CONSTRAINT devices_device_code_unique UNIQUE (device_code);

-- Create index for faster device lookups
CREATE INDEX IF NOT EXISTS idx_devices_device_code ON public.devices(device_code);
CREATE INDEX IF NOT EXISTS idx_devices_parent_child ON public.devices(parent_id, child_id);
CREATE INDEX IF NOT EXISTS idx_alerts_child_reviewed ON public.alerts(child_id, is_reviewed);
CREATE INDEX IF NOT EXISTS idx_conversations_child_session ON public.conversations(child_id, session_start);

-- Enable realtime for devices table
ALTER TABLE public.devices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;

-- Enable realtime for alerts table  
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Enable realtime for conversations table
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Add RLS policies for device data ingestion from Guardian AI boxes
CREATE POLICY "Guardian devices can insert conversation data" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices 
    WHERE devices.id = conversations.device_id 
    AND devices.is_active = true
  )
);

CREATE POLICY "Guardian devices can insert alert data" 
ON public.alerts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.devices 
    WHERE devices.id = alerts.device_id 
    AND devices.is_active = true
  )
);

-- Create policy for parent notifications
CREATE POLICY "Guardian system can create notifications" 
ON public.parent_notifications 
FOR INSERT 
WITH CHECK (true);  -- System-level inserts are allowed