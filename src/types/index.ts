export interface Floor {
  id: string
  name: string
  totalSpots: number
  columns: number
  createdAt: string
  updatedAt: string
}

export interface ParkingSpot {
  id: string
  floorId: string
  number: string
  vehicleId?: string
}

export interface Vehicle {
  id: string
  plate: string
  model: string
  floorId: string
  spotId: string
  observation: string
  status: 'PARKED' | 'MOVED_DOWN'
  createdAt: string
  movedDownAt?: string
}

export interface VehicleHistory {
  id: string
  vehicleId: string
  plate: string
  model: string
  floorName: string
  spotNumber: string
  observation: string
  parkedAt: string
  movedDownAt: string
}
