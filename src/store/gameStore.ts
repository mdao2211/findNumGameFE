import { create } from "zustand";
import { GameState, Player } from "../types/game";

interface GameStore extends GameState {
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setCurrentNumber: (number: number | null) => void;
  startGame: () => void;
  endGame: (winner: Player | null) => void;
  setTimeRemaining: (time: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  players: [],
  currentNumber: null,
  isGameStarted: false,
  winner: null,
  timeRemaining: 0,

  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  updatePlayerScore: (playerId, score) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, score } : p
      ),
    })),
  setCurrentNumber: (number) => set({ currentNumber: number }),
  startGame: () => set({ isGameStarted: true, winner: null }),
  endGame: (winner) => set({ isGameStarted: false, winner }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
}));
