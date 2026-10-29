'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar Acción?',
  message = 'Esta acción no se puede deshacer. ¿Deseas continuar?',
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning'
  isLoading = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${
              isDanger 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-montserrat font-bold text-lg text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="font-inter text-xs text-slate-600 mt-2 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold font-inter transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-inter text-white transition-all shadow-sm flex items-center gap-2 ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
              } disabled:opacity-50 cursor-pointer`}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
