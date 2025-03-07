// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { socket, socketEvents } from "./services/socket";
import { useGameStore } from "./store/gameStore";
import JoinGame from "./Components/JoinGame/JoinGame";
import JoinRoom from "./Components/JoinRoom/JoinRoom";
import GameRoom from "./Components/GameRoom/GameRoom";
import Leaderboard from "./Components/LeaderBoard/LeaderBoard";
import WinnerNotification from "./Components/WinnerNotification/WinnerNotification";
import NumberGrid from "./Components/NumberGrid/NumberGrid";
import { Player } from "./types/game";
import useLeaderboard from "./hooks/useLeaderboard";

// AppRoutes quản lý các route chính của ứng dụng
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

  // Đăng ký các sự kiện socket (áp dụng cho toàn bộ app)
  useEffect(() => {
    socket.on(socketEvents.connect, () => {
      console.log("Connected to server");
    });

    socket.on(socketEvents.playerJoin, (player: Player) => {
      addPlayer(player);
    });

    socket.on(socketEvents.playerLeave, (playerId: string) => {
      removePlayer(playerId);
    });

    socket.on(socketEvents.numberGenerated, (number: number) => {
      setCurrentNumber(number);
    });

    socket.on(
      socketEvents.updateScore,
      ({ playerId, score }: { playerId: string; score: number }) => {
        updatePlayerScore(playerId, score);
      }
    );

    socket.on(socketEvents.gameEnd, (winner: Player) => {
      endGame(winner);
      // Sau khi game kết thúc, fetch lại leaderboard từ API
      fetchLeaderboard();
    });

    socket.on(socketEvents.timeUpdate, (time: number) => {
      setTimeRemaining(time);
    });

    return () => {
      socket.off(socketEvents.connect);
      socket.off(socketEvents.playerJoin);
      socket.off(socketEvents.playerLeave);
      socket.off(socketEvents.numberGenerated);
      socket.off(socketEvents.updateScore);
      socket.off(socketEvents.gameEnd);
      socket.off(socketEvents.timeUpdate);
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
      <Route path="/" element={<JoinPage leaderboard={leaderboard} />} />
      <Route
        path="/game"
        element={
          <GamePage
            players={players}
            timeRemaining={timeRemaining}
            isGameStarted={isGameStarted}
            winner={winner}
          />
        }
      />
    </Routes>
  );
};

// Component trang Join: người chơi nhập tên và sau đó chọn phòng
interface JoinPageProps {
  leaderboard: Player[];
}
const JoinPage: React.FC<JoinPageProps> = ({ leaderboard }) => {
  const navigate = useNavigate();
  const [player, setPlayer] = React.useState<Player | null>(null);

  // Khi nhập tên xong, gọi API POST để tạo người chơi
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
    } catch (error) {
      console.error("Error creating player:", error);
    }
  };

  // Khi chọn room, gửi sự kiện joinRoom qua socket với tên người chơi và chuyển sang trang game
  const handleJoinRoom = (roomId: string) => {
    if (!player) return;
    socket.emit("joinRoom", { roomId, playerName: player.name });
    navigate("/game");
  };

  return (
    <div className="space-y-6">
      {!player ? (
        <JoinGame onJoin={handleNameSubmit} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Welcome, {player.name}</h2>
          <JoinRoom onJoin={handleJoinRoom} playerName={player.name} />
        </div>
      )}
      <Leaderboard players={leaderboard} />
    </div>
  );
};

// Component trang Game (hiển thị giao diện game)
interface GamePageProps {
  players: Player[];
  timeRemaining: number;
  isGameStarted: boolean;
  winner: Player | null;
}
const GamePage: React.FC<GamePageProps> = ({
  players,
  timeRemaining,
  isGameStarted,
  winner,
}) => {
  const handleStartGame = () => {
    socket.emit(socketEvents.gameStart);
  };

  const handleGuess = (guess: number) => {
    socket.emit(socketEvents.playerGuess, guess);
  };

  return (
    <div className="space-y-6">
      <GameRoom
        onStartGame={handleStartGame}
        onGuess={handleGuess}
        timeRemaining={timeRemaining}
        playersCount={players.length}
        isGameStarted={isGameStarted}
      />
      <NumberGrid />
      <WinnerNotification winner={winner} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
