import React from "react";

interface WinnerNotificationProps {
  score: number;
  isHost: boolean;
  handleRestartGame: () => void;
}

const WinnerNotification: React.FC<WinnerNotificationProps> = ({
  score,
  isHost,
  handleRestartGame,
}) => {
  return (
    <div className="text-center mb-6 bg-red-100 p-6 rounded-xl border-2 border-red-200">
      <h2 className="text-3xl font-bold text-red-800 mb-2 flex items-center justify-center gap-2">
        ⏳ Time's Up!
      </h2>
      <p className="text-red-700 text-lg">
        Your final score: <span className="font-bold">{score}</span>
      </p>
      <div className="mt-4">
        {isHost ? (
          <button
            onClick={handleRestartGame}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Restart Game
          </button>
        ) : (
          <p className="text-gray-700">Waiting for host to restart the game...</p>
        )}
      </div>
    </div>
  );
};

export default WinnerNotification;
