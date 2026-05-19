import * as repo from '../storage/localStorageRepository'
import { clearAllParkedVehicles } from './vehicleService'

function getTodayKey(): string {
  return new Date().toDateString()
}

function hasParkedVehiclesFromAnotherDay(todayKey: string): boolean {
  return repo
    .getVehicles()
    .some(
      (vehicle) =>
        vehicle.status === 'PARKED' && new Date(vehicle.createdAt).toDateString() !== todayKey,
    )
}

export function runDailyMaintenance(): void {
  const todayKey = getTodayKey()
  const lastCleanup = repo.getLastDailyCleanup()
  const shouldClearParkedVehicles =
    (lastCleanup !== null && lastCleanup !== todayKey) || hasParkedVehiclesFromAnotherDay(todayKey)

  if (shouldClearParkedVehicles) {
    clearAllParkedVehicles()
  }

  repo.saveLastDailyCleanup(todayKey)
}
