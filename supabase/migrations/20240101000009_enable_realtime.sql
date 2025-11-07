-- Enable realtime on tables that need real-time updates
-- This is required for Supabase realtime subscriptions to work
-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime
ADD
  TABLE public.games;

ALTER PUBLICATION supabase_realtime
ADD
  TABLE public.game_chat;

ALTER PUBLICATION supabase_realtime
ADD
  TABLE public.profiles;

-- Optional: Add moves table if you want real-time move tracking
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.moves;