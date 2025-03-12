// src/Components/GamePage/GamePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameRoom from "../GameRoom/GameRoom";
import NumberGrid from "../NumberGrid/NumberGrid";
import RoomLeaderboard from "../RoomLeaderboard/RoomLeaderboard";
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
  currentRoomId,
  currentPlayer,
}) => {
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  // Khi currentRoomId thay đổi, gọi API lấy thông tin room hiện tại
  useEffect(() => {
    if (!currentRoomId) return;
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch("http://localhost:8080/room");
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
    socket.emit("leaveRoom", {
      roomId: currentRoomId,
      playerId: currentPlayer.id,
    });
    navigate("/");
  };

  // Nếu chưa có thông tin về phòng hoặc người chơi, hiển thị Loading...
  if (!currentRoomId || !currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-8 p-4 lg:p-8 min-h-screen bg-gray-100">
      {/* Khối GameRoom và NumberGrid */}
      <div className="space-y-6 w-full lg:w-7/10 bg-white p-4 lg:p-8 rounded-3xl shadow-2xl">
        <GameRoom
          timeRemaining={timeRemaining}
          playersCount={roomDetails ? roomDetails.playersCount : players.length}
          isGameStarted={isGameStarted}
          isHost={currentPlayer.isHost ?? false}
          onLeaveRoom={handleLeaveRoom}
        />
        <NumberGrid
          isHost={currentPlayer.isHost ?? false}
          roomId={currentRoomId}
          playerId={currentPlayer.id}
          onStartGame={() => {
            socket.emit("game:start", { roomId: currentRoomId });
          }}
        />
      </div>

      {/* Khối Leaderboard */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white p-6 rounded-3xl shadow-2xl h-full">
          <RoomLeaderboard roomId={currentRoomId} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
