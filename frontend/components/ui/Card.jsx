import React from 'react';

export function Card({ children, className = '', hover = true, ...props }) {
  const hasOverflowClass = /overflow-(hidden|visible|auto|scroll)/.test(className);
  return (
    <div 
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm 
        ${hover ? 'hover:shadow-soft-md hover:border-slate-300 transition-all duration-200' : ''} 
        ${hasOverflowClass ? '' : 'overflow-hidden'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`font-montserrat font-bold text-lg text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`font-inter text-xs text-slate-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 flex items-center justify-between border-t border-slate-50 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
