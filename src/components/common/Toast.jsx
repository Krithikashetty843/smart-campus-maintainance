import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-xl border border-slate-200/80 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-500 shrink-0" />}

      <p className="text-sm font-medium text-slate-800">{toast.message}</p>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
