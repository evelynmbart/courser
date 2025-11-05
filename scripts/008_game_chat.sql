-- Game chat table for in-game communication
CREATE TABLE IF NOT EXISTS public.game_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.game_chat ENABLE ROW LEVEL SECURITY;

-- Chat policies - players in the game can read and write
CREATE POLICY "game_chat_select_players" ON public.game_chat FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.games 
      WHERE games.id = game_chat.game_id 
      AND (games.white_player_id = auth.uid() OR games.black_player_id = auth.uid())
    )
  );

CREATE POLICY "game_chat_insert_players" ON public.game_chat FOR INSERT 
  WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.games 
      WHERE games.id = game_chat.game_id 
      AND (games.white_player_id = auth.uid() OR games.black_player_id = auth.uid())
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_chat_game_id ON public.game_chat(game_id);
CREATE INDEX IF NOT EXISTS idx_game_chat_created_at ON public.game_chat(created_at);
