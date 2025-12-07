import { io, Socket } from "socket.io-client";
import type { ActivityLog } from "../models/activity_log";

let socket: Socket | null = null;

export const connectActivitySocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to activity socket");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from activity socket");
    });
  }
  return socket;
};

export const subscribeToActivityUpdates = (callback: (data: ActivityLog) => void) => {
  if (!socket) return;
  socket.on("activity_update", callback);
};
