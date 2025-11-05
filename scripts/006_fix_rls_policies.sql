-- Fix games INSERT policy to allow creating open games
DROP POLICY IF EXISTS "games_insert_own" ON public.games;

-- Allow users to create games where they are the creator
CREATE POLICY "games_insert_creator" ON public.games FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

-- Update games UPDATE policy to allow creator to update open games (for when someone joins)
DROP POLICY IF EXISTS "games_update_players" ON public.games;
CREATE POLICY "games_update_all_participants" ON public.games FOR UPDATE 
  USING (
    auth.uid() = creator_id 
    OR auth.uid() = white_player_id 
    OR auth.uid() = black_player_id
  );
