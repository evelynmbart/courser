import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LobbyClient } from "@/components/lobby-client"

export default async function LobbyPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <LobbyClient user={data.user} profile={profile} />
}
