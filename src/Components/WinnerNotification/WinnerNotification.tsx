// src/components/WinnerNotification.tsx
import React from "react";
import { Player } from "../../types/game";

interface WinnerNotificationProps {
  winner: Player | null;
}

const WinnerNotification: React.FC<WinnerNotificationProps> = ({ winner }) => {
  if (!winner) return null;
  return (
    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-yellow-800">
        🎉 {winner.name} wins! 🎉
      </h2>
    </div>
  );
};

export default WinnerNotification;
