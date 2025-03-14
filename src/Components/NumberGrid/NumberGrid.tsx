import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Player, GameState } from "../../types/game";
import { socket } from "../../services/socket";

interface NumberGridProps {
  isHost: boolean;
  roomId: string;
  playerId: string;
}

const NumberGrid: React.FC<NumberGridProps> = ({
  isHost,
  roomId,
  playerId,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: null,
    score: 0,
    timer: 180,
    isStarted: false,
    isCompleted: false,
  });

  const [numbers, setNumbers] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
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
      console.log("game:start response", response);
    });
    console.log("Sending game:start event", { roomId, playerId, isHost });
  };

  const handleNumberClick = (number: number) => {
    if (
      !gameState.isStarted ||
      gameState.isCompleted ||
      !gameState.targetNumber
    )
      return;

    if (number === gameState.targetNumber) {
      setGameState((prev) => ({ ...prev, score: prev.score + 10 }));
      setSelectedNumbers((prev) => [...prev, number]);
      socket.emit("player:correctGuess", {
        roomId,
        playerId,
        points: 10,
        guessedNumber: number,
        targetNumber: gameState.targetNumber,
      });
    } else {
      setGameState((prev) => ({ ...prev, score: Math.max(0, prev.score - 5) }));
      setIncorrectNumbers((prev) => [...prev, number]);
      socket.emit("player:wrongGuess", {
        roomId,
        playerId,
        points: -5,
        guessedNumber: number,
        targetNumber: gameState.targetNumber,
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // Log khi component mount để debug
    console.log("Component mounted with props:", { isHost, roomId, playerId });

    // Lắng nghe sự kiện game bắt đầu từ server
    socket.on("game:started", (data) => {
      console.log("Received game:started event", data);
      const { targetNumber } = data;

      setGameState({
        targetNumber,
        score: 0,
        timer: 180,
        isStarted: true,
        isCompleted: false,
      });
      setNumbers(shuffleNumbers());
      setSelectedNumbers([]);
      setIncorrectNumbers([]);
    });

    socket.on("game:timeUpdate", (time: number) => {
      setGameState((prev) => ({
        ...prev,
        timer: time,
        isCompleted: time <= 0,
      }));
    });

    socket.on("game:end", () => {
      setGameState((prev) => ({ ...prev, isCompleted: true }));
    });

    socket.on("score:updated", (updatedPlayer: Player) => {
      if (updatedPlayer.id === playerId) {
        setGameState((prev) => ({ ...prev, score: updatedPlayer.score ?? 0 }));
      }
    });

    socket.on("game:targetUpdate", (newTarget: number) => {
      console.log("Received new target number:", newTarget);
      setGameState((prev) => ({ ...prev, targetNumber: newTarget }));
    });

    // Thêm error handler cho socket
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("game:started");
      socket.off("game:timeUpdate");
      socket.off("game:end");
      socket.off("score:updated");
      socket.off("game:targetUpdate");
      socket.off("connect_error");
      socket.off("error");
    };
  }, [isHost, playerId, roomId]);

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
          {isHost ? (
            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={gameState.isStarted && !gameState.isCompleted}>
              <RefreshCcw className="w-5 h-5" />
              {gameState.isStarted ? "Restart Game" : "Start Game"}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              Waiting for host to start the game...
            </div>
          )}
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
              disabled={
                selectedNumbers.includes(number) ||
                incorrectNumbers.includes(number) ||
                !gameState.isStarted ||
                gameState.isCompleted
              }
              className={`
                aspect-square flex items-center justify-center text-lg font-semibold rounded-xl
                transition-all duration-200 
                ${
                  selectedNumbers.includes(number)
                    ? "bg-green-500/10 text-green-600 ring-2 ring-green-500 cursor-not-allowed"
                    : incorrectNumbers.includes(number)
                    ? "bg-red-500/10 text-red-600 ring-2 ring-red-500 cursor-not-allowed"
                    : "bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-gray-800 hover:scale-[1.03]"
                }
              `}>
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;
