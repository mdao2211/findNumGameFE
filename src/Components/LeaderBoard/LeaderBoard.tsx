// src/components/Leaderboard.tsx
import React from "react";
import { Trophy } from "lucide-react";
import { Player } from "../../types/game";

interface LeaderboardProps {
  players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  // Sắp xếp giảm dần theo điểm
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Leaderboard
      </h2>
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
              className={`flex justify-between items-center p-2 bg-gray-50 rounded ${borderClass}`}
            >
              <span>{player.name}</span>
              <span className="font-semibold">{player.score || 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
