'use client';
import { useEffect, useRef, useCallback } from 'react';
import { workerApi } from '@/lib/api';
import { useSocket } from './useSocket';
import { toast } from '@/components/ui/Toast';

export function useWorkerLocation(enabled: boolean) {
  const { socket } = useSocket();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const errorShownRef = useRef(false);
  const THROTTLE_MS = 10000; // update every 10s max

  const sendLocation = useCallback(
    (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;
      lastUpdateRef.current = now;

      // Update via REST (persists to DB)
      workerApi.updateLocation(lat, lng).catch(() => {});

      // Broadcast via socket (real-time)
      socket?.emit('worker:location', { latitude: lat, longitude: lng });
    },
    [socket],
  );

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.geolocation) return;

    errorShownRef.current = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        errorShownRef.current = false;
        sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Only show toast once per watch session to avoid spam
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          if (err.code === err.PERMISSION_DENIED) {
            toast.error('Location permission denied. Enable location to receive jobs.');
          } else {
            toast.error('Unable to get your location. Check GPS settings.');
          }
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, sendLocation]);
}
