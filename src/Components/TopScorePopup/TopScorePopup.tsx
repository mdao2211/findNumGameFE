// TopScorePopup.tsx
import React, { useEffect } from "react";
import useTopPlayers from "../../hooks/useTopPlayers";
import { Player } from "../../types/game";

interface TopScorePopupProps {
  roomId: string;
  onClose: () => void;
}

const TopScorePopup: React.FC<TopScorePopupProps> = ({ roomId, onClose }) => {
  const { topPlayers, loading, error } = useTopPlayers(roomId);

  // Tự động đóng popup sau 5 giây khi dữ liệu đã load xong
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        onClose();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [loading, onClose]);

  const getRankBackground = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-yellow-100"; // Top 1
      case 1:
        return "bg-gray-100"; // Top 2
      case 2:
        return "bg-orange-100"; // Top 3
      default:
        return "bg-white";
    }
  };

  const getRankTextClass = (index: number): string => {
    switch (index) {
      case 0:
        return "text-yellow-600";
      case 1:
        return "text-gray-600";
      case 2:
        return "text-orange-600";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}  // Đóng popup khi click vào overlay
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      {/* Popup card */}
      <div
        className="w-full max-w-4xl bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-lg rounded-md p-6 mx-auto relative z-10 overflow-auto"
        onClick={(e) => e.stopPropagation()} // Ngăn click vào card không đóng popup
      >
        <h2 className="text-4xl font-bold mb-6 text-center">
          Top Players This Game
        </h2>
        {loading && <p className="text-center">Loading...</p>}
        {error && (
          <p className="text-center text-red-600">Error: {error}</p>
        )}
        {!loading && !error && topPlayers.length > 0 && (
          <ul>
            {topPlayers.map((player: Player, index: number) => (
              <li
                key={player.id}
                className={`flex items-center justify-between py-3 px-4 ${getRankBackground(
                  index
                )} w-full mb-2`}
              >
                <div className="flex items-center">
                  <span
                    className={`text-xl font-bold mr-4 ${getRankTextClass(
                      index
                    )}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-lg font-medium text-gray-800">
                    {player.name}
                  </span>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  {player.score} Points
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TopScorePopup;
