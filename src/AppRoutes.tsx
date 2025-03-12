import React, { useEffect, useState, useRef } from "react";
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
  const currentPlayerRef = useRef<Player | null>(currentPlayer);

  // Cập nhật ref mỗi khi currentPlayer thay đổi
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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("room:playerJoined", (joinedPlayer: Player) => {
      // console.log("room:playerJoined", joinedPlayer);
      setCurrentPlayer((prev) => {
        // Nếu chưa có currentPlayer, hoặc nếu event có cùng id và isHost true, cập nhật.
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
