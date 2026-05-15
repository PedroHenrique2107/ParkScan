import type { Vehicle, VehicleHistory } from '../types'
import * as repo from '../storage/localStorageRepository'
import { getFloorById, getSpotsByFloor } from './floorService'
import { cleanPlate, formatPlate } from '../lib/plate'

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function getVehicles(): Vehicle[] {
  return repo.getVehicles()
}

export function getActiveVehicles(): Vehicle[] {
  return repo.getVehicles().filter((v) => v.status === 'PARKED')
}

export function getVehicleById(id: string): Vehicle | undefined {
  return repo.getVehicles().find((v) => v.id === id)
}

export function registerVehicle(
  plate: string,
  model: string,
  floorId: string,
  spotId: string,
  observation: string,
): Vehicle {
  const vehicle: Vehicle = {
    id: genId(),
    plate: formatPlate(plate),
    model,
    floorId,
    spotId,
    observation,
    status: 'PARKED',
    createdAt: new Date().toISOString(),
  }

  const vehicles = repo.getVehicles()
  vehicles.push(vehicle)
  repo.saveVehicles(vehicles)

  const spots = repo.getSpots()
  const spotIdx = spots.findIndex((s) => s.id === spotId)
  if (spotIdx !== -1) spots[spotIdx].vehicleId = vehicle.id
  repo.saveSpots(spots)

  return vehicle
}

export function updateVehicle(id: string, plate: string, model: string, observation: string): void {
  const vehicles = repo.getVehicles()
  const idx = vehicles.findIndex((v) => v.id === id)
  if (idx === -1) return
  vehicles[idx] = {
    ...vehicles[idx],
    plate: formatPlate(plate),
    model,
    observation,
  }
  repo.saveVehicles(vehicles)
}

export function markMovedDown(vehicleId: string): void {
  const vehicles = repo.getVehicles()
  const idx = vehicles.findIndex((v) => v.id === vehicleId)
  if (idx === -1) return

  const vehicle = vehicles[idx]
  const movedDownAt = new Date().toISOString()
  vehicles[idx] = { ...vehicle, status: 'MOVED_DOWN', movedDownAt }
  repo.saveVehicles(vehicles)

  const spots = repo.getSpots()
  const spotIdx = spots.findIndex((s) => s.id === vehicle.spotId)
  if (spotIdx !== -1) delete spots[spotIdx].vehicleId
  repo.saveSpots(spots)

  const floor = getFloorById(vehicle.floorId)
  const floorSpots = getSpotsByFloor(vehicle.floorId)
  const spot = floorSpots.find((s) => s.id === vehicle.spotId)

  const entry: VehicleHistory = {
    id: genId(),
    vehicleId: vehicle.id,
    plate: vehicle.plate,
    model: vehicle.model,
    floorName: floor?.name ?? '',
    spotNumber: spot?.number ?? '',
    observation: vehicle.observation,
    parkedAt: vehicle.createdAt,
    movedDownAt,
  }

  const history = repo.getHistory()
  history.push(entry)
  repo.saveHistory(history)
}

export function removeVehicle(vehicleId: string): void {
  const vehicles = repo.getVehicles()
  const vehicle = vehicles.find((v) => v.id === vehicleId)
  if (!vehicle) return

  const spots = repo.getSpots()
  const spotIdx = spots.findIndex((s) => s.id === vehicle.spotId)
  if (spotIdx !== -1) delete spots[spotIdx].vehicleId
  repo.saveSpots(spots)

  repo.saveVehicles(vehicles.filter((v) => v.id !== vehicleId))
}

export function searchVehicles(query: string): Vehicle[] {
  const q = query.toLowerCase().trim()
  const cleanQ = cleanPlate(query).toLowerCase()
  if (!q) return []

  const floors = repo
    .getFloors()
    .reduce<Record<string, string>>((acc, f) => ({ ...acc, [f.id]: f.name }), {})
  const spots = repo
    .getSpots()
    .reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.id]: s.number }), {})

  return repo.getVehicles().filter((v) => {
    if (v.status !== 'PARKED') return false
    const floorName = (floors[v.floorId] ?? '').toLowerCase()
    const spotNum = (spots[v.spotId] ?? '').toLowerCase()
    const plate = v.plate.toLowerCase()
    const cleanVehiclePlate = cleanPlate(v.plate).toLowerCase()
    return (
      plate.includes(q) ||
      (!!cleanQ && cleanVehiclePlate.includes(cleanQ)) ||
      v.model.toLowerCase().includes(q) ||
      floorName.includes(q) ||
      spotNum.includes(q)
    )
  })
}

export function clearTodayVehicles(): void {
  const today = new Date().toDateString()
  const vehicles = repo.getVehicles()
  const removedIds = new Set(
    vehicles
      .filter((v) => {
        if (v.status === 'PARKED') return true
        return !!v.movedDownAt && new Date(v.movedDownAt).toDateString() === today
      })
      .map((v) => v.id),
  )

  if (removedIds.size === 0) return

  repo.saveVehicles(vehicles.filter((v) => !removedIds.has(v.id)))
  repo.saveSpots(
    repo.getSpots().map((spot) => (
      spot.vehicleId && removedIds.has(spot.vehicleId)
        ? { ...spot, vehicleId: undefined }
        : spot
    )),
  )
}
