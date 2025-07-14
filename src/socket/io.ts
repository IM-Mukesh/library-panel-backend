import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export const setSocketIO = (ioInstance: SocketIOServer) => {
  io = ioInstance;
};

export const getSocketIO = (): SocketIOServer => {
  if (!io) throw new Error("Socket.io instance not initialized");
  return io;
};
