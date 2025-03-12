/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/JoinPage/JoinPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinGame from "../JoinGame/JoinGame";
import JoinRoom from "../JoinRoom/JoinRoom";
import Leaderboard from "../LeaderBoard/LeaderBoard";
import { JoinRoomResponse, Player } from "../../types/game";
import { socket } from "../../services/socket";

interface JoinPageProps {
  leaderboard: Player[];
  setCurrentRoomId: (roomId: string) => void;
  setCurrentPlayer: (player: Player) => void;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const JoinPage: React.FC<JoinPageProps> = ({
  leaderboard,
  setCurrentRoomId,
  setCurrentPlayer,
}) => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  const handleNameSubmit = async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/player`, {
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
      localStorage.setItem("currentPlayer", JSON.stringify(data));
    } catch (error) {
      console.error("Error creating player:", error);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!player) return;
    localStorage.setItem("currentRoomId", roomId);
    setCurrentRoomId(roomId);
    socket.emit(
      "joinRoom",
      { roomId, playerId: player.id },
      (response: JoinRoomResponse) => {
        if (response.success && response.player) {
          setCurrentPlayer(response.player);
          localStorage.setItem(
            "currentPlayer",
            JSON.stringify(response.player)
          );
          navigate("/game");
        } else {
          alert(response.error || "Join room failed");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {!player ? (
        <JoinGame onJoin={handleNameSubmit} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Welcome, {player.name}</h2>
          <JoinRoom onJoin={handleJoinRoom} player={player} />
        </div>
      )}
      <Leaderboard players={leaderboard} />
    </div>
  );
};

export default JoinPage;
