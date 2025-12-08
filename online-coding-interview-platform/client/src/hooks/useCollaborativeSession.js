import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export function useCollaborativeSession(sessionId) {
  const socketRef = useRef(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return undefined;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.emit('session:join', { sessionId });

    socket.on('session:state', (state) => {
      if (state?.code !== undefined) setCode(state.code);
      if (state?.language) setLanguage(state.language);
    });

    socket.on('code:update', ({ code: incoming }) => {
      if (typeof incoming === 'string') setCode(incoming);
    });

    socket.on('language:update', ({ language: incoming }) => {
      if (incoming) setLanguage(incoming);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const updateCode = (nextCode) => {
    setCode(nextCode);
    socketRef.current?.emit('code:change', { sessionId, code: nextCode });
  };

  const updateLanguage = (nextLang) => {
    setLanguage(nextLang);
    socketRef.current?.emit('language:change', { sessionId, language: nextLang });
  };

  return { code, language, connected, updateCode, updateLanguage };
}


