-- Create conversations table for full conversation transcripts
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  device_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  platform TEXT NOT NULL, -- 'discord', 'xbox_live', 'steam', 'playstation', etc.
  participants TEXT[], -- array of usernames/participants
  total_messages INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  conversation_type TEXT NOT NULL DEFAULT 'gaming', -- 'gaming', 'voice_chat', 'text_chat'
  risk_assessment TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  transcript JSONB, -- full conversation with speaker labels and timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation summaries table for AI-generated insights
CREATE TABLE public.conversation_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  child_id UUID NOT NULL,
  summary_type TEXT NOT NULL, -- 'daily', 'weekly', 'session'
  ai_summary TEXT NOT NULL,
  key_topics TEXT[],
  emotional_tone TEXT, -- 'positive', 'neutral', 'negative', 'mixed'
  social_interactions JSONB, -- friend interactions, new contacts, etc.
  talking_points TEXT[], -- suggested discussion topics for parents
  positive_highlights TEXT[],
  concerns TEXT[],
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent notifications table for notification history
CREATE TABLE public.parent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID,
  notification_type TEXT NOT NULL, -- 'alert', 'summary', 'insight', 'achievement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  is_read BOOLEAN DEFAULT false,
  action_required BOOLEAN DEFAULT false,
  related_conversation_id UUID,
  related_alert_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add sentiment and conversation fields to existing alerts table
ALTER TABLE public.alerts 
ADD COLUMN conversation_id UUID,
ADD COLUMN emotional_impact TEXT, -- 'low', 'medium', 'high'
ADD COLUMN social_context TEXT, -- 'private_chat', 'group_chat', 'public_game', 'voice_call'
ADD COLUMN follow_up_required BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Parents can view their children's conversations" 
ON public.conversations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = conversations.child_id 
  AND children.parent_id = auth.uid()
));

-- Create RLS policies for conversation summaries
CREATE POLICY "Parents can view their children's summaries" 
ON public.conversation_summaries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = conversation_summaries.child_id 
  AND children.parent_id = auth.uid()
));

-- Create RLS policies for parent notifications
CREATE POLICY "Parents can view their own notifications" 
ON public.parent_notifications 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own notifications" 
ON public.parent_notifications 
FOR UPDATE 
USING (auth.uid() = parent_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_conversations_child_id ON public.conversations(child_id);
CREATE INDEX idx_conversations_session_start ON public.conversations(session_start DESC);
CREATE INDEX idx_conversation_summaries_child_id ON public.conversation_summaries(child_id);
CREATE INDEX idx_parent_notifications_parent_id ON public.parent_notifications(parent_id);
CREATE INDEX idx_parent_notifications_created_at ON public.parent_notifications(created_at DESC);