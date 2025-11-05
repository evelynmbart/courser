-- Drop matchmaking queue (no longer needed)
DROP TABLE IF EXISTS public.matchmaking_queue CASCADE;

-- Add new columns to games table for lobby system
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS time_limit INTEGER, -- in minutes, null = unlimited
ADD COLUMN IF NOT EXISTS elo_min INTEGER, -- minimum ELO to join, null = unlimited
ADD COLUMN IF NOT EXISTS elo_max INTEGER, -- maximum ELO to join, null = unlimited
ADD COLUMN IF NOT EXISTS password TEXT, -- optional password protection
ADD COLUMN IF NOT EXISTS color_preference TEXT CHECK (color_preference IN ('white', 'black', 'random')),
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT false; -- true if waiting for opponent

-- Create index for open games
CREATE INDEX IF NOT EXISTS idx_games_is_open ON public.games(is_open) WHERE is_open = true;

-- Update games policies to allow viewing all open games and spectating active games
DROP POLICY IF EXISTS "games_select_own" ON public.games;
CREATE POLICY "games_select_all" ON public.games FOR SELECT 
  USING (
    is_open = true 
    OR status = 'active' 
    OR auth.uid() = white_player_id 
    OR auth.uid() = black_player_id
  );

-- Add spectators table for tracking who is watching games
CREATE TABLE IF NOT EXISTS public.spectators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

ALTER TABLE public.spectators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spectators_select_all" ON public.spectators FOR SELECT USING (true);
CREATE POLICY "spectators_insert_own" ON public.spectators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "spectators_delete_own" ON public.spectators FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_spectators_game_id ON public.spectators(game_id);
CREATE INDEX IF NOT EXISTS idx_spectators_user_id ON public.spectators(user_id);
