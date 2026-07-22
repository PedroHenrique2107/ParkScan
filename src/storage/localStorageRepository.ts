import type { Floor, ParkingSpot, Vehicle, VehicleHistory } from '../types'

const KEYS = {
  FLOORS: 'cp:floors',
  SPOTS: 'cp:spots',
  VEHICLES: 'cp:vehicles',
  HISTORY: 'cp:history',
  LAST_DAILY_CLEANUP: 'cp:lastDailyCleanup',
} as const

/**
 * Lê JSON sem derrubar a interface quando a chave não existe ou está corrompida.
 * Não realiza validação estrutural; os services ainda recebem o tipo declarado.
 */
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeSet<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Floors ──────────────────────────────────────────────────────────────────

export function getFloors(): Floor[] {
  return safeGet<Floor[]>(KEYS.FLOORS, [])
}

export function saveFloors(floors: Floor[]): void {
  safeSet(KEYS.FLOORS, floors)
}

// ── Spots ────────────────────────────────────────────────────────────────────

export function getSpots(): ParkingSpot[] {
  return safeGet<ParkingSpot[]>(KEYS.SPOTS, [])
}

export function saveSpots(spots: ParkingSpot[]): void {
  safeSet(KEYS.SPOTS, spots)
}

// ── Vehicles ─────────────────────────────────────────────────────────────────

export function getVehicles(): Vehicle[] {
  return safeGet<Vehicle[]>(KEYS.VEHICLES, [])
}

export function saveVehicles(vehicles: Vehicle[]): void {
  safeSet(KEYS.VEHICLES, vehicles)
}

// ── History ──────────────────────────────────────────────────────────────────

export function getHistory(): VehicleHistory[] {
  return safeGet<VehicleHistory[]>(KEYS.HISTORY, [])
}

export function saveHistory(history: VehicleHistory[]): void {
  safeSet(KEYS.HISTORY, history)
}

export function clearDayHistory(): void {
  const today = new Date().toDateString()
  const history = getHistory().filter(
    (h) => new Date(h.movedDownAt).toDateString() !== today,
  )
  saveHistory(history)
}

export function getLastDailyCleanup(): string | null {
  return localStorage.getItem(KEYS.LAST_DAILY_CLEANUP)
}

export function saveLastDailyCleanup(dateKey: string): void {
  localStorage.setItem(KEYS.LAST_DAILY_CLEANUP, dateKey)
}
