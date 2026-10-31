'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const DIAS_SEMANA = [
  { value: 'Lunes', label: 'Lunes', short: 'Lun', index: 0 },
  { value: 'Martes', label: 'Martes', short: 'Mar', index: 1 },
  { value: 'Miércoles', label: 'Miércoles', short: 'Mié', index: 2 },
  { value: 'Jueves', label: 'Jueves', short: 'Jue', index: 3 },
  { value: 'Viernes', label: 'Viernes', short: 'Vie', index: 4 },
  { value: 'Sábado', label: 'Sábado', short: 'Sáb', index: 5 },
  { value: 'Domingo', label: 'Domingo', short: 'Dom', index: 6 }
];

// Opciones de horas en intervalos de 30 minutos (06:00 a 22:00)
export const TIME_OPTIONS = (() => {
  const options = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let min of [0, 30]) {
      if (hour === 22 && min > 0) break;
      const hh = hour.toString().padStart(2, '0');
      const mm = min.toString().padStart(2, '0');
      const value = `${hh}:${mm}`;
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const label = `${displayHour}:${mm} ${period}`;
      
      options.push({ value, label });
    }
  }
  return options;
})();

export const formatTimeTo12h = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
};

export const parse12hTo24 = (time12) => {
  if (!time12) return '08:00';
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return '08:00';
  let h = parseInt(match[1], 10);
  const m = match[2];
  const p = (match[3] || '').toUpperCase();
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
};

const shortToDay = (short) => {
  const clean = short.replace('.', '').trim().toLowerCase();
  const found = DIAS_SEMANA.find(
    d => d.short.toLowerCase() === clean || d.value.toLowerCase().startsWith(clean)
  );
  return found ? found.value : 'Lunes';
};

const dayToShort = (day) => {
  const found = DIAS_SEMANA.find(d => d.value === day);
  return found ? found.short : day;
};

/**
 * Parsea un string existente como:
 * "Lun - Vie: 8:00 AM - 5:00 PM | Sáb: 8:00 AM - 12:00 PM"
 */
export const parseHorarioString = (horarioStr) => {
  if (!horarioStr || typeof horarioStr !== 'string') {
    return [
      { id: '1', diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' }
    ];
  }

  const parts = horarioStr.split('|').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [
      { id: '1', diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' }
    ];
  }

  const ranges = parts.map((part, idx) => {
    // Ejemplo "Lun - Vie: 8:00 AM - 5:00 PM" o "Sáb: 8:00 AM - 12:00 PM"
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) {
      return { id: String(idx + 1), diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' };
    }

    const daysPart = part.slice(0, colonIdx).trim();
    const timesPart = part.slice(colonIdx + 1).trim();

    let diaInicio = 'Lunes';
    let diaFin = 'Viernes';

    if (daysPart.includes('-')) {
      const [d1, d2] = daysPart.split('-').map(s => s.trim());
      diaInicio = shortToDay(d1);
      diaFin = shortToDay(d2);
    } else {
      diaInicio = shortToDay(daysPart);
      diaFin = diaInicio;
    }

    const timeMatches = timesPart.split('-').map(s => s.trim());
    let horaInicio = '08:00';
    let horaFin = '17:00';

    if (timeMatches.length >= 2) {
      horaInicio = parse12hTo24(timeMatches[0]);
      horaFin = parse12hTo24(timeMatches[1]);
    }

    return {
      id: String(idx + 1),
      diaInicio,
      diaFin,
      horaInicio,
      horaFin
    };
  });

  return ranges.length > 0 ? ranges : [
    { id: '1', diaInicio: 'Lunes', diaFin: 'Viernes', horaInicio: '08:00', horaFin: '17:00' }
  ];
};

export default function HorarioBuilder({
  value = '',
  onChange,
  label = 'Horario de Atención Dinámico'
}) {
  const [ranges, setRanges] = useState(() => parseHorarioString(value));

  // Sincronizar si cambia externamente el valor y difiere sustancialmente
  useEffect(() => {
    if (value && typeof value === 'string') {
      const generated = generateString(ranges);
      if (value !== generated) {
        setRanges(parseHorarioString(value));
      }
    }
  }, [value]);

  const generateString = (currentRanges) => {
    return currentRanges.map(r => {
      const d1 = dayToShort(r.diaInicio);
      const d2 = dayToShort(r.diaFin);
      const daysText = r.diaInicio === r.diaFin ? d1 : `${d1} - ${d2}`;
      const t1 = formatTimeTo12h(r.horaInicio);
      const t2 = formatTimeTo12h(r.horaFin);
      return `${daysText}: ${t1} - ${t2}`;
    }).join(' | ');
  };

  // Validaciones en tiempo real
  const validationResults = useMemo(() => {
    const errorsPerRange = {};
    const coveredDays = new Set();
    let globalValid = true;

    ranges.forEach((r, idx) => {
      const rangeErrors = [];

      // 1. Horas coherentes: Cierre > Apertura
      if (!r.horaInicio || !r.horaFin) {
        rangeErrors.push('Selecciona hora de apertura y cierre.');
        globalValid = false;
      } else if (r.horaFin <= r.horaInicio) {
        rangeErrors.push('La hora de cierre debe ser posterior a la de apertura.');
        globalValid = false;
      }

      // 2. Coherencia en días: díaFin >= díaInicio
      const idx1 = DIAS_SEMANA.find(d => d.value === r.diaInicio)?.index ?? 0;
      const idx2 = DIAS_SEMANA.find(d => d.value === r.diaFin)?.index ?? 0;

      if (idx2 < idx1) {
        rangeErrors.push(`El día de fin (${r.diaFin}) debe ser posterior o igual a ${r.diaInicio}.`);
        globalValid = false;
      } else {
        // 3. Chequear solapamiento con rangos previos
        for (let d = idx1; d <= idx2; d++) {
          const dayObj = DIAS_SEMANA.find(item => item.index === d);
          if (coveredDays.has(d)) {
            rangeErrors.push(`El día ${dayObj?.label} ya está cubierto en otro rango.`);
            globalValid = false;
          }
        }
        // Registrar días de este rango
        for (let d = idx1; d <= idx2; d++) {
          coveredDays.add(d);
        }
      }

      errorsPerRange[r.id] = rangeErrors;
    });

    return { errorsPerRange, globalValid };
  }, [ranges]);

  const handleRangeChange = (id, field, val) => {
    const updated = ranges.map(r => {
      if (r.id === id) {
        return { ...r, [field]: val };
      }
      return r;
    });
    setRanges(updated);

    if (onChange) {
      const str = generateString(updated);
      onChange(str, validationResults.globalValid);
    }
  };

  const handleAddRange = () => {
    // Buscar días disponibles
    const usedIndices = new Set();
    ranges.forEach(r => {
      const idx1 = DIAS_SEMANA.find(d => d.value === r.diaInicio)?.index ?? 0;
      const idx2 = DIAS_SEMANA.find(d => d.value === r.diaFin)?.index ?? 0;
      if (idx1 <= idx2) {
        for (let i = idx1; i <= idx2; i++) usedIndices.add(i);
      }
    });

    let firstFree = DIAS_SEMANA.find(d => !usedIndices.has(d.index));
    const nextDia = firstFree ? firstFree.value : 'Sábado';

    const newRange = {
      id: String(Date.now()),
      diaInicio: nextDia,
      diaFin: nextDia,
      horaInicio: '08:00',
      horaFin: '12:00'
    };

    const updated = [...ranges, newRange];
    setRanges(updated);

    if (onChange) {
      const str = generateString(updated);
      onChange(str, false);
    }
  };

  const handleRemoveRange = (id) => {
    if (ranges.length <= 1) return;
    const updated = ranges.filter(r => r.id !== id);
    setRanges(updated);

    if (onChange) {
      const str = generateString(updated);
      onChange(str, true);
    }
  };

  const formattedOutput = generateString(ranges);

  return (
    <div className="w-full space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-inter">
            {label}
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {ranges.length} {ranges.length === 1 ? 'bloque' : 'bloques'}
          </span>
        </div>
      )}

      {/* Dynamic Range Blocks */}
      <div className="space-y-3">
        {ranges.map((range, index) => {
          const errors = validationResults.errorsPerRange[range.id] || [];
          const hasError = errors.length > 0;

          return (
            <div 
              key={range.id}
              className={`p-3 rounded-xl border bg-slate-50/70 space-y-2.5 transition-all ${
                hasError ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-primary-blue text-[11px] font-bold flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 font-inter">
                    {index === 0 ? 'Horario Principal' : `Rango Adicional #${index + 1}`}
                  </span>
                </div>

                {ranges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRange(range.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar este rango"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid de 4 Selects: Día Inicio, Día Fin, Hora Apertura, Hora Cierre */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-inter">
                    Día Inicio
                  </label>
                  <select
                    value={range.diaInicio}
                    onChange={(e) => handleRangeChange(range.id, 'diaInicio', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-inter focus:outline-none focus:ring-1 focus:ring-primary-blue cursor-pointer"
                  >
                    {DIAS_SEMANA.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-inter">
                    Día Fin
                  </label>
                  <select
                    value={range.diaFin}
                    onChange={(e) => handleRangeChange(range.id, 'diaFin', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-inter focus:outline-none focus:ring-1 focus:ring-primary-blue cursor-pointer"
                  >
                    {DIAS_SEMANA.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-inter">
                    Apertura
                  </label>
                  <select
                    value={range.horaInicio}
                    onChange={(e) => handleRangeChange(range.id, 'horaInicio', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-primary-blue cursor-pointer"
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-inter">
                    Cierre
                  </label>
                  <select
                    value={range.horaFin}
                    onChange={(e) => handleRangeChange(range.id, 'horaFin', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-primary-blue cursor-pointer"
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Errores Inline por Rango */}
              {hasError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg space-y-0.5">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-rose-700 font-medium font-inter">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón "+ Agregar otro rango" */}
      <button
        type="button"
        onClick={handleAddRange}
        className="w-full py-2 px-3 border border-dashed border-primary-blue/50 hover:border-primary-blue bg-blue-50/30 hover:bg-blue-50/70 text-primary-blue rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer font-inter"
      >
        <Plus className="w-4 h-4" />
        <span>+ Agregar otro rango de horario</span>
      </button>

      {/* Preview Card */}
      <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1">
        <div className="flex items-center justify-between text-[11px] font-inter">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-primary-blue" />
            <span>Vista Previa del Horario Oficial:</span>
          </div>
          {validationResults.globalValid ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Válido
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Requiere corregir
            </span>
          )}
        </div>
        <p className="text-xs font-mono font-semibold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 truncate" title={formattedOutput}>
          {formattedOutput || 'Sin horario configurado'}
        </p>
      </div>
    </div>
  );
}
