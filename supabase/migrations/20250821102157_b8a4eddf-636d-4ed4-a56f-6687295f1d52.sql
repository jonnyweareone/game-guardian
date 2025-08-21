-- Add started_at column to child_listening_state if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'child_listening_state' AND column_name = 'started_at') THEN
        ALTER TABLE public.child_listening_state ADD COLUMN started_at timestamptz;
    END IF;
END $$;

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public._bump_listen_updated()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
    NEW.updated_at = now(); 
    RETURN NEW; 
END $$;

-- Drop and recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS trg_bump_listen ON public.child_listening_state;
CREATE TRIGGER trg_bump_listen 
    BEFORE UPDATE ON public.child_listening_state
    FOR EACH ROW EXECUTE FUNCTION public._bump_listen_updated();

-- Create rewards ledger table
CREATE TABLE IF NOT EXISTS public.rewards_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL,
    source text NOT NULL,
    points int NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on rewards_ledger
ALTER TABLE public.rewards_ledger ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rewards_ledger
CREATE POLICY "Parents can view their children's rewards" 
ON public.rewards_ledger FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.children c 
    WHERE c.id = rewards_ledger.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "System can insert rewards" 
ON public.rewards_ledger FOR INSERT 
WITH CHECK (true);

-- Create function to award coins on reading progress
CREATE OR REPLACE FUNCTION public._award_on_bookshelf_progress()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    prev_progress numeric := 0;
    progress_milestone int;
    prev_milestone int;
BEGIN
    -- Get previous progress for this child/book combination
    IF TG_OP = 'UPDATE' THEN
        prev_progress := COALESCE(OLD.progress, 0);
    END IF;
    
    -- Award coins for progress milestones (every 10%)
    IF NEW.progress IS NOT NULL THEN
        progress_milestone := floor(NEW.progress / 10);
        prev_milestone := floor(prev_progress / 10);
        
        -- Award 1 coin for each new 10% milestone reached
        IF progress_milestone > prev_milestone THEN
            INSERT INTO public.rewards_ledger(child_id, source, points, meta)
            VALUES(NEW.child_id, 'reading_progress', progress_milestone - prev_milestone, 
                   jsonb_build_object('book_id', NEW.book_id, 'progress', NEW.progress));
        END IF;
    END IF;
    
    -- Award bonus for finishing a book
    IF TG_OP = 'UPDATE' AND OLD.status != 'finished' AND NEW.status = 'finished' THEN
        INSERT INTO public.rewards_ledger(child_id, source, points, meta)
        VALUES(NEW.child_id, 'reading_completion', 5, 
               jsonb_build_object('book_id', NEW.book_id, 'finished', true));
    END IF;
    
    RETURN NEW;
END $$;

-- Drop and recreate trigger for bookshelf progress awards
DROP TRIGGER IF EXISTS trg_awards_progress ON public.child_bookshelf;
CREATE TRIGGER trg_awards_progress 
    AFTER INSERT OR UPDATE ON public.child_bookshelf
    FOR EACH ROW EXECUTE FUNCTION public._award_on_bookshelf_progress();

-- Create Nova Games sessions table
CREATE TABLE IF NOT EXISTS public.nova_games_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid NOT NULL,
    book_id uuid NOT NULL,
    game_code text NOT NULL,
    started_at timestamptz DEFAULT now(),
    ended_at timestamptz,
    score int DEFAULT 0
);

-- Create Nova Games rounds table
CREATE TABLE IF NOT EXISTS public.nova_games_rounds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.nova_games_sessions(id) ON DELETE CASCADE,
    round_no int NOT NULL,
    target_word text NOT NULL,
    success boolean,
    seconds int,
    created_at timestamptz DEFAULT now(),
    UNIQUE(session_id, round_no)
);

-- Enable RLS on Nova Games tables
ALTER TABLE public.nova_games_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_games_rounds ENABLE ROW LEVEL SECURITY;

-- RLS policies for Nova Games sessions
CREATE POLICY "Parents can view their children's game sessions" 
ON public.nova_games_sessions FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.children c 
    WHERE c.id = nova_games_sessions.child_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Parents can create their children's game sessions" 
ON public.nova_games_sessions FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.children c 
    WHERE c.id = nova_games_sessions.child_id AND c.parent_id = auth.uid()
));

-- RLS policies for Nova Games rounds
CREATE POLICY "Parents can view their children's game rounds" 
ON public.nova_games_rounds FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.nova_games_sessions s 
    JOIN public.children c ON c.id = s.child_id 
    WHERE s.id = nova_games_rounds.session_id AND c.parent_id = auth.uid()
));

CREATE POLICY "Parents can create their children's game rounds" 
ON public.nova_games_rounds FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.nova_games_sessions s 
    JOIN public.children c ON c.id = s.child_id 
    WHERE s.id = nova_games_rounds.session_id AND c.parent_id = auth.uid()
));