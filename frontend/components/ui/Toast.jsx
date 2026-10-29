'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  message,
  title = 'Operación Exitosa',
  type = 'success', // 'success' | 'error' | 'info'
  onClose,
  duration = 10000 // 10 segundos
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-[9999] shadow-2xl rounded-xl border border-emerald-200 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center gap-3 max-w-md transition-all transform animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
      style={{
        borderColor: isSuccess ? '#A7F3D0' : isError ? '#FECDD3' : '#BFDBFE'
      }}
    >
      <div className="shrink-0">
        {isSuccess && (
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
        {isError && (
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
        {!isSuccess && !isError && (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary-blue">
            <Info className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-900">
          {title}
        </p>
        <p className="font-inter text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
