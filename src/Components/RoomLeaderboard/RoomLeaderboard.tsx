// src/Components/RoomLeaderboard/RoomLeaderboard.tsx
import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Player } from "../../types/game";

interface RoomLeaderboardProps {
  roomId: string;
}

const RoomLeaderboard: React.FC<RoomLeaderboardProps> = ({ roomId }) => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`http://localhost:5001/room/${roomId}/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data: Player[] = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, [roomId]);

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Room Leaderboard
      </h2>
      <div className="space-y-2">
        {sortedPlayers.map((player) => (
          <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>{player.name}</span>
            <span className="font-semibold">{player.score || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomLeaderboard;
