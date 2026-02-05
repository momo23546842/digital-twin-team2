import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge tailwind classes with support for conflicting utilities
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
