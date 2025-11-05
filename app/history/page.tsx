import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HistoryClient } from "@/components/history-client"

export default async function HistoryPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch recent 100 games
  const { data: games } = await supabase
    .from("games")
    .select(
      `
      *,
      white_player:profiles!games_white_player_id_fkey(id, username, elo_rating),
      black_player:profiles!games_black_player_id_fkey(id, username, elo_rating)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100)

  return <HistoryClient games={games || []} userId={user.id} />
}
