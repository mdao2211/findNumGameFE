// src/Components/GameRoom/GameRoom.tsx
import React from "react";
import { LogOut, Users } from "lucide-react";

interface GameRoomProps {
  onStartGame: () => void; // Add this line
  timeRemaining: number;
  playersCount: number;
  isGameStarted: boolean;
  isHost: boolean;
  onLeaveRoom: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({
  playersCount,
  // isHost,
  onLeaveRoom,
}) => {
  // console.log("GameRoom - isHost:", isHost);
  return (
    <div className="bg-white rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <span className="font-semibold">Players: {playersCount}</span>
        </div>
        <button
          onClick={onLeaveRoom}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1">
          <LogOut className="w-5 h-5" />
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default GameRoom;
