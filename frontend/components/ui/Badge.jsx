import React from 'react';

export default function Badge({
  children,
  variant = 'blue',
  dot = true,
  className = '',
  size = 'md'
}) {
  const variants = {
    blue: 'bg-blue-50 text-primary-blue border-blue-200',
    magenta: 'bg-fuchsia-50 text-accent-magenta border-fuchsia-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const dotColors = {
    blue: 'bg-primary-blue',
    magenta: 'bg-accent-magenta',
    amber: 'bg-alert-amber animate-pulse',
    green: 'bg-success-green',
    slate: 'bg-slate-400',
    rose: 'bg-rose-500',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-inter font-semibold rounded-full border ${variants[variant] || variants.blue} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.blue}`}></span>}
      {children}
    </span>
  );
}
