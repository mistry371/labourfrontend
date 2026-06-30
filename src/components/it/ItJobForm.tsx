'use client';
import { useState, useEffect } from 'react';
import { ServiceCategory, ItUrgency, ServiceMode } from '@/types';
import { pricingApi } from '@/lib/api';

interface ItJobFormProps {
  category: ServiceCategory;
  onChange: (attrs: Record<string, any>, mode: ServiceMode) => void;
}

const DEVICE_TYPES: Record<string, string[]> = {
  laptop_repair:    ['Laptop', 'Desktop', 'MacBook', 'Chromebook'],
  printer_repair:   ['Inkjet Printer', 'Laser Printer', 'All-in-One', 'Thermal Printer'],
  cctv_installation:['IP Camera', 'Analog Camera', 'DVR', 'NVR', 'PTZ Camera'],
  networking:       ['WiFi Router', 'Switch', 'Access Point', 'Modem', 'Firewall'],
  software_support: ['Windows PC', 'Mac', 'Linux', 'Mobile Device'],
  data_recovery:    ['HDD', 'SSD', 'USB Drive', 'Memory Card', 'RAID'],
};

const BRANDS: Record<string, string[]> = {
  laptop_repair:    ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung', 'Other'],
  printer_repair:   ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Ricoh', 'Other'],
  cctv_installation:['Hikvision', 'Dahua', 'CP Plus', 'Bosch', 'Axis', 'Other'],
  networking:       ['TP-Link', 'Netgear', 'Cisco', 'D-Link', 'Asus', 'Ubiquiti', 'Other'],
  default:          ['Other'],
};

const WARRANTY = [
  { value: 'in_warranty', label: 'In Warranty' },
  { value: 'out_of_warranty', label: 'Out of Warranty' },
  { value: 'unknown', label: "Don't Know" },
];

const URGENCY_OPTIONS: { value: ItUrgency; label: string; desc: string; color: string }[] = [
  { value: 'low',      label: 'Low',      desc: 'Within 3–5 days',  color: 'border-gray-200 text-gray-600' },
  { value: 'normal',   label: 'Normal',   desc: 'Within 24 hours',  color: 'border-teal-200 text-teal-700' },
  { value: 'high',     label: 'High',     desc: 'Within 4 hours',   color: 'border-amber-300 text-amber-700' },
  { value: 'critical', label: 'Critical', desc: 'ASAP / Emergency', color: 'border-red-300 text-red-700' },
];

export function ItJobForm({ category, onChange }: ItJobFormProps) {
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState<ItUrgency>('normal');
  const [warrantyStatus, setWarrantyStatus] = useState('unknown');
  const [remoteAccess, setRemoteAccess] = useState(false);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('onsite');
  const [diagnosticEstimate, setDiagnosticEstimate] = useState<any>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const deviceTypes = DEVICE_TYPES[category.id] || [];
  const brands = BRANDS[category.id] || BRANDS.default;
  const subcategories = category.children || [];
  const supportedModes = category.supportedModes || ['onsite'];

  // Fetch diagnostic estimate when device + issue are selected
  useEffect(() => {
    if (!deviceType || !issueType) return;
    setLoadingEstimate(true);
    pricingApi.diagnosticEstimate({
      categoryId: category.id,
      deviceType: deviceType.toLowerCase(),
      brand: brand || undefined,
      issueType: issueType,
      urgency,
    }).then((res: any) => setDiagnosticEstimate(res?.data || res))
      .catch(() => setDiagnosticEstimate(null))
      .finally(() => setLoadingEstimate(false));
  }, [deviceType, issueType, urgency, category.id, brand]);

  // Propagate changes up
  useEffect(() => {
    onChange({
      deviceType, brand, model, issueType,
      issueDescription, urgency, warrantyStatus,
      remoteAccessAvailable: remoteAccess,
    }, serviceMode);
  }, [deviceType, brand, model, issueType, issueDescription, urgency, warrantyStatus, remoteAccess, serviceMode]);

  return (
    <div className="space-y-5">
      {/* Service Mode */}
      {supportedModes.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-2">Service Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {supportedModes.map((mode) => (
              <button key={mode} type="button"
                onClick={() => setServiceMode(mode as ServiceMode)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  serviceMode === mode
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-teal-600 hover:border-teal-300'
                }`}>
                {mode === 'onsite' ? '🏠 On-Site' : mode === 'remote' ? '💻 Remote' : '🔄 Hybrid'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Device Type */}
      {deviceTypes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-2">Device Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.map((d) => (
              <button key={d} type="button"
                onClick={() => setDeviceType(d)}
                className={`p-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  deviceType === d
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-teal-600 hover:border-teal-300'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Brand</label>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button key={b} type="button"
              onClick={() => setBrand(b)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                brand === b
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-teal-600 hover:border-teal-300'
              }`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Model / Serial (optional)</label>
        <input
          type="text" value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. Dell Inspiron 15, HP LaserJet Pro"
          className="input"
        />
      </div>

      {/* Issue Type */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-teal-700 mb-2">Issue Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {subcategories.map((s) => (
              <button key={s.id} type="button"
                onClick={() => setIssueType(s.id)}
                className={`p-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  issueType === s.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-teal-600 hover:border-teal-300'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Issue Description */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Describe the Issue *</label>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe what's happening in detail..."
          rows={3}
          className="input resize-none"
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Urgency</label>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY_OPTIONS.map((u) => (
            <button key={u.value} type="button"
              onClick={() => setUrgency(u.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                urgency === u.value ? `${u.color} bg-opacity-10 border-current` : 'border-gray-200 text-teal-600'
              }`}>
              <p className="text-sm font-bold">{u.label}</p>
              <p className="text-xs opacity-70">{u.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Warranty */}
      <div>
        <label className="block text-sm font-semibold text-teal-700 mb-2">Warranty Status</label>
        <div className="flex gap-2">
          {WARRANTY.map((w) => (
            <button key={w.value} type="button"
              onClick={() => setWarrantyStatus(w.value)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                warrantyStatus === w.value
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-teal-500'
              }`}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remote Access (for remote/hybrid mode) */}
      {(serviceMode === 'remote' || serviceMode === 'hybrid') && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input
            type="checkbox" id="remoteAccess"
            checked={remoteAccess}
            onChange={(e) => setRemoteAccess(e.target.checked)}
            className="w-4 h-4 accent-teal-600"
          />
          <label htmlFor="remoteAccess" className="text-sm text-teal-700 font-medium cursor-pointer">
            I can provide remote access (TeamViewer / AnyDesk)
          </label>
        </div>
      )}

      {/* Diagnostic Estimate Preview */}
      {(deviceType || issueType) && (
        <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-3">Pre-Diagnostic Estimate</p>
          {loadingEstimate ? (
            <div className="flex gap-3">
              <div className="skeleton h-10 flex-1 rounded-xl" />
              <div className="skeleton h-10 flex-1 rounded-xl" />
            </div>
          ) : diagnosticEstimate ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-teal-600">Diagnostic Fee</span>
                <span className="font-bold text-teal-800">
                  {diagnosticEstimate.diagnosticFee > 0 ? `₹${diagnosticEstimate.diagnosticFee}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-600">Estimated Repair</span>
                <span className="font-bold text-teal-800">
                  ₹{diagnosticEstimate.estimatedRepairRange?.min} – ₹{diagnosticEstimate.estimatedRepairRange?.max}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-600">Est. Duration</span>
                <span className="font-bold text-teal-800">{diagnosticEstimate.estimatedDurationHours}h</span>
              </div>
              {diagnosticEstimate.commonParts?.length > 0 && (
                <div className="pt-2 border-t border-teal-100">
                  <p className="text-xs text-teal-500 mb-1">Common parts that may be needed:</p>
                  <div className="flex flex-wrap gap-1">
                    {diagnosticEstimate.commonParts.map((p: any, i: number) => (
                      <span key={i} className="badge badge-teal text-xs">{p.name}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-teal-400 mt-2">
                * Final price confirmed after technician diagnosis. You approve before repair begins.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
