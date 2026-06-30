'use client';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import type { StepProps } from './types';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

async function searchAddress(query: string): Promise<Suggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } },
    );
    return await res.json();
  } catch {
    return [];
  }
}

export function StepLocation({ draft, update, onNext, onBack }: StepProps) {
  const [address, setAddress] = useState(draft.jobAddress);
  const [lat, setLat] = useState<number | null>(draft.jobLatitude);
  const [lng, setLng] = useState<number | null>(draft.jobLongitude);
  const [detecting, setDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        const addr = await reverseGeocode(latitude, longitude);
        setAddress(addr);
        setDetecting(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please allow access or type your address.',
          2: 'Could not determine your location.',
          3: 'Location request timed out.',
        };
        toast.error(messages[err.code] ?? 'Could not detect location');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    setLat(null);
    setLng(null);
    clearTimeout(debounceRef.current);
    if (val.length >= 3) {
      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        const results = await searchAddress(val);
        setSuggestions(results);
        setShowSuggestions(true);
        setSearching(false);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s: Suggestion) => {
    setAddress(s.display_name);
    setLat(parseFloat(s.lat));
    setLng(parseFloat(s.lon));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const canProceed = !!address.trim() && lat !== null && lng !== null;

  const handleNext = () => {
    if (!canProceed) {
      toast.error('Please confirm your location by selecting from suggestions or using GPS');
      return;
    }
    update({ jobAddress: address, jobLatitude: lat, jobLongitude: lng });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Where do you need the service?</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your address or use GPS</p>
      </div>

      {/* GPS button */}
      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2 border-2 border-blue-200 bg-blue-50 text-blue-700 py-3.5 rounded-2xl font-semibold hover:bg-blue-100 disabled:opacity-60 transition"
      >
        {detecting ? (
          <><Spinner size="sm" /> Detecting location...</>
        ) : (
          <><span className="text-lg">📍</span> Use my current location</>
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Address search */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Search address
        </label>
        <div className="relative">
          <input
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type your address..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition flex items-start gap-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-400 mt-0.5 shrink-0">📍</span>
                  <span className="text-gray-700 line-clamp-2">{s.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmed location pill */}
      {canProceed && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="text-green-600 text-lg">✅</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-700">Location confirmed</p>
            <p className="text-xs text-green-600 truncate">{address}</p>
          </div>
          <button
            type="button"
            onClick={() => { setAddress(''); setLat(null); setLng(null); }}
            className="text-green-400 hover:text-green-600 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map preview (static iframe via OpenStreetMap) */}
      {lat !== null && lng !== null && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 h-48">
          <iframe
            title="Location preview"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-300 py-3.5 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
