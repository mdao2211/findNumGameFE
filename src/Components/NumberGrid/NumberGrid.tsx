import { useState, useEffect } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { BiTimer } from "react-icons/bi";
import { socket } from "../../services/socket";
import { Player } from "../../types/game";
import Loader from '../Loader/Loader';

interface NumberGridProps {
  isHost: boolean;
  roomId: string;
  playerId: string;
}

const NumberGrid: React.FC<NumberGridProps> = ({ isHost, roomId, playerId }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [incorrectNumbers, setIncorrectNumbers] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(180);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  const MAX_TIME = 180;

  const shuffleNumbers = (): number[] => {
    const nums = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  };

  // Nếu cần, hàm lấy số mục tiêu cục bộ từ danh sách (trường hợp chưa có sự đồng bộ từ server)
  const getRandomTargetNumber = (): number | null => {
    const availableNumbers = numbers.filter(
      (num) => !selectedNumbers.includes(num) && !incorrectNumbers.includes(num)
    );
    if (availableNumbers.length === 0) return null;
    return availableNumbers[
      Math.floor(Math.random() * availableNumbers.length)
    ];
  };

  const handleStartGame = () => {
    if (!isHost) return;
    // Host sẽ gửi event "game:start" lên server để khởi tạo game
    socket.emit("game:start", { roomId, playerId });
  };

  const handleNumberClick = (number: number) => {
    if (!gameStarted || gameCompleted) return;

    if (number === targetNumber) {
      setScore((prev) => prev + 10);
      setSelectedNumbers((prev) => [...prev, number]);
      socket.emit("player:correctGuess", { roomId, playerId, points: 10 });
      // Cập nhật targetNumber cục bộ (nếu chưa có sự đồng bộ riêng cho lưới)
      const newTarget = getRandomTargetNumber();
      setTargetNumber(newTarget);
    } else {
      setScore((prev) => Math.max(0, prev - 5));
      setIncorrectNumbers((prev) => [...prev, number]);
      socket.emit("player:wrongGuess", { roomId, playerId, points: -5 });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // Lắng nghe sự kiện game từ server
    socket.on("game:number", (number: number) => {
      // Khi nhận được số mục tiêu từ server, khởi tạo trạng thái game chung
      setGameStarted(true);
      setTargetNumber(number);
      setNumbers(shuffleNumbers());
      setSelectedNumbers([]);
      setIncorrectNumbers([]);
      setScore(0);
      setGameCompleted(false);
      setTimer(MAX_TIME);
    });

    socket.on("game:timeUpdate", (time: number) => {
      setTimer(time);
      if (time <= 0) {
        setGameCompleted(true);
      }
    });

    socket.on("game:end", (winner: Player) => {
      setGameCompleted(true);
      // Bạn có thể thông báo thêm thông tin về người chiến thắng nếu cần
    });

    socket.on("score:updated", (updatedPlayer: Player) => {
      if (updatedPlayer.id === playerId) {
        setScore(updatedPlayer.score ?? 0);
      }
    });

    return () => {
      socket.off("game:number");
      socket.off("game:timeUpdate");
      socket.off("game:end");
      socket.off("score:updated");
    };
  }, [playerId]);

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
          {isHost ? (
            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={gameStarted && !gameCompleted}
            >
              <FiRefreshCcw className="w-5 h-5" />
              {gameStarted ? "Restart Game" : "Start Game"}
            </button>
          ) : (
            <div className="text-gray-700 font-medium">
              Waiting for host to start the game...
              <Loader />
            </div>
          )}
        </div>

        {gameStarted && (
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl">
                <BiTimer className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-700 text-lg">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-xl">
                <span className="font-medium text-gray-700 text-lg">
                  Score: <span className="text-blue-600">{score}</span>
                </span>
              </div>
            </div>
            {!gameCompleted && (
              <div className="text-lg font-semibold bg-blue-100 px-6 py-2 rounded-full text-blue-800 flex items-center gap-2">
                <span className="text-xl">🔎</span>
                Find number:
                <span className="text-2xl ml-2 font-bold text-blue-600">
                  {targetNumber}
                </span>
              </div>
            )}
          </div>
        )}

        {gameCompleted && (
          <div className="text-center mb-6 bg-red-100 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-3xl font-bold text-red-800 mb-2 flex items-center justify-center gap-2">
              ⏳ Time's Up!
            </h2>
            <p className="text-red-700 text-lg">
              Your final score: <span className="font-bold">{score}</span>
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
                !gameStarted ||
                gameCompleted
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
              `}
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
