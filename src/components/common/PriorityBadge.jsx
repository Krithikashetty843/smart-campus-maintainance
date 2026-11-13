import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, Check } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (priority) {
    case 'Critical':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300 shadow-sm ${sizeClasses}`}>
          <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" style={{ animationDuration: '2s' }} />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <Check className="w-3.5 h-3.5 text-slate-500" />
          Low
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {priority}
        </span>
      );
  }
}
