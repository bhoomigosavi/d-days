import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinates(lon: number, lat: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function getVesselColor(type: string): string {
  switch (type) {
    case 'Military':
      return '#38bdf8'; // Sky blue / Navy
    case 'Tanker':
      return '#f97316'; // Orange / Hazardous
    case 'Cargo':
      return '#10b981'; // Emerald green
    case 'Fishing':
      return '#a855f7'; // Purple
    case 'Tug':
      return '#eab308'; // Amber
    case 'Special':
      return '#ef4444'; // Red / Warning
    default:
      return '#94a3b8'; // Slate
  }
}
