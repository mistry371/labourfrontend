'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import type { StepProps } from './types';

interface UploadItem {
  id: string;
  preview: string;
  url: string;
  progress: number;
  error?: string;
}

export function StepMedia({ draft, update, onNext, onBack }: StepProps) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    draft.mediaUrls.map((url) => ({
      id: url,
      preview: url,
      url,
      progress: 100,
    })),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  const uploadFile = async (file: File) => {
    const id = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);

    setItems((prev) => [...prev, { id, preview, url: '', progress: 10 }]);

    try {
      const res: any = await api.post('/api/v1/storage/signed-url', {
        folder: 'job-media',
        fileType: file.type,
      });
      const { uploadUrl, fileUrl } = res.data;

      setItems((prev) => prev.map((i) => i.id === id ? { ...i, progress: 40 } : i));

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setItems((prev) => prev.map((i) => i.id === id ? { ...i, url: fileUrl, progress: 100 } : i));
    } catch {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, error: 'Upload failed', progress: 0 } : i));
      toast.error('Failed to upload image');
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_FILES - items.length;
    if (remaining <= 0) { toast.error(`Max ${MAX_FILES} photos allowed`); return; }
    Array.from(files).slice(0, remaining).forEach(uploadFile);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleNext = () => {
    const uploaded = items.filter((i) => i.url && !i.error).map((i) => i.url);
    update({ mediaUrls: uploaded });
    onNext();
  };

  const allDone = items.every((i) => i.progress === 100 || !!i.error);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Add photos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Photos help workers understand the job better. Up to {MAX_FILES} images.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => items.length < MAX_FILES && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
          items.length >= MAX_FILES
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <div className="text-4xl mb-2">📷</div>
        <p className="text-sm font-medium text-gray-700">
          {items.length >= MAX_FILES ? 'Maximum photos reached' : 'Click or drag photos here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />

              {/* Progress overlay */}
              {item.progress < 100 && !item.error && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                  <span className="text-white text-xs mt-2">{item.progress}%</span>
                </div>
              )}

              {/* Error overlay */}
              {item.error && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                  <span className="text-white text-xs text-center px-2">Failed</span>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center transition"
                aria-label="Remove photo"
              >
                ✕
              </button>

              {/* Done checkmark */}
              {item.progress === 100 && !item.error && (
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
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
          disabled={!allDone && items.some((i) => i.progress < 100 && !i.error)}
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
        >
          {items.length === 0 ? 'Skip →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
