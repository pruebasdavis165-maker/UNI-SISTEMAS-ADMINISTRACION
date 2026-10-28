import React from 'react';
import { AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  children,
  className = ''
}) {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-primary-blue',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-alert-amber',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-success-green',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="font-inter text-sm">
        {title && <h5 className="font-montserrat font-bold text-sm mb-1">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}
