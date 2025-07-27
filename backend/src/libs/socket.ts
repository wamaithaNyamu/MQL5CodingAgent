// libs/socket.ts
import { Server } from "socket.io";

let io: Server;

export function initSocketIO(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);
    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO has not been initialized.");
  return io;
}
