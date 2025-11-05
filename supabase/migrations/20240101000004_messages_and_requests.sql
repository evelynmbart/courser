-- Messages table for player-to-player communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game requests table for correspondence game challenges
CREATE TABLE IF NOT EXISTS public.game_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenged_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('live', 'correspondence')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  is_open BOOLEAN DEFAULT FALSE, -- true if anyone can accept
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_recipient" ON public.messages FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Game requests policies
CREATE POLICY "game_requests_select_all" ON public.game_requests FOR SELECT USING (true);
CREATE POLICY "game_requests_insert_own" ON public.game_requests FOR INSERT 
  WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "game_requests_update_involved" ON public.game_requests FOR UPDATE 
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id OR is_open = true);
CREATE POLICY "game_requests_delete_own" ON public.game_requests FOR DELETE 
  USING (auth.uid() = challenger_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_game_requests_challenger ON public.game_requests(challenger_id);
CREATE INDEX IF NOT EXISTS idx_game_requests_challenged ON public.game_requests(challenged_id);
CREATE INDEX IF NOT EXISTS idx_game_requests_status ON public.game_requests(status);
CREATE INDEX IF NOT EXISTS idx_game_requests_is_open ON public.game_requests(is_open);

-- Update profiles table to track last activity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active_at = NOW() 
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_active_at on moves
CREATE TRIGGER update_last_active_on_move
AFTER INSERT ON public.moves
FOR EACH ROW
EXECUTE FUNCTION update_last_active();
