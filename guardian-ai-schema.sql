-- Game Guardian AI Database Schema Export
-- Use this to understand the database structure for your Guardian AI client

-- Profiles table (auto-created when users sign up)
CREATE TABLE public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Children table
CREATE TABLE public.children (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    age integer,
    avatar_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Devices table (Guardian AI boxes)
CREATE TABLE public.devices (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
    device_code text NOT NULL UNIQUE, -- Format: GG-XXXX-XXXX
    device_name text,
    is_active boolean DEFAULT false,
    paired_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Conversations table (gaming sessions)
CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    platform text NOT NULL, -- Discord, Xbox Live, PlayStation, etc.
    participants text[], -- Array of participant names/IDs
    transcript jsonb, -- Array of message objects
    session_start timestamp with time zone NOT NULL DEFAULT now(),
    session_end timestamp with time zone,
    conversation_type text NOT NULL DEFAULT 'gaming', -- gaming, voice_chat, text_chat
    total_messages integer DEFAULT 0,
    sentiment_score numeric, -- -1.0 to 1.0
    risk_assessment text DEFAULT 'low', -- low, medium, high, critical
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Custom types for alerts
CREATE TYPE public.alert_type AS ENUM (
    'inappropriate_sharing',
    'cyberbullying', 
    'stranger_contact',
    'inappropriate_content',
    'positive_interaction',
    'suspicious_behavior',
    'gaming_addiction',
    'other'
);

CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Alerts table (AI-flagged incidents)
CREATE TABLE public.alerts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
    alert_type public.alert_type NOT NULL,
    risk_level public.risk_level NOT NULL,
    ai_summary text NOT NULL,
    transcript_snippet text,
    confidence_score numeric, -- 0.0 to 1.0
    emotional_impact text, -- low, medium, high
    social_context text, -- private_chat, group_chat, public_forum
    follow_up_required boolean DEFAULT false,
    is_reviewed boolean DEFAULT false,
    reviewed_at timestamp with time zone,
    flagged_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Parent notifications
CREATE TABLE public.parent_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
    notification_type text NOT NULL, -- alert, insight, system
    title text NOT NULL,
    message text NOT NULL,
    priority text NOT NULL DEFAULT 'normal', -- low, normal, high, critical
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    action_required boolean DEFAULT false,
    related_alert_id uuid REFERENCES public.alerts(id) ON DELETE SET NULL,
    related_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Conversation summaries (AI insights)
CREATE TABLE public.conversation_summaries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    summary_type text NOT NULL, -- daily, weekly, session
    ai_summary text NOT NULL,
    key_topics text[],
    emotional_tone text,
    confidence_score numeric,
    positive_highlights text[],
    concerns text[],
    talking_points text[],
    social_interactions jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_devices_device_code ON public.devices(device_code);
CREATE INDEX idx_devices_parent_child ON public.devices(parent_id, child_id);
CREATE INDEX idx_alerts_child_reviewed ON public.alerts(child_id, is_reviewed);
CREATE INDEX idx_conversations_child_session ON public.conversations(child_id, session_start);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;