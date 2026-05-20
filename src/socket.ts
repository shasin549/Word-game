import { io } from 'socket.io-client';

// In development, it connects to the same origin by default. 
// In production, it does the same.
export const socket = io(window.location.origin, {
  autoConnect: false,
});
