// src/components/Leaderboard.tsx
import React from "react";
import { Trophy } from "lucide-react";
import { Player } from "../../types/game"; // Đảm bảo type định nghĩa đúng

interface LeaderboardProps {
  players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Leaderboard
      </h2>
      <div className="space-y-2">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>{player.name}</span>
            <span className="font-semibold">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
