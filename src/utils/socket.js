// frontend/utils/socket.js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, { // ✅ Uses env variable
  transports: ['websocket']
});

export default socket;
