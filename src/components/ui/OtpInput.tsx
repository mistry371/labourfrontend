'use client';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled, error }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, '').split('').slice(0, length);

  const focus = (idx: number) => refs.current[idx]?.focus();

  const handleChange = (idx: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === idx ? digit : d)).join('').replace(/ /g, '');
    onChange(next);
    if (digit && idx < length - 1) focus(idx + 1);
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = digits.map((d, i) => (i === idx ? '' : d)).join('').replace(/ /g, '');
        onChange(next);
      } else if (idx > 0) {
        focus(idx - 1);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focus(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      focus(idx + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="OTP input">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] === ' ' ? '' : digits[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${idx + 1}`}
          className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 transition focus:outline-none
            ${error
              ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500'
              : digits[idx] && digits[idx] !== ' '
              ? 'border-orange-400 bg-orange-50 text-orange-700 focus:border-orange-500'
              : 'border-gray-300 bg-white text-gray-900 focus:border-orange-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}
