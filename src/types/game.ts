export interface Player {
  id: string;
  name: string;
  score?: number;
  isReady?: boolean;
  isHost?: boolean;
}

export interface GameState {
  targetNumber: number | null;
  score: number;
  timer: number;
  isStarted: boolean;
  isCompleted: boolean;
}
export interface JoinRoomResponse {
  success: boolean;
  player?: Player;
  error?: string;
}
