import type { Server as SocketIOServer, Socket } from "socket.io";

export const registerSocketHandlers = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Optional: Join rooms based on library ID
    socket.on("join-library", (libraryId: string) => {
      socket.join(libraryId);
      console.log(`Socket ${socket.id} joined library room ${libraryId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};
