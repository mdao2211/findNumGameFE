import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

export const socketEvents = {
  connect: "connect",
  disconnect: "disconnect",
  playerJoin: "player:join",
  playerLeave: "player:leave",
  gameStart: "game:start",
  numberGenerated: "game:number",
  playerGuess: "player:guess",
  gameEnd: "game:end",
  updateScore: "game:updateScore",
  timeUpdate: "game:timeUpdate",
  gameState: "game:state",
  gameHint: "game:hint",
};
