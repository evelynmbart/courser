import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PlayersClient } from "@/components/players-client"

export default async function PlayersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all players
  const { data: players } = await supabase.from("profiles").select("*").order("elo_rating", { ascending: false })

  return <PlayersClient currentUserId={data.user.id} players={players || []} />
}
