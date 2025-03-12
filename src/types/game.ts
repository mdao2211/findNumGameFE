export interface Player {
  id: string;
  name: string;
  score?: number;
  isReady?: boolean;
  isHost?: boolean;
}

export interface GameState {
  players: Player[];
  currentNumber: number | null;
  isGameStarted: boolean;
  winner: Player | null;
  timeRemaining: number;
}
export interface JoinRoomResponse {
  success: boolean;
  player?: Player;
  error?: string;
}
