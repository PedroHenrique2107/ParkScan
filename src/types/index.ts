/** Piso/setor configurável que agrupa vagas de estacionamento. */
export interface Floor {
  id: string
  name: string
  description?: string
  totalSpots: number
  columns: number
  createdAt: string
  updatedAt: string
}

/** Vaga posicionada no mapa; `vehicleId` presente significa ocupação. */
export interface ParkingSpot {
  id: string
  floorId: string
  number: string
  vehicleId?: string
  x?: number
  y?: number
}

/** Registro operacional de um veículo, ativo ou já enviado para entrega. */
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

/** Snapshot imutável criado no momento em que um veículo é entregue. */
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
