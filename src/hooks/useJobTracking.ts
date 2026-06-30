'use client';
import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';
import { JobStatus } from '@/types';

export interface WorkerLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface TrackingState {
  workerLocation: WorkerLocation | null;
  /** Straight-line km between worker and job site */
  distanceKm: number | null;
  /** Estimated minutes to arrival (only meaningful for worker_enroute) */
  etaMinutes: number | null;
  lastUpdated: Date | null;
}

/** Haversine distance in km */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Average urban travel speed assumption: 20 km/h */
const AVG_SPEED_KMH = 20;

interface Options {
  jobId: string;
  workerId: string | null;
  jobLatitude: number;
  jobLongitude: number;
  currentStatus: JobStatus;
  onStatusChange: (status: JobStatus, data?: any) => void;
}

export function useJobTracking({
  jobId,
  workerId,
  jobLatitude,
  jobLongitude,
  currentStatus,
  onStatusChange,
}: Options): TrackingState {
  const { socket } = useSocket();
  const [state, setState] = useState<TrackingState>({
    workerLocation: null,
    distanceKm: null,
    etaMinutes: null,
    lastUpdated: null,
  });

  // Keep a stable ref to onStatusChange to avoid stale closures
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  // Keep a stable ref to currentStatus for ETA calculation
  const currentStatusRef = useRef(currentStatus);
  useEffect(() => { currentStatusRef.current = currentStatus; }, [currentStatus]);

  // Join the tracking room for this worker when we have a workerId
  useEffect(() => {
    if (!socket || !workerId) return;
    // Emit immediately if connected, otherwise wait for connect event
    const join = () => socket.emit('job:track-worker', { workerId });
    if (socket.connected) {
      join();
    } else {
      socket.once('connect', join);
      return () => { socket.off('connect', join); };
    }
  }, [socket, workerId]);

  // Listen for worker location updates
  useEffect(() => {
    if (!socket) return;

    const handleLocation = (data: { workerId: string; latitude: number; longitude: number; timestamp: string }) => {
      if (!data?.latitude || !data?.longitude) return; // guard malformed data
      if (data.workerId !== workerId) return;

      const loc: WorkerLocation = {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.timestamp),
      };

      const dist = haversine(data.latitude, data.longitude, jobLatitude, jobLongitude);
      const eta = currentStatusRef.current === 'worker_enroute'
        ? Math.ceil((dist / AVG_SPEED_KMH) * 60)
        : null;

      setState({ workerLocation: loc, distanceKm: dist, etaMinutes: eta, lastUpdated: new Date() });
    };

    socket.on('worker:location', handleLocation);
    return () => { socket.off('worker:location', handleLocation); };
  }, [socket, workerId, jobLatitude, jobLongitude]);

  // Listen for job status changes — use ref so callback is always fresh
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (data: { jobId: string; status: JobStatus; [key: string]: any }) => {
      if (!data?.jobId || !data?.status) return; // guard malformed data
      if (data.jobId !== jobId) return;
      onStatusChangeRef.current(data.status, data);
    };

    socket.on('job:status-update', handleStatus);
    return () => { socket.off('job:status-update', handleStatus); };
  }, [socket, jobId]);

  return state;
}
