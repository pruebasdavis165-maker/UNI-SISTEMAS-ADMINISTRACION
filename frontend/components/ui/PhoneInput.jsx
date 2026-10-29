'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, CheckCircle2, Phone } from 'lucide-react';

export const COUNTRIES = [
  {
    code: 'NI',
    name: 'Nicaragua',
    dialCode: '+505',
    flag: '🇳🇮',
    digits: 8,
    placeholder: '8888-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    dialCode: '+1',
    flag: '🇺🇸',
    digits: 10,
    placeholder: '(305) 555-0199',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }
];

/**
 * Extrae el código de país y los dígitos locales de un string telefónico guardado.
 */
function parsePhoneValue(value) {
  if (!value || typeof value !== 'string') {
    return { country: COUNTRIES[0], digits: '' };
  }

  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+1') || (trimmed.startsWith('1') && digitsOnly.length === 11)) {
    const local = digitsOnly.startsWith('1') ? digitsOnly.slice(1, 11) : digitsOnly.slice(0, 10);
    return { country: COUNTRIES[1], digits: local };
  }

  if (trimmed.startsWith('+505') || trimmed.startsWith('505')) {
    const local = digitsOnly.startsWith('505') ? digitsOnly.slice(3, 11) : digitsOnly.slice(0, 8);
    return { country: COUNTRIES[0], digits: local };
  }

  // Si no tiene prefijo pero tiene 10 dígitos, asumir USA
  if (digitsOnly.length === 10) {
    return { country: COUNTRIES[1], digits: digitsOnly };
  }

  // Por defecto Nicaragua
  return { country: COUNTRIES[0], digits: digitsOnly.slice(0, 8) };
}

export default function PhoneInput({
  label = 'Teléfono / WhatsApp',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  id,
  className = ''
}) {
  const initial = parsePhoneValue(value);
  const [selectedCountry, setSelectedCountry] = useState(initial.country);
  const [digits, setDigits] = useState(initial.digits);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sincronizar si cambia el `value` externo
  useEffect(() => {
    const parsed = parsePhoneValue(value);
    setSelectedCountry(parsed.country);
    setDigits(parsed.digits);
  }, [value]);

  // Manejo de clic exterior para cerrar el dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerChange = (country, newDigits) => {
    if (!onChange) return;
    if (!newDigits) {
      onChange('');
      return;
    }
    const formatted = country.format(newDigits);
    const standardized = `${country.dialCode} ${formatted}`;
    onChange(standardized);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Ajustar dígitos a la longitud máxima del nuevo país
    const trimmedDigits = digits.slice(0, country.digits);
    setDigits(trimmedDigits);
    triggerChange(country, trimmedDigits);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    // Extraer solo números
    const cleanDigits = rawVal.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setDigits(cleanDigits);
    triggerChange(selectedCountry, cleanDigits);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const isComplete = digits.length === selectedCountry.digits;
  const isIncomplete = touched && digits.length > 0 && !isComplete;
  const displayFormatted = selectedCountry.format(digits);

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label 
            htmlFor={id} 
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter"
          >
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {digits.length}/{selectedCountry.digits} dígitos
          </span>
        </div>
      )}

      {/* Unified Flex Container */}
      <div 
        className={`relative flex items-stretch rounded-xl border bg-white transition-all shadow-soft-sm ${
          error || isIncomplete
            ? 'border-rose-400 ring-2 ring-rose-100'
            : isFocused
            ? 'border-primary-blue ring-2 ring-primary-blue/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
      >
        {/* Country Selector Dropdown Miniature */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 rounded-l-xl border-r border-slate-200 transition-colors select-none shrink-0 focus:outline-none"
          title={`País: ${selectedCountry.name}`}
        >
          <span className="text-lg leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-semibold text-xs text-slate-900 font-mono tracking-tight">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Floating Country Dropdown */}
        {isOpen && (
          <div 
            className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            role="listbox"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 font-inter">
              Operación Bilateral Oficial
            </div>
            {COUNTRIES.map((country) => {
              const isSelected = country.code === selectedCountry.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    isSelected 
                      ? 'bg-blue-50/80 text-primary-blue font-semibold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{country.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {country.dialCode} • {country.digits} dígitos
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary-blue shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Masked Input */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            id={id}
            type="tel"
            inputMode="numeric"
            disabled={disabled}
            placeholder={selectedCountry.placeholder}
            value={displayFormatted}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-inter focus:outline-none rounded-r-xl tracking-wider font-mono sm:font-sans"
          />

          {/* Validation Status Indicator */}
          <div className="pr-3 flex items-center pointer-events-none">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : digits.length > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Helper and Error Messages */}
      {error ? (
        <p className="text-xs text-rose-600 font-medium font-inter mt-1">{error}</p>
      ) : isIncomplete ? (
        <p className="text-xs text-amber-600 font-medium font-inter mt-1">
          Faltan {selectedCountry.digits - digits.length} dígitos para completar el número de {selectedCountry.name}.
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 font-inter mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
