// NicaLogistics Official Centralized Shipping Engine
// Unified mathematical calculation for Calculator, Cart, Checkout, and Order Summaries

export const SHIPPING_RATES = {
  PICKUP_LOCAL: {
    codigo: 'PICKUP_LOCAL',
    nombre: 'Pickup en Ventanilla (Local)',
    tarifaBase: 0.00,
    tarifaPorLibra: 0.00,
    tiempoEstimado: 'Disponible inmediatamente',
    tipoRuta: 'LOCAL',
    descripcion: 'Retiro directo en la misma sede sin cargos de traslado logístico.'
  },
  TERRESTRE_NAC: {
    codigo: 'TERRESTRE_NAC',
    nombre: 'Terrestre Estándar',
    tarifaBase: 3.00,
    tarifaPorLibra: 0.75,
    tiempoEstimado: '24 - 48 horas hábiles',
    tipoRuta: 'NACIONAL',
    descripcion: 'Transporte terrestre interdepartamental seguro entre sedes de Nicaragua.'
  },
  MARITIMO_INT: {
    codigo: 'MARITIMO_INT',
    nombre: 'Marítimo Económico',
    tarifaBase: 10.00,
    tarifaPorLibra: 1.85,
    tiempoEstimado: '10 - 15 días hábiles',
    tipoRuta: 'INTERNACIONAL',
    descripcion: 'Carga marítima consolidada bilateral Miami Hub ⇄ Managua.'
  },
  AEREO_INT: {
    codigo: 'AEREO_INT',
    nombre: 'Aéreo Exprés',
    tarifaBase: 20.00,
    tarifaPorLibra: 4.50,
    tiempoEstimado: '2 - 4 días hábiles',
    tipoRuta: 'INTERNACIONAL',
    descripcion: 'Vuelo exprés prioritario bilateral con trámite aduanal y despacho rápido.'
  }
};

/**
 * Función centralizada matemática oficial de NicaLogistics.
 * 
 * Regla de negocio:
 * 1. Pickup Local (origenId === destinoId): Total = $0.00 (Gratis)
 * 2. Envíos entre sedes: Total = Tarifa Base + (Peso en Libras * Tarifa por Libra)
 * 
 * @param {Object} params
 * @param {number} params.pesoLibras - Peso de la carga en libras
 * @param {string} params.modalidad - Código o nombre de la modalidad ('AEREO_INT', 'MARITIMO_INT', 'TERRESTRE_NAC', 'PICKUP_LOCAL')
 * @param {boolean} [params.isLocalPickup=false] - Si es retiro en la misma sede
 * @param {number} [params.tarifaBase] - Tarifa base override opcional (ej. traída de la BD)
 * @param {number} [params.tarifaPorLibra] - Tarifa por libra override opcional
 */
export function calculateShippingCost({
  pesoLibras = 1,
  modalidad = 'MARITIMO_INT',
  isLocalPickup = false,
  tarifaBase = null,
  tarifaPorLibra = null
}) {
  const weight = Math.max(0.1, Number(pesoLibras) || 1);

  if (isLocalPickup) {
    return {
      codigo: 'PICKUP_LOCAL',
      modalidadNombre: 'Pickup en Ventanilla (Local)',
      tarifaBase: 0.00,
      tarifaPorLibra: 0.00,
      peso: weight,
      costoPorPeso: 0.00,
      totalFlete: 0.00,
      tiempoEstimado: 'Disponible inmediatamente',
      formula: 'Pickup local: $0.00 (Gratis)',
      desgloseTexto: 'Retiro en la misma sede: Sin costo de flete ($0.00 USD)'
    };
  }

  // Normalización del código de modalidad
  const code = String(modalidad || 'MARITIMO_INT').toUpperCase();
  let matchedKey = 'MARITIMO_INT';

  if (code.includes('AEREO') || code.includes('AÉREO')) {
    matchedKey = 'AEREO_INT';
  } else if (code.includes('MARITIMO') || code.includes('MARÍTIMO')) {
    matchedKey = 'MARITIMO_INT';
  } else if (code.includes('TERRESTRE')) {
    matchedKey = 'TERRESTRE_NAC';
  } else if (code.includes('LOCAL') || code.includes('PICKUP')) {
    matchedKey = 'PICKUP_LOCAL';
  }

  const rateConfig = SHIPPING_RATES[matchedKey] || SHIPPING_RATES.MARITIMO_INT;
  
  const base = (tarifaBase !== null && tarifaBase !== undefined && !isNaN(tarifaBase))
    ? Number(tarifaBase) 
    : rateConfig.tarifaBase;

  const perPound = (tarifaPorLibra !== null && tarifaPorLibra !== undefined && !isNaN(tarifaPorLibra))
    ? Number(tarifaPorLibra) 
    : rateConfig.tarifaPorLibra;

  const costoPorPeso = Math.round(weight * perPound * 100) / 100;
  const totalFlete = Math.round((base + costoPorPeso) * 100) / 100;

  return {
    codigo: rateConfig.codigo,
    modalidadNombre: rateConfig.nombre,
    tarifaBase: base,
    tarifaPorLibra: perPound,
    peso: weight,
    costoPorPeso,
    totalFlete,
    tiempoEstimado: rateConfig.tiempoEstimado,
    formula: `$${base.toFixed(2)} base + (${weight.toFixed(1)} lbs × $${perPound.toFixed(2)}/lb)`,
    desgloseTexto: `$${base.toFixed(2)} base + $${costoPorPeso.toFixed(2)} por peso (${weight.toFixed(1)} lbs × $${perPound.toFixed(2)}/lb)`
  };
}
