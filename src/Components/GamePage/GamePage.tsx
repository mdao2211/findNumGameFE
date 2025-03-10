// src/Components/GamePage/GamePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameRoom from "../GameRoom/GameRoom";
import NumberGrid from "../NumberGrid/NumberGrid";
import WinnerNotification from "../WinnerNotification/WinnerNotification";
import { Player } from "../../types/game";
import { socket } from "../../services/socket";

interface RoomDetails {
  id: string;
  name: string;
  createdAt: Date;
  status: string;
  playersCount: number;
}

interface GamePageProps {
  players: Player[];
  timeRemaining: number;
  isGameStarted: boolean;
  winner: Player | null;
  currentRoomId: string | null;
  currentPlayer: Player | null;
}

const GamePage: React.FC<GamePageProps> = ({
  players,
  timeRemaining,
  isGameStarted,
  winner,
  currentRoomId,
  currentPlayer,
}) => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  // Khi currentRoomId thay đổi, gọi API lấy danh sách phòng và lọc lấy room hiện tại
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!currentRoomId) return;
      try {
        const response = await fetch("http://localhost:5001/room");
        if (!response.ok) {
          throw new Error("Error fetching room details");
        }
        const data: RoomDetails[] = await response.json();
        const currentRoom = data.find((room) => room.id === currentRoomId);
        if (currentRoom) {
          setRoomDetails(currentRoom);
        }
      } catch (error) {
        console.error("Error fetching room details: ", error);
      }
    };
    fetchRoomDetails();
  }, [currentRoomId]);

  const handleStartGame = () => {
    if (!currentRoomId) return;
    socket.emit("game:start", { roomId: currentRoomId });
  };

  const handleGuess = (guess: number) => {
    if (!currentRoomId) return;
    socket.emit("player:guess", { roomId: currentRoomId, guess });
  };

  const handleLeaveRoom = () => {
    if (!currentRoomId || !currentPlayer) return;
    socket.emit("leaveRoom", { roomId: currentRoomId, playerId: currentPlayer.id });
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <GameRoom
        onStartGame={handleStartGame}
        onGuess={handleGuess}
        timeRemaining={timeRemaining}
        playersCount={roomDetails ? roomDetails.playersCount : players.length}
        isGameStarted={isGameStarted}
        isHost={currentPlayer?.isHost ?? false}
        onLeaveRoom={handleLeaveRoom}
      />
      <NumberGrid />
      <WinnerNotification winner={winner} />
    </div>
  );
};

export default GamePage;
