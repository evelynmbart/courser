-- Drop the old update policy
DROP POLICY IF EXISTS "games_update_players" ON public.games;

-- Create new update policy that allows:
-- 1. Players in the game to update it (for moves)
-- 2. Creator to update their own game (for canceling)
-- 3. Any authenticated user to join an open game
CREATE POLICY "games_update_policy" ON public.games FOR UPDATE 
  USING (
    auth.uid() = white_player_id 
    OR auth.uid() = black_player_id 
    OR auth.uid() = creator_id
    OR (is_open = true AND status = 'waiting')
  );
