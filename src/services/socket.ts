import { io } from "socket.io-client";

// Sử dụng biến môi trường do Vite cung cấp
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Thay thế localhost bằng API_BASE_URL
const SOCKET_URL = API_BASE_URL;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});
