import React, { useEffect, useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./services/socket";
import { useGameStore } from "./store/gameStore";
import JoinPage from "./Components/JoinPage/JoinPage";
import GamePage from "./Components/GamePage/GamePage";
import useLeaderboard from "./hooks/useLeaderboard";
import { Player, JoinRoomResponse } from "./types/game";

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
    endGame,
    setTimeRemaining,
  } = useGameStore();

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const currentPlayerRef = useRef<Player | null>(currentPlayer);

  useEffect(() => {  
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

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

  // Khi kết nối lại, dùng dữ liệu đã lưu trong localStorage để rejoin room
  useEffect(() => {      
    socket.on("connect", () => { 
      const storedRoomId = localStorage.getItem("currentRoomId");
      const storedPlayer = localStorage.getItem("currentPlayer");
      if (storedRoomId && storedPlayer) {
        const player = JSON.parse(storedPlayer);
        socket.emit(
          "joinRoom",
          { roomId: storedRoomId, playerId: player.id, isHost: player.isHost },
          (response: JoinRoomResponse) => {
            if (response.success && response.player) {
              // Cập nhật state currentPlayer nếu nhận được dữ liệu của người chơi đã lưu
              setCurrentPlayer(response.player);
              // Không ghi đè localStorage, chỉ lưu dữ liệu ban đầu
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
      // console.log("Connected to server");
    });

    socket.on("room:playerJoined", (joinedPlayer: Player) => {
      // Chỉ cập nhật state currentPlayer nếu ID khớp với người chơi của bạn
      setCurrentPlayer((prev) => {
        if (prev && joinedPlayer.id === prev.id) {
          return joinedPlayer;
        }
        return prev;
      });
      addPlayer(joinedPlayer);
    });

    socket.on("player:leave", (playerId: string) => {
      removePlayer(playerId);
    });

    socket.on("game:end", (winner: Player) => {
      endGame(winner);
      fetchLeaderboard();
    });

    return () => {
      socket.off("connect");
      socket.off("room:playerJoined");
      socket.off("player:leave");
      socket.off("game:end");
      socket.off("room:playerCountUpdated");
    };
  }, [
    addPlayer,
    removePlayer,
    updatePlayerScore,
    endGame,
    setTimeRemaining,
    fetchLeaderboard,
  ]);

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
