
-- Add missing foreign key constraint between conversations and children tables
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES public.children(id)
  ON DELETE CASCADE;
