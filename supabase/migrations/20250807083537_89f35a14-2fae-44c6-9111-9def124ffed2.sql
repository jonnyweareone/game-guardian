-- Create profiles table for parent users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table for child profiles
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create devices table for Game Guardian devices
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  device_code TEXT NOT NULL UNIQUE,
  device_name TEXT,
  is_active BOOLEAN DEFAULT false,
  paired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert_types enum
CREATE TYPE public.alert_type AS ENUM ('bullying', 'grooming', 'explicit_language', 'violent_content', 'inappropriate_sharing', 'cyberbullying');

-- Create risk_level enum  
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create alerts table for flagged conversations
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  alert_type public.alert_type NOT NULL,
  risk_level public.risk_level NOT NULL,
  ai_summary TEXT NOT NULL,
  transcript_snippet TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for children
CREATE POLICY "Parents can view their children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create children profiles" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children profiles" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children profiles" 
ON public.children 
FOR DELETE 
USING (auth.uid() = parent_id);

-- Create RLS policies for devices
CREATE POLICY "Parents can view their devices" 
ON public.devices 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create devices" 
ON public.devices 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their devices" 
ON public.devices 
FOR UPDATE 
USING (auth.uid() = parent_id);

-- Create RLS policies for alerts
CREATE POLICY "Parents can view alerts for their children" 
ON public.alerts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = alerts.child_id 
  AND children.parent_id = auth.uid()
));

CREATE POLICY "Parents can update alerts for their children" 
ON public.alerts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.children 
  WHERE children.id = alerts.child_id 
  AND children.parent_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();