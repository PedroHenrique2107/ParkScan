import type { VehicleHistory } from '../types'
import * as repo from '../storage/localStorageRepository'
import { clearTodayVehicles } from './vehicleService'

export function getTodayHistory(): VehicleHistory[] {
  const today = new Date().toDateString()
  return repo.getHistory().filter((h) => new Date(h.movedDownAt).toDateString() === today)
}

export function getAllHistory(): VehicleHistory[] {
  return repo.getHistory()
}

export function clearTodayHistory(): void {
  repo.clearDayHistory()
  clearTodayVehicles()
}
