import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface SocketContextType {
    socket: Socket  | null;
    joinProjectRoom: (projectId: string) => void;
    leaveProjectRoom: (projectId: string) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);
