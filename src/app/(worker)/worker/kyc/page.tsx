'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { workerApi } from '@/lib/api';
import { Worker } from '@/types';
import { toast } from '@/components/ui/Toast';

interface KycForm {
  aadhaarNumber: string;
  panNumber: string;
  drivingLicenseNumber?: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountName: string;
}

const STEPS = ['Documents', 'Bank Details', 'Review'];

function DocUpload({ label, onUpload, currentUrl, required }: { label: string; onUpload: (url: string) => void; currentUrl: string; required?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/storage/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: fd,
      }).then(r => r.json());
      onUpload(res.data?.url || res.url);
      toast.success(`${label} uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-teal-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => ref.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition ${currentUrl ? 'border-green-400 bg-green-50' : 'border-teal-200 hover:border-green-400 hover:bg-green-50'}`}>
        {uploading ? (
          <p className="text-sm text-teal-500">⏳ Uploading...</p>
        ) : currentUrl ? (
          <div className="flex items-center justify-center gap-2">
            <img src={currentUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
            <div className="text-left">
              <p className="text-sm font-bold text-green-700">✅ Uploaded</p>
              <p className="text-xs text-green-500">Tap to change</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-2xl mb-1">📷</p>
            <p className="text-sm font-semibold text-teal-600">Tap to upload {label}</p>
          </>
        )}
      </button>
    </div>
  );
}

export default function KycPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('');
  const [panCardUrl, setPanCardUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState('');
  const [policeVerificationUrl, setPoliceVerificationUrl] = useState('');

  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<KycForm>();
  const panNumber = watch('panNumber');

  useEffect(() => {
    workerApi.getProfile().then((res: any) => {
      setWorker(res.data);
      if (res.data?.status === 'approved') router.replace('/worker/dashboard');
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const validateStep0 = () => {
    if (!aadhaarFrontUrl || !aadhaarBackUrl || !selfieUrl || !drivingLicenseUrl || !policeVerificationUrl) {
      toast.error('Upload all required documents (including DL & Police verification)');
      return false;
    }
    return true;
  };

  const onSubmit = async (data: KycForm) => {
    if (!validateStep0()) return;
    setSubmitting(true);
    try {
      await workerApi.submitKyc({
        ...data,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        panCardUrl: panCardUrl || undefined,
        selfieUrl,
        drivingLicenseUrl,
        policeVerificationUrl,
      });
      toast.success('KYC submitted! Review within 24 hours.');
      router.push('/worker/dashboard');
    } catch (e: any) { toast.error(e?.message || 'Failed to submit KYC'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>;

  if (worker?.status === 'kyc_submitted') return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">⏳</div>
      <h2 className="text-xl font-black text-teal-800 mb-2">KYC Under Review</h2>
      <p className="text-teal-400">Your documents are being verified. Usually takes 24 hours.</p>
    </div>
  );

  if (worker?.status === 'rejected') return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">❌</div>
      <h2 className="text-xl font-black text-teal-800 mb-2">KYC Rejected</h2>
      <p className="text-teal-400 mb-6">{worker.rejectionReason || 'Please resubmit with correct documents.'}</p>
      <button onClick={() => setStep(0)} className="btn btn-primary">Resubmit KYC</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-xl font-black text-teal-800 mb-1">Complete KYC</h1>
      <p className="text-sm text-teal-400 mb-6">Verify your identity to start accepting jobs</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 shrink-0 transition-all ${
              i < step ? 'bg-brand-green border-green-500 text-white' : i === step ? 'bg-brand-teal border-teal-700 text-white' : 'bg-white border-teal-100 text-teal-300'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-xs ml-1 font-medium ${i === step ? 'text-teal-800' : 'text-teal-300'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-teal-100'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1.5">Aadhaar Number <span className="text-red-500">*</span></label>
              <input {...register('aadhaarNumber', { required: 'Required', pattern: { value: /^\d{12}$/, message: 'Enter valid 12-digit Aadhaar' } })}
                placeholder="123456789012" maxLength={12} inputMode="numeric" className="input w-full" />
              {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
            </div>
            <DocUpload label="Aadhaar Front" onUpload={setAadhaarFrontUrl} currentUrl={aadhaarFrontUrl} required />
            <DocUpload label="Aadhaar Back" onUpload={setAadhaarBackUrl} currentUrl={aadhaarBackUrl} required />
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1.5">PAN Number (optional)</label>
              <input {...register('panNumber', { pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN (e.g. ABCDE1234F)' } })}
                placeholder="ABCDE1234F" className="input w-full uppercase" />
              {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
            </div>
            {panNumber && <DocUpload label="PAN Card" onUpload={setPanCardUrl} currentUrl={panCardUrl} />}
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1.5">Driving License Number <span className="text-red-500">*</span></label>
              <input {...register('drivingLicenseNumber', { required: 'Required' })}
                placeholder="DL-1420110012345" className="input w-full uppercase" />
              {errors.drivingLicenseNumber && <p className="text-red-500 text-xs mt-1">{errors.drivingLicenseNumber.message}</p>}
            </div>
            <DocUpload label="Driving License" onUpload={setDrivingLicenseUrl} currentUrl={drivingLicenseUrl} required />
            <DocUpload label="Police Verification Certificate" onUpload={setPoliceVerificationUrl} currentUrl={policeVerificationUrl} required />
            <DocUpload label="Selfie with Aadhaar" onUpload={setSelfieUrl} currentUrl={selfieUrl} required />
            <button type="button" onClick={() => validateStep0() && setStep(1)} className="btn btn-primary w-full">Next: Bank Details →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {[
              { name: 'bankAccountName' as const, label: 'Account Holder Name', placeholder: 'As per bank records', rules: { required: 'Required' } },
              { name: 'bankAccountNumber' as const, label: 'Account Number', placeholder: 'Enter account number', rules: { required: 'Required', pattern: { value: /^\d{9,18}$/, message: 'Invalid account number' } } },
              { name: 'bankIfsc' as const, label: 'IFSC Code', placeholder: 'SBIN0001234', rules: { required: 'Required', pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' } } },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-teal-700 mb-1.5">{f.label} <span className="text-red-500">*</span></label>
                <input {...register(f.name, f.rules)} placeholder={f.placeholder} className="input w-full uppercase" />
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(0)} className="btn btn-ghost flex-1 border border-teal-100">← Back</button>
              <button type="button" onClick={() => setStep(2)} className="btn btn-primary flex-1">Review →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="card p-4 space-y-3 text-sm">
              <h3 className="font-bold text-teal-800">Review Your Details</h3>
              {[
                ['Aadhaar', getValues('aadhaarNumber')],
                ['PAN', getValues('panNumber') || '—'],
                ['Account Name', getValues('bankAccountName')],
                ['Account No.', getValues('bankAccountNumber')],
                ['IFSC', getValues('bankIfsc')],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-teal-500">{l}</span>
                  <span className="font-mono font-medium text-teal-800">{v}</span>
                </div>
              ))}
              <div className="flex justify-between"><span className="text-teal-500">Documents</span><span className="text-green-600 font-bold">✓ Uploaded</span></div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              By submitting, you confirm all information is accurate and agree to our Terms of Service.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1 border border-teal-100">← Back</button>
              <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                {submitting ? '⏳ Submitting...' : '✓ Submit KYC'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
