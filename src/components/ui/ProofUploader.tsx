'use client';
import { useState, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { Spinner } from './Spinner';
import { toast } from './Toast';

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  url: string | null;
  error: string | null;
}

interface Props {
  folder: string;
  accept?: string;
  maxFiles?: number;
  minFiles?: number;
  onUrlsChange: (urls: string[]) => void;
}

export function ProofUploader({
  folder,
  accept = 'image/*,video/*',
  maxFiles = 5,
  minFiles = 1,
  onUrlsChange,
}: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const uploadFile = useCallback(async (item: UploadItem) => {
    try {
      const res: any = await api.post('/api/v1/storage/signed-url', {
        folder,
        fileType: item.file.type,
      });
      const { uploadUrl, fileUrl } = res.data;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: 30 } : i)),
      );

      await fetch(uploadUrl, {
        method: 'PUT',
        body: item.file,
        headers: { 'Content-Type': item.file.type },
      });

      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === item.id ? { ...i, progress: 100, url: fileUrl } : i,
        );
        onUrlsChange(next.filter((i) => i.url).map((i) => i.url!));
        return next;
      });
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, progress: 0, error: 'Upload failed' } : i,
        ),
      );
      toast.error('Failed to upload file');
    }
  }, [folder, onUrlsChange]);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = maxFiles - items.length;
    if (remaining <= 0) { toast.error(`Maximum ${maxFiles} files allowed`); return; }

    const toAdd = Array.from(files).slice(0, remaining);
    const newItems: UploadItem[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 10,
      url: null,
      error: null,
    }));

    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach(uploadFile);
  }, [items.length, maxFiles, uploadFile]);

  const remove = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      onUrlsChange(next.filter((i) => i.url).map((i) => i.url!));
      return next;
    });
  };

  const retry = (item: UploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, progress: 10, error: null } : i)),
    );
    uploadFile(item);
  };

  const uploadedCount = items.filter((i) => i.url).length;
  const hasError = items.some((i) => i.error);
  const allDone = items.length > 0 && items.every((i) => i.url || i.error);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {items.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition select-none ${
            dragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/40'
          }`}
        >
          <div className="text-3xl mb-2">📸</div>
          <p className="text-sm font-medium text-gray-700">
            Tap to add photos / videos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {items.length}/{maxFiles} added · JPG, PNG, MP4 up to 50MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {item.file.type.startsWith('video/') ? (
                <video
                  src={item.preview}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={item.preview}
                  alt="proof"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Upload progress overlay */}
              {!item.url && !item.error && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                  <Spinner size="sm" />
                  <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Done checkmark */}
              {item.url && (
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              {/* Error state */}
              {item.error && (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1 p-1">
                  <span className="text-white text-xs text-center">Failed</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); retry(item); }}
                    className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500 transition"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status line */}
      {items.length > 0 && (
        <p className={`text-xs text-center ${
          hasError ? 'text-red-500' :
          allDone && uploadedCount >= minFiles ? 'text-green-600' :
          'text-gray-400'
        }`}>
          {hasError
            ? 'Some uploads failed — tap Retry'
            : allDone
            ? `${uploadedCount} file${uploadedCount > 1 ? 's' : ''} ready`
            : 'Uploading…'}
        </p>
      )}
    </div>
  );
}
