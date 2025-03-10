import { useState, useEffect } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { BiTimer } from "react-icons/bi";

interface NumberGridProps {
  isHost: boolean;
  onStartGame?: () => void;
}

const NumberGrid: React.FC<NumberGridProps> = ({ isHost, onStartGame }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  const shuffleNumbers = (): number[] => {
    const nums = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  };

  const startGame = () => {
    setNumbers(shuffleNumbers());
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setSelectedNumbers([]);
    setScore(0);
    setGameStarted(true);
    setTimer(0);
    setGameCompleted(false);
    if (onStartGame) {
      onStartGame();
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (gameStarted && !gameCompleted) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [gameStarted, gameCompleted]);

  const handleNumberClick = (number: number) => {
    if (!gameStarted || gameCompleted) return;

    if (number === targetNumber) {
      setScore((prev) => prev + 1);
      setSelectedNumbers((prev) => [...prev, number]);
      if (score + 1 >= 10) {
        setGameCompleted(true);
      } else {
        setTargetNumber(Math.floor(Math.random() * 100) + 1);
      }
    } else {
      setScore((prev) => Math.max(0, prev - 1));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Number Finding Game
          </h1>
          {isHost ? (
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCcw className="w-5 h-5" />
              {gameStarted ? "Restart" : "Start Game"}
            </button>
          ) : (
            <div className="text-blue-600 font-semibold">
              Waiting for host to start game
            </div>
          )}
        </div>

        {gameStarted && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <BiTimer className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{formatTime(timer)}</span>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="font-medium">Score: {score}</span>
              </div>
            </div>
            {!gameCompleted && (
              <div className="text-lg font-semibold text-blue-600">
                Find number: {targetNumber}
              </div>
            )}
          </div>
        )}

        {gameCompleted && (
          <div className="text-center mb-6 bg-green-100 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700">
              Congratulations!
            </h2>
            <p className="text-green-600">
              You completed the game in {formatTime(timer)}!
            </p>
          </div>
        )}

        <div className="grid grid-cols-10 gap-2">
          {numbers.map((number, index) => (
            <button
              key={index}
              onClick={() => handleNumberClick(number)}
              disabled={selectedNumbers.includes(number) || !gameStarted}
              className={`
                aspect-square flex items-center justify-center text-lg font-medium rounded-lg
                transition-all duration-200 
                ${
                  selectedNumbers.includes(number)
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : gameStarted
                    ? "bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-800"
                    : "bg-gray-100 cursor-not-allowed text-gray-400"
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
