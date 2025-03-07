// src/Components/GameRoom/GameRoom.tsx
import React from "react";
import { Users } from "lucide-react";

interface GameRoomProps {
  onStartGame: () => void;
  onGuess: (guess: number) => void;
  timeRemaining: number;
  playersCount: number;
  isGameStarted: boolean;
}

const GameRoom: React.FC<GameRoomProps> = ({ playersCount, onStartGame }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <span className="font-semibold">Players: {playersCount}</span>
        </div>
        {/* Nếu là host hoặc số người đủ, có thể hiển thị nút start game */}
        <button
          onClick={onStartGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameRoom;
