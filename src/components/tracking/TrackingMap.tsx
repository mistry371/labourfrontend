'use client';
import { useEffect, useRef, useState } from 'react';
import { WorkerLocation } from '@/hooks/useJobTracking';

interface Props {
  jobLatitude: number;
  jobLongitude: number;
  workerLocation: WorkerLocation | null;
  workerName?: string;
  className?: string;
}

/**
 * Renders an OpenStreetMap iframe centred between the worker and the job site.
 * Falls back to just the job site when no worker location is available.
 * No API key required.
 */
export function TrackingMap({ jobLatitude, jobLongitude, workerLocation, workerName, className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mapKey, setMapKey] = useState(0); // force re-render when worker moves significantly

  const prevWorkerRef = useRef<WorkerLocation | null>(null);

  useEffect(() => {
    if (!workerLocation) return;
    const prev = prevWorkerRef.current;
    if (!prev) { prevWorkerRef.current = workerLocation; setMapKey((k) => k + 1); return; }

    // Only re-render map if worker moved > 50m (avoid flicker on tiny GPS jitter)
    const dLat = Math.abs(workerLocation.latitude - prev.latitude);
    const dLon = Math.abs(workerLocation.longitude - prev.longitude);
    if (dLat > 0.0005 || dLon > 0.0005) {
      prevWorkerRef.current = workerLocation;
      setMapKey((k) => k + 1);
    }
  }, [workerLocation]);

  // Compute bounding box to fit both pins
  const buildSrc = () => {
    if (workerLocation) {
      const minLat = Math.min(jobLatitude, workerLocation.latitude) - 0.005;
      const maxLat = Math.max(jobLatitude, workerLocation.latitude) + 0.005;
      const minLon = Math.min(jobLongitude, workerLocation.longitude) - 0.005;
      const maxLon = Math.max(jobLongitude, workerLocation.longitude) + 0.005;
      // OSM embed supports a single marker; we use the job location as the primary marker
      return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${jobLatitude},${jobLongitude}`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${jobLongitude - 0.01},${jobLatitude - 0.01},${jobLongitude + 0.01},${jobLatitude + 0.01}&layer=mapnik&marker=${jobLatitude},${jobLongitude}`;
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-100 ${className ?? 'h-56'}`}>
      <iframe
        key={mapKey}
        ref={iframeRef}
        src={buildSrc()}
        title="Job location map"
        className="w-full h-full border-0"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Worker pin overlay — positioned absolutely over the iframe */}
      {workerLocation && (
        <div className="absolute inset-0 pointer-events-none">
          {/* We can't position a DOM element precisely over an iframe without a real map SDK,
              so we show a floating badge instead */}
          <div className="absolute top-3 left-3 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
            </span>
            <span className="font-medium text-gray-800">{workerName ?? 'Worker'}</span>
            <span className="text-gray-400 text-xs">live</span>
          </div>
        </div>
      )}

      {/* Job pin label */}
      <div className="absolute bottom-3 right-3 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5 text-xs text-gray-700">
        <span className="text-red-500">📍</span>
        Your location
      </div>

      {/* No location yet */}
      {!workerLocation && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            Waiting for worker location…
          </div>
        </div>
      )}
    </div>
  );
}
