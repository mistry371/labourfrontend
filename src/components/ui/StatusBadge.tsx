const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  pending:        { label: 'Pending',      cls: 'bg-amber-50 text-amber-700 border border-amber-200',    dot: 'bg-amber-500' },
  matching:       { label: 'Matching',     cls: 'bg-blue-50 text-blue-700 border border-blue-200',       dot: 'bg-blue-500 animate-pulse' },
  assigned:       { label: 'Assigned',     cls: 'bg-teal-50 text-teal-700 border border-teal-200',       dot: 'bg-teal-500' },
  worker_enroute: { label: 'En Route',     cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500 animate-pulse' },
  in_progress:    { label: 'In Progress',  cls: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-500 animate-pulse' },
  completed:      { label: 'Completed',    cls: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-600' },
  cancelled:      { label: 'Cancelled',    cls: 'bg-red-50 text-red-600 border border-red-200',          dot: 'bg-red-500' },
  disputed:       { label: 'Disputed',     cls: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
  draft:          { label: 'Draft',        cls: 'bg-gray-50 text-gray-600 border border-gray-200',       dot: 'bg-gray-400' },
  active:         { label: 'Active',       cls: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-500 animate-pulse' },
  kyc_pending:    { label: 'KYC Pending',  cls: 'bg-amber-50 text-amber-700 border border-amber-200',    dot: 'bg-amber-500' },
  kyc_approved:   { label: 'Verified',     cls: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-600' },
  kyc_rejected:   { label: 'Rejected',     cls: 'bg-red-50 text-red-600 border border-red-200',          dot: 'bg-red-500' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
