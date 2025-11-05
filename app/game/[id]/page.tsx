import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GameClient } from "@/components/game-client"

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get game data
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select(`
      *,
      white_player:profiles!games_white_player_id_fkey(id, username, elo_rating),
      black_player:profiles!games_black_player_id_fkey(id, username, elo_rating)
    `)
    .eq("id", id)
    .single()

  if (gameError || !game) {
    redirect("/lobby")
  }

  // Check if user is a player in this game
  if (game.white_player_id !== userData.user.id && game.black_player_id !== userData.user.id) {
    redirect("/lobby")
  }

  return <GameClient game={game} userId={userData.user.id} />
}
