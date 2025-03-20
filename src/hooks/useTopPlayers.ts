// src/hooks/useTopPlayers.ts
import { useState, useEffect, useCallback } from "react";
import { Player } from "../types/game";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useTopPlayers = (roomId: string) => {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/room/${roomId}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data: Player[] = await response.json();
      // Sắp xếp theo điểm giảm dần và lấy top 5
      const sortedPlayers = data.sort((a, b) => (b.score || 0) - (a.score || 0));
      setTopPlayers(sortedPlayers.slice(0, 5));
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchTopPlayers();
    }
  }, [roomId, fetchTopPlayers]);

  return { topPlayers, loading, error, refetch: fetchTopPlayers };
};

export default useTopPlayers;
