export function cleanPlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
}

export function isMercosulPlate(value: string): boolean {
  return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanPlate(value))
}

export function isOldPlate(value: string): boolean {
  return /^[A-Z]{3}\d{4}$/.test(cleanPlate(value))
}

export function formatPlate(value: string): string {
  const clean = cleanPlate(value)

  if (isMercosulPlate(clean)) return clean
  if (/^[A-Z]{3}\d[A-Z]/.test(clean)) return clean

  if (/^[A-Z]{3}\d/.test(clean)) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }

  return clean
}

export function isValidPlate(value: string): boolean {
  return isMercosulPlate(value) || isOldPlate(value)
}
