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
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    dialCode: '+506',
    flag: '🇨🇷',
    digits: 8,
    placeholder: '8888-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'HN',
    name: 'Honduras',
    dialCode: '+504',
    flag: '🇭🇳',
    digits: 8,
    placeholder: '9999-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'SV',
    name: 'El Salvador',
    dialCode: '+503',
    flag: '🇸🇻',
    digits: 8,
    placeholder: '7777-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'GT',
    name: 'Guatemala',
    dialCode: '+502',
    flag: '🇬🇹',
    digits: 8,
    placeholder: '5555-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'PA',
    name: 'Panamá',
    dialCode: '+507',
    flag: '🇵🇦',
    digits: 8,
    placeholder: '6000-0000',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  {
    code: 'MX',
    name: 'México',
    dialCode: '+52',
    flag: '🇲🇽',
    digits: 10,
    placeholder: '(55) 1234-5678',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
  },
  {
    code: 'ES',
    name: 'España',
    dialCode: '+34',
    flag: '🇪🇸',
    digits: 9,
    placeholder: '600 123 456',
    format: (digits) => {
      if (!digits) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
  }
];

/**
 * Extrae el código de país y los dígitos locales de un string telefónico guardado.
 */
function parsePhoneValue(value) {
  if (!value || typeof value !== 'string') {
    return { country: null, digits: '' };
  }

  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  // Buscar coincidencia por dialCode (orden descendente de longitud)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dialCode)) {
      const codeDigits = c.dialCode.replace(/\D/g, '');
      const local = digitsOnly.startsWith(codeDigits)
        ? digitsOnly.slice(codeDigits.length, codeDigits.length + c.digits)
        : digitsOnly.slice(0, c.digits);
      return { country: c, digits: local };
    }
  }

  // Si no tiene prefijo pero tiene 10 dígitos, asumir USA
  if (digitsOnly.length === 10) {
    return { country: COUNTRIES.find((c) => c.code === 'US') || COUNTRIES[1], digits: digitsOnly };
  }

  // Si tiene 8 dígitos, asumir Nicaragua
  if (digitsOnly.length === 8) {
    return { country: COUNTRIES[0], digits: digitsOnly };
  }

  return { country: null, digits: digitsOnly.slice(0, 8) };
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
  const [selectedCountry, setSelectedCountry] = useState(initial.country || COUNTRIES[0]);
  const [digits, setDigits] = useState(initial.digits);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sincronizar solo si cambia el valor externo no vacío o si se vacía externamente
  useEffect(() => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      setDigits('');
      return;
    }
    const parsed = parsePhoneValue(value);
    if (parsed.country) {
      setSelectedCountry(parsed.country);
    }
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

  const handleCountrySelect = (country, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedCountry(country);
    setIsOpen(false);

    // Ajustar dígitos a la longitud máxima del nuevo país
    const trimmedDigits = digits.slice(0, country.digits);
    setDigits(trimmedDigits);
    triggerChange(country, trimmedDigits);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
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
        <div className="flex items-center justify-between min-h-[20px]">
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
        className={`relative flex items-stretch h-12 rounded-xl border bg-white transition-all shadow-xs ${
          error || isIncomplete
            ? 'border-rose-400 ring-2 ring-rose-100'
            : isFocused || isOpen
            ? 'border-primary-blue ring-2 ring-primary-blue/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
      >
        {/* Country Selector Dropdown Miniature Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 h-full bg-slate-50 hover:bg-blue-50/60 active:bg-blue-100/60 text-slate-700 rounded-l-xl border-r border-slate-200 transition-all select-none shrink-0 focus:outline-none cursor-pointer group"
          title={`País seleccionado: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-sm font-bold font-mono text-slate-800" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-semibold text-xs text-slate-600 font-mono">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-primary-blue transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-blue' : ''}`} />
        </button>

        {/* Floating Country Dropdown */}
        {isOpen && (
          <div 
            ref={listRef}
            onWheel={(e) => e.stopPropagation()}
            className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-[99999] ring-1 ring-slate-900/10 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 font-inter"
            role="listbox"
          >
            <div className="px-3.5 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <span>Selecciona Código de País</span>
              <span className="text-[9px] text-primary-blue font-mono font-semibold">{COUNTRIES.length} Países</span>
            </div>

            <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto overscroll-contain">
              {COUNTRIES.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <div
                    key={country.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => handleCountrySelect(country, e)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-blue-50 text-primary-blue font-bold ring-1 ring-primary-blue/20' 
                        : 'text-slate-700 hover:bg-blue-50 hover:text-primary-blue'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0 border border-slate-200/70 font-mono font-bold text-slate-700">
                        {country.flag}
                      </div>
                      <div>
                        <p className={`font-semibold ${isSelected ? 'text-primary-blue font-bold' : 'text-slate-800'}`}>
                          {country.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {country.dialCode} • {country.digits} dígitos ({country.placeholder})
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary-blue/10 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary-blue stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
            className="w-full h-full bg-transparent px-3.5 text-sm text-slate-900 placeholder:text-slate-400 font-inter focus:outline-none rounded-r-xl tracking-wider font-mono sm:font-sans"
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
