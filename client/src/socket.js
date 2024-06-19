import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  if (!socket) {
    const serverUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
    socket = io(serverUrl, {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = () => socket;