'use client';
import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { toast } from './Toast';

interface Props {
  label: string;
  folder: string;
  accept?: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  required?: boolean;
}

export function FileUpload({ label, folder, accept = 'image/*', onUpload, currentUrl, required }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    try {
      // 1. Get signed URL from backend
      const res: any = await api.post('/api/v1/storage/signed-url', {
        folder,
        fileType: file.type,
      });
      const { uploadUrl, fileUrl } = res.data;
      setProgress(30);

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      setProgress(90);

      // 3. Set preview and notify parent
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onUpload(fileUrl);
      setProgress(100);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition',
          uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="h-24 w-full object-cover rounded-lg" />
            <p className="text-xs text-gray-500 mt-1">Click to change</p>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-1">📎</div>
            <p className="text-sm text-gray-600">{uploading ? 'Uploading...' : 'Click to upload'}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 10MB</p>
          </div>
        )}
        {uploading && progress > 0 && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
