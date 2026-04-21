import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const url = "https://transly-wr1m.onrender.com"; // Consistently use production/remote backend as per api.ts
    const token = typeof window !== 'undefined' ? localStorage.getItem("transly_token") : null;

    socket = io(url, {
        transports: ['websocket'],
        withCredentials: true,
        auth: { token }
    });
  }
  return socket;
};
