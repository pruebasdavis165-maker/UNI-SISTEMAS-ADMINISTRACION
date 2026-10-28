'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <select
          id={selectId}
          ref={ref}
          className={`block w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 text-sm text-slate-800 transition-all font-inter cursor-pointer
            ${Icon ? 'pl-10' : 'pl-3.5'} pr-10
            hover:border-slate-300 hover:shadow-sm
            focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:shadow-md
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' : ''}
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium font-inter mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 font-inter mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
