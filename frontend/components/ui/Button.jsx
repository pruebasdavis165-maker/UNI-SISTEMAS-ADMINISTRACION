'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-inter font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-primary-blue text-white hover:bg-blue-700 shadow-soft-sm hover:shadow-soft-md focus:ring-primary-blue/50 active:scale-[0.98]',
    accent: 'bg-accent-magenta text-white hover:bg-fuchsia-600 shadow-soft-sm hover:shadow-soft-md focus:ring-accent-magenta/50 active:scale-[0.98]',
    success: 'bg-success-green text-white hover:bg-emerald-600 shadow-soft-sm hover:shadow-soft-md focus:ring-success-green/50 active:scale-[0.98]',
    warning: 'bg-alert-amber text-white hover:bg-amber-600 shadow-soft-sm hover:shadow-soft-md focus:ring-alert-amber/50 active:scale-[0.98]',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-primary-blue/30 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-soft-sm focus:ring-rose-500/50 active:scale-[0.98]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
