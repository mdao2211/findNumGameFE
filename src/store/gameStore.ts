// src/store/gameStore.ts
import { create } from "zustand";
import { Player } from "../types/game";

// Định nghĩa kiểu cho store theo shape bạn đang dùng
interface GameStore {
  players: Player[];
  targetNumber: number | null;
  isGameStarted: boolean;
  winner: Player | null;
  timeRemaining: number;
  // Các hành động (actions)
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setTargetNumber: (number: number | null) => void;
  startGame: () => void;
  endGame: (winner: Player | null) => void;
  setTimeRemaining: (time: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  players: [],
  targetNumber: null,
  isGameStarted: false,
  winner: null,
  timeRemaining: 0,

  addPlayer: (player) =>
    set((state) => {
      // Nếu đã có player với cùng id thì không thêm nữa
      if (state.players.some((p) => p.id === player.id)) {
        // console.warn("Player already exists:", player);
        return {};
      }
      return { players: [...state.players, player] };
    }),
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
  setTargetNumber: (number) => set({ targetNumber: number }),
  startGame: () => set({ isGameStarted: true, winner: null }),
  endGame: (winner) => set({ isGameStarted: false, winner }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
}));
