// src/AppRoutes.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "./services/socket";
import { useGameStore } from "./store/gameStore";
import JoinPage from "./Components/JoinPage/JoinPage";
import GamePage from "./Components/GamePage/GamePage";
import useLeaderboard from "./hooks/useLeaderboard";
import { Player } from "./types/game";

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
    setCurrentNumber,
    endGame,
    setTimeRemaining,
  } = useGameStore();

  // State lưu room hiện tại và thông tin người chơi hiện tại
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("room:playerJoined", (joinedPlayer: Player) => {
      // Nếu người join trùng với currentPlayer, cập nhật thuộc tính isHost
      if (currentPlayer && joinedPlayer.id === currentPlayer.id) {
        setCurrentPlayer({ ...currentPlayer, isHost: joinedPlayer.isHost });
      }
      addPlayer(joinedPlayer);
    });

    socket.on("player:leave", (playerId: string) => {
      removePlayer(playerId);
    });

    socket.on("game:number", (number: number) => {
      setCurrentNumber(number);
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

    return () => {
      socket.off("connect");
      socket.off("room:playerJoined");
      socket.off("player:leave");
      socket.off("game:number");
      socket.off("game:updateScore");
      socket.off("game:end");
      socket.off("game:timeUpdate");
    };
  }, [
    addPlayer,
    removePlayer,
    setCurrentNumber,
    updatePlayerScore,
    endGame,
    setTimeRemaining,
    fetchLeaderboard,
    currentPlayer,
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
