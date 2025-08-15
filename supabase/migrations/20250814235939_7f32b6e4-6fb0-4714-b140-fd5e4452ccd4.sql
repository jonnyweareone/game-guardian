
-- Add new columns to app_catalog table for enhanced app store functionality
ALTER TABLE public.app_catalog 
ADD COLUMN is_mobile_compatible boolean DEFAULT false,
ADD COLUMN cross_platform_progress text CHECK (cross_platform_progress IN ('cross-device', 'same-platform', 'device-local')),
ADD COLUMN install_path_desktop text,
ADD COLUMN install_path_mobile text,
ADD COLUMN hero_url text,
ADD COLUMN description_long text;

-- Create enum types for app_versions table
CREATE TYPE platform_type AS ENUM ('linux-desktop', 'linux-mobile', 'android', 'web-pwa');
CREATE TYPE release_channel_type AS ENUM ('stable', 'beta', 'alpha', 'nightly');

-- Create app_versions table
CREATE TABLE public.app_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id text NOT NULL REFERENCES public.app_catalog(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    version text NOT NULL,
    package_url text,
    package_hash_sha256 text,
    release_channel release_channel_type DEFAULT 'stable',
    min_os text,
    max_os text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(app_id, platform, version)
);

-- Create installed_apps table
CREATE TABLE public.installed_apps (
    app_id text NOT NULL REFERENCES public.app_catalog(id) ON DELETE CASCADE,
    device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
    version text NOT NULL,
    platform platform_type NOT NULL,
    installed_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (app_id, device_id)
);

-- Create pending_requests table for parent approval flow
CREATE TABLE public.pending_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    app_id text NOT NULL REFERENCES public.app_catalog(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    processed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on new tables
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_versions (publicly readable for active apps)
CREATE POLICY "Anyone can view app versions for active apps" ON public.app_versions
FOR SELECT USING (
    app_id IN (SELECT id FROM public.app_catalog WHERE is_active = true)
);

-- RLS policies for installed_apps
CREATE POLICY "Parents can view installed apps on their devices" ON public.installed_apps
FOR SELECT USING (
    device_id IN (SELECT id FROM public.devices WHERE parent_id = auth.uid())
);

CREATE POLICY "Guardian devices can insert installed apps" ON public.installed_apps
FOR INSERT WITH CHECK (
    device_id IN (SELECT id FROM public.devices WHERE is_active = true)
);

CREATE POLICY "Guardian devices can update installed apps" ON public.installed_apps
FOR UPDATE USING (
    device_id IN (SELECT id FROM public.devices WHERE is_active = true)
);

-- RLS policies for pending_requests
CREATE POLICY "Parents can view requests for their children" ON public.pending_requests
FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can insert requests for their children" ON public.pending_requests
FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can update requests for their children" ON public.pending_requests
FOR UPDATE USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

-- Update app_catalog RLS to allow public read access for browsing
CREATE POLICY "Public can browse active apps" ON public.app_catalog
FOR SELECT USING (is_active = true);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_app_versions_updated_at
    BEFORE UPDATE ON public.app_versions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_app_versions_app_platform ON public.app_versions(app_id, platform);
CREATE INDEX idx_installed_apps_device ON public.installed_apps(device_id);
CREATE INDEX idx_installed_apps_child ON public.installed_apps(child_id);
CREATE INDEX idx_pending_requests_child ON public.pending_requests(child_id);
CREATE INDEX idx_pending_requests_status ON public.pending_requests(status);
