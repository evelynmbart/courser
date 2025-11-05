import { PlayerProfileClient } from "@/components/player-profile-client";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get player profile
  const { data: player } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!player) {
    notFound();
  }

  // Get player's recent games
  const { data: recentGames } = await supabase
    .from("games")
    .select(
      `
      *,
      white_player:profiles!games_white_player_id_fkey(username, elo_rating),
      black_player:profiles!games_black_player_id_fkey(username, elo_rating)
    `
    )
    .or(`white_player_id.eq.${id},black_player_id.eq.${id}`)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(10);

  // Get current user's profile
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return (
    <PlayerProfileClient
      currentUserId={data.user.id}
      currentUserProfile={currentUserProfile}
      player={player}
      recentGames={recentGames || []}
    />
  );
}
