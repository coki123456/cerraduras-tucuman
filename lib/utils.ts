import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como moneda ARS */
export function formatARS(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Formatea una fecha ISO a formato legible en español */
export function formatFecha(fecha: string | Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(typeof fecha === "string" ? new Date(fecha) : fecha);
}

/** Formatea fecha con hora */
export function formatFechaHora(fecha: string | Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof fecha === "string" ? new Date(fecha) : fecha);
}

/** Formatea solo la hora (HH:MM) */
export function formatHora(hora: string): string {
  return hora.slice(0, 5);
}

/** Trunca texto con elipsis */
export function truncar(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max) + "…" : texto;
}

/** Genera un SKU a partir del nombre */
export function generarSKU(nombre: string): string {
  const base = nombre
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8)
    .padEnd(4, "0");
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${sufijo}`;
}

/** Etiquetas legibles para categorías */
export const ETIQUETAS_CATEGORIA = {
  cerraduras: "Cerraduras",
  herrajes: "Herrajes",
  accesorios: "Accesorios",
} as const;

/** Etiquetas legibles para estados de visita */
export const ETIQUETAS_ESTADO_VISITA = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
} as const;

/** Etiquetas legibles para estados de venta */
export const ETIQUETAS_ESTADO_VENTA = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
} as const;

/** Etiquetas para estado de pago */
export const ETIQUETAS_ESTADO_PAGO = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  rechazado: "Rechazado",
} as const;

/** Etiquetas para estado de compra */
export const ETIQUETAS_ESTADO_COMPRA = {
  en_proceso: "En proceso",
  en_preparacion: "En preparación",
  lista_para_retirar: "Lista para retirar",
  despachado: "Despachado",
  finalizado: "Finalizado",
} as const;

/** Etiquetas para tipo de servicio */
export const ETIQUETAS_TIPO_SERVICIO = {
  instalacion: "Instalación",
  reparacion: "Reparación",
  consulta: "Consulta",
} as const;
