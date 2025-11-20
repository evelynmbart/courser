import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Calculate new ELO ratings for both players after a game
 * Uses standard ELO formula with K-factor of 32
 */
export async function updateEloRatings(
  whitePlayerId: string,
  blackPlayerId: string,
  winnerId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Get current ratings
    const { data: whitePlayer } = await supabase
      .from("profiles")
      .select("elo_rating")
      .eq("id", whitePlayerId)
      .single();

    const { data: blackPlayer } = await supabase
      .from("profiles")
      .select("elo_rating")
      .eq("id", blackPlayerId)
      .single();

    if (!whitePlayer || !blackPlayer) {
      console.error("Could not fetch player ratings");
      return;
    }

    const whiteElo = whitePlayer.elo_rating;
    const blackElo = blackPlayer.elo_rating;

    // Calculate expected scores
    const whiteExpected = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400));
    const blackExpected = 1 / (1 + Math.pow(10, (whiteElo - blackElo) / 400));

    // Determine actual scores
    let whiteScore: number;
    let blackScore: number;

    if (winnerId === whitePlayerId) {
      whiteScore = 1.0;
      blackScore = 0.0;
    } else if (winnerId === blackPlayerId) {
      whiteScore = 0.0;
      blackScore = 1.0;
    } else {
      // Draw
      whiteScore = 0.5;
      blackScore = 0.5;
    }

    // K-factor (higher for more volatile ratings)
    const kFactor = 32;

    // Calculate new ratings
    const whiteNewElo = Math.round(
      whiteElo + kFactor * (whiteScore - whiteExpected)
    );
    const blackNewElo = Math.round(
      blackElo + kFactor * (blackScore - blackExpected)
    );

    // Update white player
    await supabase
      .from("profiles")
      .update({
        elo_rating: whiteNewElo,
        games_played: supabase.rpc("increment", { x: 1 }),
        games_won:
          winnerId === whitePlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        games_lost:
          winnerId === blackPlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        games_drawn:
          winnerId !== whitePlayerId && winnerId !== blackPlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", whitePlayerId);

    // Update black player
    await supabase
      .from("profiles")
      .update({
        elo_rating: blackNewElo,
        games_played: supabase.rpc("increment", { x: 1 }),
        games_won:
          winnerId === blackPlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        games_lost:
          winnerId === whitePlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        games_drawn:
          winnerId !== whitePlayerId && winnerId !== blackPlayerId
            ? supabase.rpc("increment", { x: 1 })
            : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", blackPlayerId);

    // Alternative approach using direct SQL
    await supabase.rpc("update_player_stats", {
      p_player_id: whitePlayerId,
      p_result:
        winnerId === whitePlayerId
          ? "win"
          : winnerId === blackPlayerId
          ? "loss"
          : "draw",
    });

    await supabase.rpc("update_player_stats", {
      p_player_id: blackPlayerId,
      p_result:
        winnerId === blackPlayerId
          ? "win"
          : winnerId === whitePlayerId
          ? "loss"
          : "draw",
    });

    await supabase.rpc("update_elo_ratings", {
      p_white_player_id: whitePlayerId,
      p_black_player_id: blackPlayerId,
      p_result:
        winnerId === whitePlayerId
          ? "white_win"
          : winnerId === blackPlayerId
          ? "black_win"
          : "draw",
    });
  } catch (error) {
    console.error("Error updating ELO ratings:", error);
  }
}

/**
 * Get leaderboard of top players by ELO rating
 */
export async function getLeaderboard(
  supabase: SupabaseClient,
  limit = 100
): Promise<any[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "username, display_name, elo_rating, games_played, games_won, games_lost"
    )
    .order("elo_rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data || [];
}
