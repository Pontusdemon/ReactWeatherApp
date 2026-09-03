import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanLocationName(name: string) {
  return name.split("|")[0].trim();
}

export function formatLocationLabel(
  name: string,
  country?: string,
  state?: string,
) {
  const validParts = [cleanLocationName(name), state, country].filter(
    (part): part is string => Boolean(part && part !== "undefined"),
  );

  return validParts.join(", ");
}
