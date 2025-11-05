-- Function to update profile stats after game completion
CREATE OR REPLACE FUNCTION public.update_player_stats(
  p_player_id UUID,
  p_result TEXT -- 'win', 'loss', 'draw'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    games_played = games_played + 1,
    games_won = CASE WHEN p_result = 'win' THEN games_won + 1 ELSE games_won END,
    games_lost = CASE WHEN p_result = 'loss' THEN games_lost + 1 ELSE games_lost END,
    games_drawn = CASE WHEN p_result = 'draw' THEN games_drawn + 1 ELSE games_drawn END,
    updated_at = NOW()
  WHERE id = p_player_id;
END;
$$;

-- Function to calculate and update ELO ratings
CREATE OR REPLACE FUNCTION public.update_elo_ratings(
  p_white_player_id UUID,
  p_black_player_id UUID,
  p_result TEXT -- 'white_win', 'black_win', 'draw'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  white_elo INTEGER;
  black_elo INTEGER;
  white_expected NUMERIC;
  black_expected NUMERIC;
  white_score NUMERIC;
  black_score NUMERIC;
  k_factor INTEGER := 32;
  white_new_elo INTEGER;
  black_new_elo INTEGER;
BEGIN
  -- Get current ELO ratings
  SELECT elo_rating INTO white_elo FROM public.profiles WHERE id = p_white_player_id;
  SELECT elo_rating INTO black_elo FROM public.profiles WHERE id = p_black_player_id;
  
  -- Calculate expected scores
  white_expected := 1.0 / (1.0 + POWER(10.0, (black_elo - white_elo) / 400.0));
  black_expected := 1.0 / (1.0 + POWER(10.0, (white_elo - black_elo) / 400.0));
  
  -- Determine actual scores
  IF p_result = 'white_win' THEN
    white_score := 1.0;
    black_score := 0.0;
  ELSIF p_result = 'black_win' THEN
    white_score := 0.0;
    black_score := 1.0;
  ELSE -- draw
    white_score := 0.5;
    black_score := 0.5;
  END IF;
  
  -- Calculate new ELO ratings
  white_new_elo := white_elo + ROUND(k_factor * (white_score - white_expected));
  black_new_elo := black_elo + ROUND(k_factor * (black_score - black_expected));
  
  -- Update ratings
  UPDATE public.profiles SET elo_rating = white_new_elo, updated_at = NOW() WHERE id = p_white_player_id;
  UPDATE public.profiles SET elo_rating = black_new_elo, updated_at = NOW() WHERE id = p_black_player_id;
END;
$$;
