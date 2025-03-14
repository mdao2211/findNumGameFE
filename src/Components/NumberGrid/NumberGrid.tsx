import { useState, useEffect, useCallback } from "react";
import { RefreshCcw } from "lucide-react";
import { Player, GameState } from "../../types/game";
import { socket } from "../../services/socket";

interface NumberGridProps {
  isHost: boolean;
  roomId: string;
  playerId: string;
  playerCount: number; // thêm playerCount vào đây
}

const NumberGrid: React.FC<NumberGridProps> = ({
  isHost,
  roomId,
  playerId,
  playerCount,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: null,
    score: 0,
    timer: 180,
    isStarted: false,
    isCompleted: false,
  });
  // Mảng chứa các số được hiển thị (được xáo trộn 1 lần khi game bắt đầu)
  const [numbers, setNumbers] = useState<number[]>([]);
  // Mảng chứa các số được flash đúng (để áp dụng style flash màu xanh tạm thời)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  // Mảng dùng cho flash màu sai (vô hiệu hóa tạm thời nút sai)
  const [incorrectNumbers, setIncorrectNumbers] = useState<number[]>([]);

  const shuffleNumbers = (): number[] => {
    const nums = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  };

  const handleStartGame = () => {
    if (!isHost) return;
    socket.emit("game:start", { roomId, playerId }, (response: unknown) => {
      // console.log("game:start response", response);
    });
    // console.log("Sending game:start event", { roomId, playerId, isHost });
  };

  const handleNumberClick = (number: number) => {
    if (
      !gameState.isStarted ||
      gameState.isCompleted ||
      gameState.targetNumber === null
    )
      return;
    if (number === gameState.targetNumber) {
      // Đoán đúng: cộng điểm và flash màu xanh trong 1 giây, sau đó reset flash
      setGameState((prev) => ({ ...prev, score: prev.score + 10 }));
      setSelectedNumbers((prev) =>
        prev.includes(number) ? prev : [...prev, number]
      );
      socket.emit("player:correctGuess", {
        roomId,
        playerId,
        points: 10,
        guessedNumber: number,
        targetNumber: gameState.targetNumber,
      });
      setTimeout(() => {
        setSelectedNumbers((prev) => prev.filter((n) => n !== number));
      }, 1000);
    } else {
      // Đoán sai: chỉ trừ điểm, flash màu đỏ trong 1 giây, sau đó cho phép chọn lại
      setGameState((prev) => ({ ...prev, score: Math.max(0, prev.score - 5) }));
      setIncorrectNumbers((prev) => [...prev, number]);
      socket.emit("player:wrongGuess", {
        roomId,
        playerId,
        points: -5,
        guessedNumber: number,
        targetNumber: gameState.targetNumber,
      });
      setTimeout(() => {
        setIncorrectNumbers((prev) => prev.filter((n) => n !== number));
      }, 1000);
    }
  };

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Listener cho các sự kiện game (trừ time update)
  useEffect(() => {
    // console.log("Component mounted with props:", { isHost, roomId, playerId });

    const handleGameStarted = (data: any) => {
      // console.log("Received game:started event", data);
      const { targetNumber, timeRemaining } = data;
      setGameState({
        targetNumber,
        score: 0,
        timer: timeRemaining,
        isStarted: true,
        isCompleted: false,
      });
      // Xáo trộn danh sách số chỉ 1 lần khi game bắt đầu
      setNumbers(shuffleNumbers());
      setSelectedNumbers([]);
      setIncorrectNumbers([]);
    };

    const handleTargetUpdate = (newTarget: number) => {
      // Chỉ cập nhật targetNumber, không thêm số cũ vào selectedNumbers nữa
      setGameState((prev) => ({ ...prev, targetNumber: newTarget }));
      // console.log("Received new target number:", newTarget);
    };

    const handleGameEnd = () => {
      setGameState((prev) => ({ ...prev, isCompleted: true }));
    };

    const handleScoreUpdated = (updatedPlayer: Player) => {
      if (updatedPlayer.id === playerId) {
        setGameState((prev) => ({ ...prev, score: updatedPlayer.score ?? 0 }));
      }
    };

    socket.on("game:started", handleGameStarted);
    socket.on("game:targetUpdate", handleTargetUpdate);
    socket.on("game:end", handleGameEnd);
    socket.on("score:updated", handleScoreUpdated);

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("game:started", handleGameStarted);
      socket.off("game:targetUpdate", handleTargetUpdate);
      socket.off("game:end", handleGameEnd);
      socket.off("score:updated", handleScoreUpdated);
      socket.off("connect_error");
      socket.off("error");
    };
  }, [roomId, playerId]);

  // Listener riêng cho time update từ socket
  useEffect(() => {
    const handleTimeUpdate = (time: number) => {
      // console.log("Received time update from socket:", time);
      setGameState((prev) => ({
        ...prev,
        timer: time,
        isCompleted: time <= 0,
      }));
    };

    socket.on("game:timeUpdate", handleTimeUpdate);
    return () => {
      socket.off("game:timeUpdate", handleTimeUpdate);
    };
  }, [roomId]);

  // Manual countdown nếu FE không nhận đủ các event từ socket
  useEffect(() => {
    let interval: number;
    if (gameState.isStarted && !gameState.isCompleted) {
      interval = window.setInterval(() => {
        setGameState((prev) => {
          if (prev.timer > 0) {
            return {
              ...prev,
              timer: prev.timer - 1,
              isCompleted: prev.timer - 1 <= 0,
            };
          }
          return prev;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isStarted, gameState.isCompleted]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Number Finding Game
          </h1>
          <h3 className="font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            You have 3 minutes to get the highest score by finding correct
            numbers.
          </h3>
          <h3 className="font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Please be patient. Waiting for another host to start the game...
          </h3>
          {!gameState.isStarted &&
            (isHost ? (
              playerCount >= 2 ? (
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Start Game
                </button>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  Waiting another host to start game...
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                Waiting for host to start the game...
              </div>
            ))}
        </div>

        {gameState.isStarted && (
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl">
                <span className="w-6 h-6 text-blue-600">⏱️</span>
                <span className="font-medium text-gray-700 text-lg">
                  {formatTime(gameState.timer)}
                </span>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-xl">
                <span className="font-medium text-gray-700 text-lg">
                  Score:{" "}
                  <span className="text-blue-600">{gameState.score}</span>
                </span>
              </div>
            </div>
            {!gameState.isCompleted && gameState.targetNumber && (
              <div className="text-lg font-semibold bg-blue-100 px-6 py-2 rounded-full text-blue-800 flex items-center gap-2">
                <span className="text-xl">🔎</span>
                Find number:
                <span className="text-2xl ml-2 font-bold text-blue-600">
                  {gameState.targetNumber}
                </span>
              </div>
            )}
          </div>
        )}

        {gameState.isCompleted && (
          <div className="text-center mb-6 bg-red-100 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-3xl font-bold text-red-800 mb-2 flex items-center justify-center gap-2">
              ⏳ Time's Up!
            </h2>
            <p className="text-red-700 text-lg">
              Your final score:{" "}
              <span className="font-bold">{gameState.score}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-10 gap-3">
          {numbers.map((number, index) => (
            <button
              key={index}
              onClick={() => handleNumberClick(number)}
              disabled={!gameState.isStarted || gameState.isCompleted}
              className={`
                aspect-square flex items-center justify-center text-lg font-semibold rounded-xl transition-all duration-200 ${
                  selectedNumbers.includes(number)
                    ? "bg-green-500/10 text-green-600 ring-2 ring-green-500"
                    : incorrectNumbers.includes(number)
                    ? "bg-red-500/10 text-red-600 ring-2 ring-red-500"
                    : "bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-gray-800 hover:scale-[1.03]"
                }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;
