import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
