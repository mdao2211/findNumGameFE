// src/hooks/useLeaderboard.ts
import { useState, useEffect } from "react";
import { Player } from "../types/game";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/player/top-5-players`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data: Player[] = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return { leaderboard, fetchLeaderboard };
};

export default useLeaderboard;
