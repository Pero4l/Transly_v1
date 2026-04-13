import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://transly-wr1m.onrender.com", {
        transports: ['websocket'],
        withCredentials: true
    });
  }
  return socket;
};
