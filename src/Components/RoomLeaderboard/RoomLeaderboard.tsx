/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/RoomLeaderboard/RoomLeaderboard.tsx
import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Player } from "../../types/game";

interface RoomLeaderboardProps {
  roomId: string;
}

const RoomLeaderboard: React.FC<RoomLeaderboardProps> = ({ roomId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5001/room/${roomId}/leaderboard`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data: Player[] = await response.json();
      setPlayers(data);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchLeaderboard();
      // Nếu bạn muốn tự động refresh leaderboard mỗi 30 giây, uncomment đoạn sau:
      // const interval = setInterval(fetchLeaderboard, 30000);
      // return () => clearInterval(interval);
    }
  }, [roomId]);

  const sortedPlayers = [...players].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Room Leaderboard
      </h2>
      {loading && <p className="text-gray-600">Loading leaderboard...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && (
        <div className="space-y-2">
          {sortedPlayers.length === 0 ? (
            <p className="text-gray-600">No players in leaderboard.</p>
          ) : (
            sortedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{player.name}</span>
                <span className="font-semibold">{player.score || 0}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoomLeaderboard;
