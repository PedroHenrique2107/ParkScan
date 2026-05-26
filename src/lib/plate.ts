export function cleanPlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
}

export function isMercosulPlate(value: string): boolean {
  return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanPlate(value))
}

export function isOldPlate(value: string): boolean {
  return /^[A-Z]{3}\d{4}$/.test(cleanPlate(value))
}

export function formatPlateByType(value: string, mercosul: boolean): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const pattern = mercosul
    ? [/[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /[A-Z]/, /\d/, /\d/]
    : [/[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/]
  let clean = ''

  for (const character of raw) {
    if (clean.length >= pattern.length) break
    if (pattern[clean.length].test(character)) clean += character
  }

  if (!mercosul && clean.length > 3) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }

  return clean
}

export function isValidPlateByType(value: string, mercosul: boolean): boolean {
  return mercosul ? isMercosulPlate(value) : isOldPlate(value)
}

export function getNextPlateInputMode(value: string, mercosul: boolean): 'text' | 'numeric' {
  const nextPosition = cleanPlate(value).length

  if (nextPosition < 3) return 'text'
  if (mercosul && nextPosition === 4) return 'text'
  return 'numeric'
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
