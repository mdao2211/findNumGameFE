/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/RoomLeaderboard/RoomLeaderboard.tsx
import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Player } from "../../types/game";

interface RoomLeaderboardProps {
  roomId: string;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RoomLeaderboard: React.FC<RoomLeaderboardProps> = ({ roomId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/room/${roomId}/leaderboard`
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
          {sortedPlayers.map((player, index) => {
            let borderClass = "";
            // Kiểm tra vị trí của người chơi và áp dụng khung với màu sắc tương ứng
            if (index === 0) {
              borderClass = "bg-yellow-500"; // Vàng
            } else if (index === 1) {
              borderClass = "bg-gray-400"; // Bạc (bạn có thể tùy chỉnh màu)
            } else if (index === 2) {
              borderClass = "bg-orange-500"; // Đồng (bạn có thể tùy chỉnh màu)
            }

            return (
              <div
                key={player.id}
                className={`flex justify-between items-center p-2 bg-gray-50 rounded ${borderClass}`}>
                <span>{player.name}</span>
                <span className="font-semibold">{player.score || 0}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomLeaderboard;
