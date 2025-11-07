"use client";

import { PlayerProfileClient } from "@/components/player-profile-client";

// Dummy data for demonstration
const dummyPlayers: Record<string, any> = {
  "friend-1-id": {
    id: "friend-1-id",
    username: "joebeez",
    display_name: "Joe Beez",
    bio: "Chess master and strategy enthusiast. Always up for a good game!",
    avatar_url: null,
    elo_rating: 1215,
    games_played: 15,
    games_won: 10,
    games_lost: 3,
    games_drawn: 2,
    last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
  },
  "friend-2-id": {
    id: "friend-2-id",
    username: "chessqueen99",
    display_name: "Chess Queen",
    bio: "Tactical genius. I love endgame scenarios and queen sacrifices!",
    avatar_url: null,
    elo_rating: 1350,
    games_played: 40,
    games_won: 25,
    games_lost: 10,
    games_drawn: 5,
    last_active_at: new Date().toISOString(), // Online now
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
  },
  "friend-3-id": {
    id: "friend-3-id",
    username: "knightrider",
    display_name: "Knight Rider",
    bio: "Learning and improving every day. Knight forks are my specialty!",
    avatar_url: null,
    elo_rating: 1180,
    games_played: 30,
    games_won: 12,
    games_lost: 15,
    games_drawn: 3,
    last_active_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  },
  "current-user-id": {
    id: "current-user-id",
    username: "levelynup",
    display_name: "Levelynup",
    bio: "Chess enthusiast and strategy game lover.",
    avatar_url: null,
    elo_rating: 1184,
    games_played: 1,
    games_won: 0,
    games_lost: 1,
    games_drawn: 0,
    last_active_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
};

const dummyGames = [
  // joebeez games (friend-1-id)
  {
    id: "game-1",
    status: "completed",
    winner_id: "friend-1-id",
    win_reason: "checkmate",
    white_player: { username: "joebeez", elo_rating: 1215 },
    black_player: { username: "player2", elo_rating: 1180 },
    white_player_id: "friend-1-id",
    black_player_id: "player2-id",
    completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-2",
    status: "completed",
    winner_id: null,
    win_reason: "draw",
    white_player: { username: "player3", elo_rating: 1200 },
    black_player: { username: "joebeez", elo_rating: 1215 },
    white_player_id: "player3-id",
    black_player_id: "friend-1-id",
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-3",
    status: "completed",
    winner_id: "friend-1-id",
    win_reason: "resignation",
    white_player: { username: "joebeez", elo_rating: 1215 },
    black_player: { username: "player4", elo_rating: 1150 },
    white_player_id: "friend-1-id",
    black_player_id: "player4-id",
    completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-4",
    status: "completed",
    winner_id: "player5-id",
    win_reason: "checkmate",
    white_player: { username: "player5", elo_rating: 1250 },
    black_player: { username: "joebeez", elo_rating: 1215 },
    white_player_id: "player5-id",
    black_player_id: "friend-1-id",
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // chessqueen99 games (friend-2-id)
  {
    id: "game-5",
    status: "completed",
    winner_id: "friend-2-id",
    win_reason: "checkmate",
    white_player: { username: "chessqueen99", elo_rating: 1350 },
    black_player: { username: "player6", elo_rating: 1300 },
    white_player_id: "friend-2-id",
    black_player_id: "player6-id",
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-6",
    status: "completed",
    winner_id: "friend-2-id",
    win_reason: "resignation",
    white_player: { username: "player7", elo_rating: 1280 },
    black_player: { username: "chessqueen99", elo_rating: 1350 },
    white_player_id: "player7-id",
    black_player_id: "friend-2-id",
    completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-7",
    status: "completed",
    winner_id: "player8-id",
    win_reason: "time",
    white_player: { username: "chessqueen99", elo_rating: 1350 },
    black_player: { username: "player8", elo_rating: 1400 },
    white_player_id: "friend-2-id",
    black_player_id: "player8-id",
    completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // knightrider games (friend-3-id)
  {
    id: "game-8",
    status: "completed",
    winner_id: "player9-id",
    win_reason: "checkmate",
    white_player: { username: "player9", elo_rating: 1200 },
    black_player: { username: "knightrider", elo_rating: 1180 },
    white_player_id: "player9-id",
    black_player_id: "friend-3-id",
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-9",
    status: "completed",
    winner_id: "friend-3-id",
    win_reason: "checkmate",
    white_player: { username: "knightrider", elo_rating: 1180 },
    black_player: { username: "player10", elo_rating: 1150 },
    white_player_id: "friend-3-id",
    black_player_id: "player10-id",
    completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "game-10",
    status: "completed",
    winner_id: null,
    win_reason: "draw",
    white_player: { username: "player11", elo_rating: 1190 },
    black_player: { username: "knightrider", elo_rating: 1180 },
    white_player_id: "player11-id",
    black_player_id: "friend-3-id",
    completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Get player from dummy data
  const player = dummyPlayers[id] || dummyPlayers["friend-1-id"];

  // Filter games for this player
  const recentGames = dummyGames.filter(
    (game) => game.white_player_id === id || game.black_player_id === id
  );

  // Mock current user
  const currentUserId = "current-user-id";
  const currentUserProfile = dummyPlayers["current-user-id"];

  return (
    <PlayerProfileClient
      currentUserId={currentUserId}
      currentUserProfile={currentUserProfile}
      player={player}
      recentGames={recentGames}
    />
  );
}
