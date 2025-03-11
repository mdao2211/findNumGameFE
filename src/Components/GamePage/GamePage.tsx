// src/Components/GamePage/GamePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameRoom from "../GameRoom/GameRoom";
import NumberGrid from "../NumberGrid/NumberGrid";
import { Player } from "../../types/game";
import { socket } from "../../services/socket";
import RoomLeaderboard from "../RoomLeaderboard/RoomLeaderboard";

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

  const handleLeaveRoom = () => {
    if (!currentRoomId || !currentPlayer) return;
    socket.emit("leaveRoom", { roomId: currentRoomId, playerId: currentPlayer.id });
    navigate("/");
  };

  return (
    <div className="flex flex-col max-w-2xs lg:flex-row items-start justify-center gap-8 p-6 lg:p-12 min-h-screen bg-gray-100">
  {/* Game Room and Number Grid */}
  <div className="space-y-6 w-full bg-white p-6 rounded-2xl shadow-lg">
    <GameRoom
      timeRemaining={timeRemaining}
      playersCount={roomDetails ? roomDetails.playersCount : players.length}
      isGameStarted={isGameStarted}
      isHost={currentPlayer?.isHost ?? false}
      onLeaveRoom={handleLeaveRoom}
    />
    <NumberGrid 
      isHost={currentPlayer?.isHost ?? false} 
      roomId={currentRoomId!} 
      playerId={currentPlayer!.id} 
    />
  </div>

  {/* Leaderboard Section */}
  <div className="w-full lg:w-1/3">
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <RoomLeaderboard roomId={currentRoomId!} />
    </div>
  </div>
</div>

  );
};

export default GamePage;
