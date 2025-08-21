-- Add missing triggers for child_bookshelf and child_listening_state

-- Create trigger function to update child_listening_state.updated_at
CREATE OR REPLACE FUNCTION public.update_child_listening_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to child_listening_state for updated_at
CREATE TRIGGER trigger_update_child_listening_state_updated_at
  BEFORE UPDATE ON public.child_listening_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_child_listening_state_updated_at();

-- Add trigger to child_bookshelf for awarding coins and logging timeline
CREATE TRIGGER trigger_award_on_bookshelf_progress
  AFTER INSERT OR UPDATE ON public.child_bookshelf
  FOR EACH ROW
  EXECUTE FUNCTION public._award_on_bookshelf_progress();

-- Add trigger to child_bookshelf for logging to timeline
CREATE TRIGGER trigger_log_bookshelf_to_timeline
  AFTER UPDATE ON public.child_bookshelf
  FOR EACH ROW
  EXECUTE FUNCTION public._log_bookshelf_to_timeline();