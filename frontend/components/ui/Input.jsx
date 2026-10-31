'use client';

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between min-h-[20px]">
          <label 
            htmlFor={inputId} 
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter"
          >
            {label} {props.required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        </div>
      )}

      <div className="relative rounded-xl shadow-soft-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`block w-full h-12 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all font-inter
            ${Icon ? 'pl-10' : 'pl-3.5'} ${rightElement ? 'pr-11' : 'pr-3.5'}
            focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' : ''}
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium font-inter mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 font-inter mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
