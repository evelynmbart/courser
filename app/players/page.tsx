"use client";

import { Navbar } from "@/components/ui/navbar";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  elo_rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
}

export default function PlayersPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      let { data } = await supabase
        .from("profiles")
        .select(
          "id,username,display_name,elo_rating,games_played,games_won,games_lost,games_drawn"
        )
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  // Compute user stats from profile
  const currentUser = profile
    ? {
        username: profile.username,
        handle: `@${profile.username}`,
        elo: profile.elo_rating,
        record: `${profile.games_won}W - ${profile.games_lost}L - ${profile.games_drawn}D`,
        winRate:
          profile.games_played > 0
            ? `${Math.round((profile.games_won / profile.games_played) * 100)}%`
            : "0%",
        lastActive: "Online",
      }
    : null;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        username={profile?.username || ""}
        elo={
          typeof profile?.elo_rating === "number"
            ? profile.elo_rating
            : undefined
        }
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Players</h1>
          <p className="text-sm text-muted-foreground">
            Your profile and friends
          </p>
        </div>
      </div>
    </div>
  );
}
