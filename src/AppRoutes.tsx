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

  // Rejoin room khi socket connect
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
            // console.log(response);
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

    socket.on("score:updated", (updatedPlayer: Player) => {
      updatePlayerScore(updatedPlayer.id, updatedPlayer.score ?? 0);
    });

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
      socket.off("score:updated");
      socket.off("game:end");
      socket.off("game:timeUpdate");
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
