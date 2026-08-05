import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    socket.on("join-room", (room) => {
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized yet");
  }
  return io;
};

export const emitNotification = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
