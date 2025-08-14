
-- Create device_jobs table for job queue
CREATE TABLE IF NOT EXISTS public.device_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g., 'POST_INSTALL'
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'queued', -- queued|running|done|failed
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_jobs_device_status_created ON public.device_jobs (device_id, status, created_at);

-- Create device_job_logs table for optional logging
CREATE TABLE IF NOT EXISTS public.device_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.device_jobs(id) ON DELETE CASCADE,
  log text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create child_device_links table for device-child assignments
CREATE TABLE IF NOT EXISTS public.child_device_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id)
);

-- Enable RLS on device_jobs
ALTER TABLE public.device_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for device_jobs
CREATE POLICY "device_read" ON public.device_jobs
  FOR SELECT USING (device_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "device_update" ON public.device_jobs
  FOR UPDATE USING (device_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "service_role_insert" ON public.device_jobs
  FOR INSERT TO service_role USING (true);

CREATE POLICY "parents_view_device_jobs" ON public.device_jobs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.devices d 
    WHERE d.id = device_jobs.device_id AND d.parent_id = auth.uid()
  ));

-- Enable RLS on device_job_logs
ALTER TABLE public.device_job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_insert_logs" ON public.device_job_logs
  FOR INSERT USING (EXISTS (
    SELECT 1 FROM public.device_jobs dj 
    WHERE dj.id = device_job_logs.job_id 
    AND dj.device_id::text = auth.jwt() ->> 'sub'
  ));

-- Enable RLS on child_device_links
ALTER TABLE public.child_device_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_manage_device_links" ON public.child_device_links
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.devices d 
    WHERE d.id = child_device_links.device_id AND d.parent_id = auth.uid()
  ));
