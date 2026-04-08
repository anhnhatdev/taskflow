import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useSocket = (projectId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      withCredentials: true,
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      if (projectId) {
        s.emit('join-project', projectId);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [projectId]);

  return socket;
};
