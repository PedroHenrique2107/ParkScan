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

export function createFloor(
  name: string,
  description: string,
  spots: Array<{ number: string; x: number; y: number }>,
): Floor {
  const now = new Date().toISOString()
  const floor: Floor = {
    id: genId(),
    name,
    description,
    totalSpots: spots.length,
    columns: 4,
    createdAt: now,
    updatedAt: now,
  }

  const floors = repo.getFloors()
  floors.push(floor)
  repo.saveFloors(floors)

  const allSpots = repo.getSpots()
  for (const s of spots) {
    allSpots.push({ id: genId(), floorId: floor.id, number: s.number, x: s.x, y: s.y })
  }
  repo.saveSpots(allSpots)

  return floor
}

export function updateFloor(
  id: string,
  name: string,
  description: string,
  layoutSpots: Array<{ id?: string; number: string; x: number; y: number }>,
): void {
  const floors = repo.getFloors()
  const idx = floors.findIndex((f) => f.id === id)
  if (idx === -1) return

  floors[idx] = {
    ...floors[idx],
    name,
    description,
    totalSpots: layoutSpots.length,
    updatedAt: new Date().toISOString(),
  }
  repo.saveFloors(floors)

  const allSpots = repo.getSpots()
  const otherSpots = allSpots.filter((s) => s.floorId !== id)
  const existingFloorSpots = allSpots.filter((s) => s.floorId === id)

  const newSpots: ParkingSpot[] = layoutSpots.map((ls) => {
    const existing = ls.id ? existingFloorSpots.find((s) => s.id === ls.id) : undefined
    if (existing) {
      return { ...existing, number: ls.number, x: ls.x, y: ls.y }
    }
    return { id: genId(), floorId: id, number: ls.number, x: ls.x, y: ls.y }
  })

  repo.saveSpots([...otherSpots, ...newSpots])
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
