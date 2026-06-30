'use client';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { SERVICE_CATEGORIES } from '@/types';
import type { StepProps } from './types';

interface Fields {
  title: string;
  description: string;
}

const TITLE_SUGGESTIONS: Record<string, string[]> = {
  'Computer & Laptop':          ['Screen is broken', 'Battery drains quickly', 'Laptop won\'t turn on'],
  'Printer':                    ['Paper jam issue', 'Printer not connecting to Wi-Fi', 'Ink smudging'],
  'Networking':                 ['Wi-Fi dead zones in house', 'Setup office LAN', 'Configure new router'],
  'CCTV & Security':            ['Install 4 cameras at office', 'DVR not recording', 'Camera shows blank screen'],
  'Server & Cloud':             ['Setup Windows Server', 'Configure NAS storage', 'Server overheating'],
  'Email & Business IT':        ['Setup business email', 'Fix Outlook sync issue', 'Migrate to Google Workspace'],
  'Smart Devices':              ['Wall mount Smart TV', 'Fire TV stick not connecting', 'Setup Android TV'],
  'Office IT Infrastructure':   ['Setup new office IT', 'Cable management for desks', 'Install biometric attendance'],
  'Cyber Security':             ['Install antivirus on all PCs', 'Recover from ransomware', 'Configure office firewall'],
  'Mobile & Tablet':            ['Transfer data to new phone', 'iPad screen unresponsive', 'Android software update'],
  'Gaming & Entertainment':     ['Assemble custom gaming PC', 'Setup RGB lighting', 'PS5 console setup'],
  'Smart Home':                 ['Install smart door lock', 'Setup Alexa home automation', 'Install smart switches'],
  'Corporate & Enterprise':     ['Require resident IT engineer', 'Annual maintenance contract', 'IT infrastructure audit'],
  'Installation Services':      ['Install accounting software', 'Setup barcode scanner', 'Install UPS system'],
  'Maintenance Services':       ['Monthly preventive maintenance', 'Deep clean desktop PC', 'System performance tuning'],
};

export function StepDescribe({ draft, update, onNext, onBack }: StepProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Fields>({
    defaultValues: { title: draft.title, description: draft.description },
  });

  const title = watch('title');
  const description = watch('description');
  const charCount = description?.length ?? 0;

  // Sync to draft on change
  useEffect(() => { update({ title, description }); }, [title, description]);

  const suggestions = TITLE_SUGGESTIONS[draft.categoryName || ''] ?? [];

  const onValid = (data: Fields) => {
    update({ title: data.title, description: data.description });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Describe your problem</h2>
        <p className="text-sm text-gray-500 mt-1">
          Help the worker understand what needs to be done
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title', {
            required: 'Please enter a title',
            minLength: { value: 5, message: 'At least 5 characters' },
            maxLength: { value: 100, message: 'Max 100 characters' },
          })}
          placeholder={`e.g. ${suggestions[0] ?? 'Describe the job briefly'}`}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}

        {/* Quick suggestions */}
        {suggestions.length > 0 && !title && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue('title', s, { shouldValidate: true })}
                className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-3 py-1.5 rounded-full transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs ${charCount > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
            {charCount}/500
          </span>
        </div>
        <textarea
          {...register('description', {
            required: 'Please describe the problem',
            minLength: { value: 20, message: 'At least 20 characters' },
            maxLength: { value: 500, message: 'Max 500 characters' },
          })}
          rows={5}
          placeholder={`Describe the issue in detail. For example:\n• When did the problem start?\n• What have you already tried?\n• Any specific requirements?`}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Category context */}
      {draft.categoryName && (
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 text-sm text-gray-600">
          <span>
            Booking <strong>{draft.categoryName}</strong>
            {draft.deviceName && <> — {draft.deviceName}</>}
            {draft.serviceTypeName && <> — {draft.serviceTypeName}</>}
            {draft.problemName && <> ({draft.problemName})</>}
          </span>
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
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition active:scale-95"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}
