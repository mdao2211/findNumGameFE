// src/Components/JoinGame/JoinGame.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";

interface JoinGameProps {
  onJoin: (name: string) => void;
}

const JoinGame: React.FC<JoinGameProps> = ({ onJoin }) => {
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (playerName.trim()) {
      onJoin(playerName);
    } else {
      toast.error("Vui lòng nhập tên của bạn!");
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Find the Number Game
      </h1>
      <div className="flex gap-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleJoin}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
