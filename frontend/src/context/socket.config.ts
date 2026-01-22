export const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing /api for socket connection if necessary, 
// usually socket.io prefix is handled by server, but we need the base URL.
export const SOCKET_URL = URL.replace(/\/api$/, '');
