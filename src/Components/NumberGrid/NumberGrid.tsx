// NumberGrid.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCcw } from "lucide-react";
import { Player, GameState } from "../../types/game";
import { socket } from "../../services/socket";
import backgroundMusic from "../../assets/videoplayback.mp3"; // file MP3
import NumberButton from "../NumberButton/NumberButton";
import WinnerNotification from "../WinnerNotification/WinnerNotification";

interface NumberGridProps {
  isHost: boolean;
  roomId: string;
  playerId: string;
  playerCount: number;
  onGameComplete?: () => void;
}

// Hàm tạo số ngẫu nhiên có seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const NumberGrid: React.FC<NumberGridProps> = ({
  isHost,
  roomId,
  playerId,
  playerCount,
  onGameComplete,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: null,
    score: 0,
    timer: 180,
    isStarted: false,
    isCompleted: false,
  });
  const [numbers, setNumbers] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<Record<number, string>>({});
  const [incorrectNumbers, setIncorrectNumbers] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hàm xáo trộn sử dụng seed
  const shuffleNumbers = useCallback((seed: number = 1): number[] => {
    const nums = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      // Tính toán số ngẫu nhiên dựa trên seed cộng với chỉ số
      const randomValue = seededRandom(seed + i);
      const j = Math.floor(randomValue * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }, []);

  const handleStartGame = useCallback(() => {
    if (!isHost) return;
    socket.emit("game:start", { roomId, playerId }, (response: unknown) => {
      // Có thể xử lý phản hồi từ server nếu cần
    });
  }, [isHost, roomId, playerId]);

  const handleRestartGame = useCallback(() => {
    if (!isHost) return;
    socket.emit("game:start", { roomId, playerId }, (response: unknown) => {
      // console.log("game:restart response", response);
    });
  }, [isHost, roomId, playerId]);

  const handleNumberClick = useCallback(
    (number: number) => {
      if (!gameState.isStarted || gameState.isCompleted || gameState.targetNumber === null)
        return;

      if (selectedNumbers[number] !== undefined || incorrectNumbers.includes(number))
        return;

      if (number === gameState.targetNumber) {
        // Đoán đúng: cộng điểm và cập nhật màu
        setGameState((prev) => ({ ...prev, score: prev.score + 10 }));
        let playerColor = localStorage.getItem("playerColor");
        if (!playerColor) {
          playerColor =
            "#" +
            Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0");
          localStorage.setItem("playerColor", playerColor);
        }
        setSelectedNumbers((prev) => ({ ...prev, [number]: playerColor }));
        socket.emit("player:correctGuess", {
          roomId,
          playerId,
          points: 10,
          guessedNumber: number,
          targetNumber: gameState.targetNumber,
          color: playerColor,
        });
      } else {
        // Đoán sai: trừ điểm và hiển thị màu đỏ tạm thời
        setGameState((prev) => ({
          ...prev,
          score: Math.max(0, prev.score - 5),
        }));
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
        }, 3000);
      }
    },
    [gameState, selectedNumbers, incorrectNumbers, roomId, playerId]
  );

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Đăng ký các sự kiện của socket
  useEffect(() => {
    const handleGameStarted = (data: any) => {
      // Giả sử server gửi seed trong data
      const { targetNumber, timeRemaining, seed } = data;
      setGameState({
        targetNumber,
        score: 0,
        timer: timeRemaining,
        isStarted: true,
        isCompleted: false,
      });
      // Xáo trộn số dựa vào seed chung từ server
      setNumbers(shuffleNumbers(seed));
      setSelectedNumbers({});
      setIncorrectNumbers([]);
    };

    const handleTargetUpdate = (newTarget: number) => {
      setGameState((prev) => ({ ...prev, targetNumber: newTarget }));
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
  }, [playerId, shuffleNumbers]);

  useEffect(() => {
    const handleNumberCorrect = (data: {
      guessedNumber: number;
      playerId: string;
      color: string;
    }) => {
      setSelectedNumbers((prev) => {
        if (prev[data.guessedNumber] === undefined) {
          return { ...prev, [data.guessedNumber]: data.color };
        }
        return prev;
      });
    };
  
    socket.on("game:numberCorrect", handleNumberCorrect);
    return () => {
      socket.off("game:numberCorrect", handleNumberCorrect);
    };
  }, []);
  
  // Nếu sử dụng đếm ngược cục bộ, có thể bỏ qua effect từ socket
  useEffect(() => {
    let interval: number;
    if (gameState.isStarted && !gameState.isCompleted) {
      interval = window.setInterval(() => {
        setGameState((prev) => {
          if (prev.timer > 1) {
            return {
              ...prev,
              timer: prev.timer - 1,
              isCompleted: false,
            };
          } else {
            if (onGameComplete) {
              setTimeout(() => onGameComplete(), 0);
            }
            clearInterval(interval);
            return { ...prev, timer: 0, isCompleted: true };
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isStarted, gameState.isCompleted, onGameComplete]);

  // Tự động phát nhạc nền khi game bắt đầu
  useEffect(() => {
    if (gameState.isStarted) {
      if (!audioRef.current) {
        audioRef.current = new Audio(backgroundMusic);
        audioRef.current.loop = true;
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.log("Auto-play prevented:", err));
      }
      return () => {
        audioRef.current?.pause();
      };
    }
  }, [gameState.isStarted]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Number Finding Game
          </h1>
          <h3 className="font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            You have 3 minutes to get the highest score by finding correct numbers.
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
                  Waiting another player to start game...
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
                  Score: <span className="text-blue-600">{gameState.score}</span>
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
          <WinnerNotification
            score={gameState.score}
            isHost={isHost}
            handleRestartGame={handleRestartGame}
          />
        )}

        <div className="grid grid-cols-10 gap-3">
          {numbers.map((number, index) => {
            const isSelected = selectedNumbers[number] !== undefined;
            const selectedColor = selectedNumbers[number] || "";
            const isIncorrect = incorrectNumbers.includes(number);
            return (
              <button
                key={index}
                onClick={() => handleNumberClick(number)}
                disabled={
                  !gameState.isStarted ||
                  gameState.isCompleted ||
                  isSelected ||
                  isIncorrect
                }
                title={isSelected ? "This number is already selected" : ""}
                style={
                  isSelected
                    ? {
                        backgroundColor: selectedColor,
                        color: "#fff",
                        cursor: "not-allowed",
                      }
                    : {}
                }
                className={`
                  aspect-square flex items-center justify-center text-lg font-semibold rounded-xl transition-all duration-200
                  ${
                    !isSelected && isIncorrect
                      ? "bg-red-500/10 text-red-600 ring-2 ring-red-500 cursor-not-allowed"
                      : !isSelected
                      ? "bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-gray-800 hover:scale-[1.03]"
                      : ""
                  }
                `}
              >
                <NumberButton
                  number={number}
                  selected={isSelected}
                  color={selectedColor}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;
