import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Floor, ParkingSpot, Vehicle } from '../types'
import { getFloorById, getSpotsByFloor } from '../services/floorService'
import { getVehicleById } from '../services/vehicleService'
import * as repo from '../storage/localStorageRepository'
import Header from '../components/Header'
import SpotCard from '../components/SpotCard'
import VehicleForm from '../components/VehicleForm'
import VehicleDetail from '../components/VehicleDetail'

type ModalState =
  | { type: 'none' }
  | { type: 'register'; spot: ParkingSpot }
  | { type: 'detail'; vehicle: Vehicle; spot: ParkingSpot }
  | { type: 'edit'; vehicle: Vehicle; spot: ParkingSpot }

export default function FloorMapPage() {
  const { floorId } = useParams<{ floorId: string }>()
  const navigate = useNavigate()

  const [floor, setFloor] = useState<Floor | null>(null)
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [vehicleMap, setVehicleMap] = useState<Record<string, Vehicle>>({})
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const load = useCallback(() => {
    if (!floorId) return
    const f = getFloorById(floorId)
    if (!f) { navigate('/floors'); return }
    setFloor(f)

    const s = getSpotsByFloor(floorId)
    setSpots(s)

    const vehicles = repo.getVehicles()
    const map: Record<string, Vehicle> = {}
    for (const v of vehicles) {
      if (v.status === 'PARKED') map[v.id] = v
    }
    setVehicleMap(map)
  }, [floorId, navigate])

  useEffect(() => { load() }, [load])

  function handleSpotClick(spot: ParkingSpot) {
    if (spot.vehicleId) {
      const vehicle = vehicleMap[spot.vehicleId] ?? getVehicleById(spot.vehicleId)
      if (vehicle) setModal({ type: 'detail', vehicle, spot })
    } else {
      setModal({ type: 'register', spot })
    }
  }

  function handleRefresh() {
    setModal({ type: 'none' })
    load()
  }

  if (!floor) return null

  const occupied = spots.filter((s) => !!s.vehicleId).length
  const free = spots.length - occupied

  return (
    <div className="min-h-full">
      <Header
        title={floor.name}
        subtitle={`${occupied} ocupada${occupied !== 1 ? 's' : ''} · ${free} livre${free !== 1 ? 's' : ''}`}
        showBack
        backTo="/floors"
      />

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          <span className="text-xs text-gray-500">Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span className="text-xs text-gray-500">Ocupada</span>
        </div>
        <span className="ml-auto text-xs text-gray-400">{spots.length} vagas</span>
      </div>

      <div className="p-3">
        {spots.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">Nenhuma vaga configurada.</p>
        ) : (
          <div
            className={`grid gap-2`}
            style={{ gridTemplateColumns: `repeat(${floor.columns}, 1fr)` }}
          >
            {spots.map((spot) => {
              const vehicle = spot.vehicleId ? vehicleMap[spot.vehicleId] : undefined
              return (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  vehicle={vehicle}
                  onClick={() => handleSpotClick(spot)}
                />
              )
            })}
          </div>
        )}
      </div>

      {modal.type === 'register' && (
        <VehicleForm
          floor={floor}
          spot={modal.spot}
          onSave={handleRefresh}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'detail' && (
        <VehicleDetail
          vehicle={modal.vehicle}
          floor={floor}
          spot={modal.spot}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', vehicle: modal.vehicle, spot: modal.spot })}
          onRefresh={handleRefresh}
        />
      )}

      {modal.type === 'edit' && (
        <VehicleForm
          floor={floor}
          spot={modal.spot}
          vehicle={modal.vehicle}
          onSave={handleRefresh}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
    </div>
  )
}
