'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  icon: Icon,
  error,
  className = '',
  containerClassName = '',
  dropUp = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-xl border bg-white py-2.5 px-3.5 text-xs text-left font-inter transition-all cursor-pointer shadow-xs ${
            isOpen ? 'border-primary-blue ring-2 ring-primary-blue/20' : 'border-slate-200 hover:border-slate-300'
          } ${error ? 'border-rose-500 ring-rose-200' : ''} ${className}`}
        >
          <div className="flex items-center gap-2.5 truncate">
            {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
            {selectedOption ? (
              <span className="font-semibold text-slate-800 truncate">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div 
            ref={listRef}
            onWheel={(e) => e.stopPropagation()}
            className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-[999] py-1.5 max-h-60 overflow-y-auto overscroll-contain divide-y divide-slate-50 font-inter ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
          >
            {options.length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-slate-400 text-center">
                No hay opciones disponibles
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-primary-blue font-bold'
                        : 'hover:bg-blue-50/70 hover:text-primary-blue text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className={`text-xs ${isSelected ? 'font-bold text-primary-blue' : 'font-semibold text-slate-800'}`}>
                        {opt.label}
                      </p>
                      {opt.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary-blue shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 font-medium font-inter mt-1">{error}</p>}
    </div>
  );
}
