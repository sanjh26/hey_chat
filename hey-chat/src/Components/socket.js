import { io } from "socket.io-client";

// Create and export socket instance
const socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Export socket instance
export { socket };
