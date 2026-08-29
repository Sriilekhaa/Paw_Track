import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const joinRoom = (role?: string, userId?: string): void => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit("join", { role, userId });
  } else if (s) {
    s.on("connect", () => {
      s.emit("join", { role, userId });
    });
  }
};
