import type { Floor, ParkingSpot } from '../types'
import * as repo from '../storage/localStorageRepository'

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function getFloors(): Floor[] {
  return repo.getFloors()
}

export function getFloorById(id: string): Floor | undefined {
  return repo.getFloors().find((f) => f.id === id)
}

export function createFloor(name: string, totalSpots: number, columns: number): Floor {
  const now = new Date().toISOString()
  const floor: Floor = { id: genId(), name, totalSpots, columns, createdAt: now, updatedAt: now }

  const floors = repo.getFloors()
  floors.push(floor)
  repo.saveFloors(floors)

  const spots = repo.getSpots()
  for (let i = 1; i <= totalSpots; i++) {
    spots.push({ id: genId(), floorId: floor.id, number: String(i).padStart(2, '0') })
  }
  repo.saveSpots(spots)

  return floor
}

export function updateFloor(id: string, name: string, totalSpots: number, columns: number): void {
  const floors = repo.getFloors()
  const idx = floors.findIndex((f) => f.id === id)
  if (idx === -1) return

  const oldTotal = floors[idx].totalSpots
  floors[idx] = { ...floors[idx], name, totalSpots, columns, updatedAt: new Date().toISOString() }
  repo.saveFloors(floors)

  if (totalSpots === oldTotal) return

  const allSpots = repo.getSpots()
  const floorSpots = allSpots.filter((s) => s.floorId === id)
  const otherSpots = allSpots.filter((s) => s.floorId !== id)

  if (totalSpots > oldTotal) {
    for (let i = oldTotal + 1; i <= totalSpots; i++) {
      floorSpots.push({ id: genId(), floorId: id, number: String(i).padStart(2, '0') })
    }
  } else {
    floorSpots.splice(totalSpots)
  }

  repo.saveSpots([...otherSpots, ...floorSpots])
}

export function deleteFloor(id: string): void {
  repo.saveFloors(repo.getFloors().filter((f) => f.id !== id))
  repo.saveSpots(repo.getSpots().filter((s) => s.floorId !== id))
  repo.saveVehicles(repo.getVehicles().filter((v) => v.floorId !== id))
}

export function getSpotsByFloor(floorId: string): ParkingSpot[] {
  return repo.getSpots().filter((s) => s.floorId === floorId)
}

export function getFloorStats(floorId: string): { total: number; occupied: number; free: number } {
  const spots = getSpotsByFloor(floorId)
  const occupied = spots.filter((s) => !!s.vehicleId).length
  return { total: spots.length, occupied, free: spots.length - occupied }
}
