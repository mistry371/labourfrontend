import Link from 'next/link';
import { Job } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props {
  job: Job;
  href?: string;
  showCustomer?: boolean;
}

export function JobCard({ job, href, showCustomer }: Props) {
  const content = (
    <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {job.title}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{job.categoryName}</p>
          {showCustomer && (
            <p className="text-xs text-gray-400 mt-0.5">by {job.customer?.name}</p>
          )}
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500 truncate max-w-[60%] flex items-center gap-1">
          <span className="shrink-0">📍</span>
          <span className="truncate">{job.jobAddress}</span>
        </span>
        <span className="font-bold text-gray-900">₹{Number(job.estimatedPrice).toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}
