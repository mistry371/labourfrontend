'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Module-level singleton — one connection for the whole app lifetime
let _socket: Socket | null = null;
let _refCount = 0;
let _currentToken: string | null = null;

function createSocket(token: string): Socket {
  return io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}/ws`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30_000,
    reconnectionAttempts: Infinity,
    timeout: 10_000,
  });
}

export function useSocket() {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(_socket); // initialise with existing singleton
  const [status, setStatus] = useState<SocketStatus>(() =>
    _socket?.connected ? 'connected' : 'disconnected',
  );

  useEffect(() => {
    if (!accessToken) return;

    _refCount++;

    // If token changed (e.g. after refresh), recreate the socket
    if (_socket && _currentToken !== accessToken) {
      _socket.disconnect();
      _socket = null;
      _currentToken = null;
    }

    if (!_socket) {
      _socket = createSocket(accessToken);
      _currentToken = accessToken;
    }
    socketRef.current = _socket;

    const s = _socket;

    const onConnect      = () => setStatus('connected');
    const onDisconnect   = () => setStatus('disconnected');
    const onError        = () => setStatus('error');
    const onReconnecting = () => setStatus('connecting');
    // Re-auth with latest token on every reconnect attempt
    const onReconnectAttempt = () => {
      const latestToken = localStorage.getItem('accessToken');
      if (latestToken && s.auth) {
        (s.auth as Record<string, string>).token = latestToken;
      }
      setStatus('connecting');
    };

    s.on('connect',           onConnect);
    s.on('disconnect',        onDisconnect);
    s.on('connect_error',     onError);
    s.on('reconnect',         onConnect);
    s.on('reconnect_attempt', onReconnectAttempt);

    if (s.connected) setStatus('connected');
    else { setStatus('connecting'); s.connect(); }

    return () => {
      s.off('connect',           onConnect);
      s.off('disconnect',        onDisconnect);
      s.off('connect_error',     onError);
      s.off('reconnect',         onConnect);
      s.off('reconnect_attempt', onReconnectAttempt);

      _refCount = Math.max(0, _refCount - 1);
      if (_refCount === 0) {
        _socket?.disconnect();
        _socket = null;
        _currentToken = null;
      }
    };
  }, [accessToken]);

  return { socket: socketRef.current, status };
}

// Imperative helpers for use outside React
export function getSocket(): Socket | null { return _socket; }
export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
  _currentToken = null;
  _refCount = 0;
}
