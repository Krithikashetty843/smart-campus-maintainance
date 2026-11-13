import React from 'react';
import { CheckCircle2, Clock, Wrench, ShieldCheck, UserCheck } from 'lucide-react';

export default function ComplaintTimeline({ timeline = [], currentStatus }) {
  const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

  const getStepStatus = (stepName) => {
    const stepOrder = { Submitted: 1, Assigned: 2, 'In Progress': 3, Resolved: 4 };
    const currentOrder = stepOrder[currentStatus] || 1;
    const thisOrder = stepOrder[stepName];

    if (currentStatus === 'Rejected') {
      return stepName === 'Submitted' ? 'complete' : 'rejected';
    }

    if (thisOrder < currentOrder) return 'complete';
    if (thisOrder === currentOrder) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Visual Stepper Bar */}
      <div className="relative">
        <div className="absolute top-4 left-5 right-5 h-0.5 bg-slate-200 -z-0" />
        <div className="flex justify-between items-center relative z-10">
          {steps.map((step, idx) => {
            const status = getStepStatus(step);
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    status === 'complete'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : status === 'current'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-[11px] font-semibold ${
                    status === 'current'
                      ? 'text-blue-700'
                      : status === 'complete'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status Audit Trail
        </h5>
        <div className="space-y-3 pl-2 border-l-2 border-slate-200">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative pl-4 text-xs">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>{item.title || item.status}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {new Date(item.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-600 mt-0.5">{item.note}</p>
              {item.updatedBy && (
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Action taken by: <span className="font-medium text-slate-600">{item.updatedBy}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
