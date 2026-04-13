import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const url = isLocal ? "http://localhost:9400" : "https://transly-wr1m.onrender.com";
    const token = typeof window !== 'undefined' ? localStorage.getItem("transly_token") : null;

    socket = io(url, {
        transports: ['websocket'],
        withCredentials: true,
        auth: { token }
    });
  }
  return socket;
};
