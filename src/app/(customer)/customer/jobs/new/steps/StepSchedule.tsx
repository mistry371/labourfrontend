'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { StepProps } from './types';

type BookingMode = 'now' | 'later';

// Quick time slots relative to now
function getQuickSlots(): { label: string; value: string }[] {
  const slots = [];
  const now = new Date();
  // Round up to next 30-min boundary
  now.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);

  const labels = ['In 30 min', 'In 1 hour', 'In 2 hours', 'Tomorrow morning', 'Tomorrow afternoon'];
  const offsets = [0, 30, 90, null, null]; // minutes from now (null = special)

  for (let i = 0; i < labels.length; i++) {
    const d = new Date(now);
    if (offsets[i] !== null) {
      d.setMinutes(d.getMinutes() + (offsets[i] as number));
    } else if (i === 3) {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else {
      d.setDate(d.getDate() + 1);
      d.setHours(14, 0, 0, 0);
    }
    slots.push({
      label: labels[i],
      value: d.toISOString().slice(0, 16),
    });
  }
  return slots;
}

export function StepSchedule({ draft, update, onNext, onBack }: StepProps) {
  const [mode, setMode] = useState<BookingMode>(draft.scheduledAt ? 'later' : 'now');
  const [scheduledAt, setScheduledAt] = useState(draft.scheduledAt);

  const quickSlots = getQuickSlots();
  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 15);
  const minStr = minDateTime.toISOString().slice(0, 16);

  const handleNext = () => {
    update({ scheduledAt: mode === 'now' ? '' : scheduledAt });
    onNext();
  };

  const canProceed = mode === 'now' || !!scheduledAt;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">When do you need it?</h2>
        <p className="text-sm text-gray-500 mt-1">Choose a time that works for you</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(['now', 'later'] as BookingMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={clsx(
              'py-4 rounded-2xl border-2 font-semibold text-sm transition',
              mode === m
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
            )}
          >
            {m === 'now' ? (
              <><div className="text-2xl mb-1">⚡</div>Book Now<div className="text-xs font-normal text-gray-400 mt-0.5">ASAP</div></>
            ) : (
              <><div className="text-2xl mb-1">📅</div>Schedule<div className="text-xs font-normal text-gray-400 mt-0.5">Pick a time</div></>
            )}
          </button>
        ))}
      </div>

      {mode === 'now' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">⚡</p>
          <p className="font-semibold text-green-800">Immediate booking</p>
          <p className="text-sm text-green-600 mt-1">
            A worker will be assigned within minutes
          </p>
        </div>
      )}

      {mode === 'later' && (
        <div className="space-y-4">
          {/* Quick slots */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Quick select</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSlots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setScheduledAt(slot.value)}
                  className={clsx(
                    'px-3 py-2.5 rounded-xl border text-sm font-medium transition text-left',
                    scheduledAt === slot.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300',
                  )}
                >
                  {slot.label}
                  <div className="text-xs text-gray-400 font-normal mt-0.5">
                    {new Date(slot.value).toLocaleString('en-IN', {
                      weekday: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom datetime */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Or pick a custom time</p>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minStr}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {scheduledAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              📅 Scheduled for{' '}
              <strong>
                {new Date(scheduledAt).toLocaleString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit',
                })}
              </strong>
            </div>
          )}
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
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-40 transition active:scale-95"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
