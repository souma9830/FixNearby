import { io } from "socket.io-client";

let socketSingleton = null;

const getServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return "http://localhost:5000";
};

export const getSocket = () => {
  if (socketSingleton) return socketSingleton;

  socketSingleton = io(getServerUrl(), {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: true,
  });

  return socketSingleton;
};

export const disconnectSocket = () => {
  if (socketSingleton) {
    socketSingleton.disconnect();
    socketSingleton = null;
  }
};
