import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocketIO = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket: Socket) => {
    // Room subscription based on role / userId
    socket.on("join", (data: { role?: string; userId?: string }) => {
      if (data.role) {
        socket.join(`role:${data.role}`);
      }
      if (data.userId) {
        socket.join(`user:${data.userId}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean up connection
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Emit event to all connected clients or specific rooms
 */
export const emitSocketEvent = (
  event: string,
  data: any,
  room?: string
): void => {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};
