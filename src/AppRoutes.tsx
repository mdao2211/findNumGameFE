// src/AppRoutes.tsx
import React, { useEffect, useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./services/socket";
import { useGameStore } from "./store/gameStore";
import JoinPage from "./Components/JoinPage/JoinPage";
import GamePage from "./Components/GamePage/GamePage";
import useLeaderboard from "./hooks/useLeaderboard";
import { Player, JoinRoomResponse } from "./types/game";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AppRoutes: React.FC = () => {
  const { leaderboard, fetchLeaderboard } = useLeaderboard();
  const {
    players,
    isGameStarted,
    winner,
    timeRemaining,
    addPlayer,
    removePlayer,
    updatePlayerScore,
    setTargetNumber, // thay setCurrentNumber thành setTargetNumber
    endGame,
    setTimeRemaining,
  } = useGameStore();

  // State lưu room và currentPlayer
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const currentPlayerRef = useRef<Player | null>(currentPlayer);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  // Lấy thông tin từ localStorage khi ứng dụng khởi động
  useEffect(() => {
    const storedRoomId = localStorage.getItem("currentRoomId");
    const storedPlayer = localStorage.getItem("currentPlayer");
    if (storedRoomId) {
      setCurrentRoomId(storedRoomId);
    }
    if (storedPlayer) {
      setCurrentPlayer(JSON.parse(storedPlayer));
    }
  }, []);

  // Rejoin room khi socket kết nối lại
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected/reconnected");
      const storedRoomId = localStorage.getItem("currentRoomId");
      const storedPlayer = localStorage.getItem("currentPlayer");
      if (storedRoomId && storedPlayer) {
        const player = JSON.parse(storedPlayer);
        // Truyền luôn isHost từ storedPlayer
        socket.emit(
          "joinRoom",
          { roomId: storedRoomId, playerId: player.id, isHost: player.isHost },
          (response: JoinRoomResponse) => {
            console.log(response);
            if (response.success && response.player) {
              setCurrentPlayer(response.player);
              localStorage.setItem(
                "currentPlayer",
                JSON.stringify(response.player)
              );
            }
          }
        );
      }
    });
    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("room:playerJoined", (joinedPlayer: Player) => {
      setCurrentPlayer((prev) => {
        if (!prev || joinedPlayer.id === prev.id) {
          return joinedPlayer;
        }
        return prev;
      });
      addPlayer(joinedPlayer);
    });

    socket.on("player:leave", (playerId: string) => {
      removePlayer(playerId);
    });

    socket.on("game:number", (number: number) => {
      setTargetNumber(number);
    });

    socket.on(
      "game:updateScore",
      ({ playerId, score }: { playerId: string; score: number }) => {
        updatePlayerScore(playerId, score);
      }
    );

    socket.on("game:end", (winner: Player) => {
      endGame(winner);
      fetchLeaderboard();
    });

    socket.on("game:timeUpdate", (time: number) => {
      setTimeRemaining(time);
    });

    // Lắng nghe sự kiện cập nhật số lượng người chơi từ BE
    socket.on("room:playerCountUpdated", (data: { playersCount: number }) => {
      console.log("Room player count updated:", data.playersCount);
      setRoomDetails((prev) =>
        prev ? { ...prev, playersCount: data.playersCount } : prev
      );
    });

    return () => {
      socket.off("connect");
      socket.off("room:playerJoined");
      socket.off("player:leave");
      socket.off("game:number");
      socket.off("game:updateScore");
      socket.off("game:end");
      socket.off("game:timeUpdate");
      socket.off("room:playerCountUpdated");
    };
  }, [
    addPlayer,
    removePlayer,
    setTargetNumber,
    updatePlayerScore,
    endGame,
    setTimeRemaining,
    fetchLeaderboard,
  ]);

  // Nếu dùng state roomDetails, định nghĩa kiểu cho nó
  const [, setRoomDetails] = useState<{
    id: string;
    name: string;
    createdAt: Date;
    status: string;
    playersCount: number;
  } | null>(null);

  // Khi currentRoomId thay đổi, gọi API lấy thông tin room hiện tại
  useEffect(() => {
    if (!currentRoomId) return;
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/room`);
        if (!response.ok) {
          throw new Error("Error fetching room details");
        }
        const data: {
          id: string;
          name: string;
          createdAt: Date;
          status: string;
          playersCount: number;
        }[] = await response.json();
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          <JoinPage
            leaderboard={leaderboard}
            setCurrentRoomId={setCurrentRoomId}
            setCurrentPlayer={setCurrentPlayer}
          />
        }
      />
      <Route
        path="/game"
        element={
          <GamePage
            players={players}
            timeRemaining={timeRemaining}
            isGameStarted={isGameStarted}
            winner={winner}
            currentRoomId={currentRoomId}
            currentPlayer={currentPlayer}
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
