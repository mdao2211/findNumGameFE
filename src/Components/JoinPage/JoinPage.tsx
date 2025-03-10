// src/Components/JoinPage/JoinPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinGame from "../JoinGame/JoinGame";
import JoinRoom from "../JoinRoom/JoinRoom";
import Leaderboard from "../LeaderBoard/LeaderBoard";
import { Player } from "../../types/game";
import { socket } from "../../services/socket";

interface JoinPageProps {
  leaderboard: Player[];
  setCurrentRoomId: (roomId: string) => void;
  setCurrentPlayer: (player: Player) => void;
}

const JoinPage: React.FC<JoinPageProps> = ({
  leaderboard,
  setCurrentRoomId,
  setCurrentPlayer,
}) => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  const handleNameSubmit = async (name: string) => {
    try {
      const response = await fetch("http://localhost:5001/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to create player");
      }
      const data: Player = await response.json();
      setPlayer(data);
      setCurrentPlayer(data);
    } catch (error) {
      console.error("Error creating player:", error);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!player) return;
    setCurrentRoomId(roomId);
    // Gửi payload chứa roomId và playerId
    socket.emit("joinRoom", { roomId, playerId: player.id });
    navigate("/game");
  };

  return (
    <div className="space-y-6">
      {!player ? (
        <JoinGame onJoin={handleNameSubmit} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {player.name}
          </h2>
          <JoinRoom onJoin={handleJoinRoom} player={player} />
        </div>
      )}
      <Leaderboard players={leaderboard} />
    </div>
  );
};

export default JoinPage;
