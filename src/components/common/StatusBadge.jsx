import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Wrench, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolved
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
