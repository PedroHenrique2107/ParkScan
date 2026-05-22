import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Floor, ParkingSpot, Vehicle } from '../types'
import { getFloors, getSpotsByFloor } from '../services/floorService'
import { getVehicleById } from '../services/vehicleService'
import * as repo from '../storage/localStorageRepository'
import Header from '../components/Header'
import SpotCard from '../components/SpotCard'
import VehicleForm from '../components/VehicleForm'
import VehicleDetail from '../components/VehicleDetail'
import { CogIcon, PlusIcon } from '../components/Icons'

type FloorSection = {
  floor: Floor
  spots: ParkingSpot[]
}

type ModalState =
  | { type: 'none' }
  | { type: 'register'; floor: Floor; spot: ParkingSpot }
  | { type: 'detail'; floor: Floor; vehicle: Vehicle; spot: ParkingSpot }
  | { type: 'edit'; floor: Floor; vehicle: Vehicle; spot: ParkingSpot }

export default function AllFloorsMapPage() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<FloorSection[]>([])
  const [vehicleMap, setVehicleMap] = useState<Record<string, Vehicle>>({})
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const load = useCallback(() => {
    const floors = getFloors()
    setSections(floors.map((floor) => ({ floor, spots: getSpotsByFloor(floor.id) })))

    const map: Record<string, Vehicle> = {}
    for (const vehicle of repo.getVehicles()) {
      if (vehicle.status === 'PARKED') map[vehicle.id] = vehicle
    }
    setVehicleMap(map)
  }, [])

  useEffect(() => { load() }, [load])

  const totalSpots = sections.reduce((sum, section) => sum + section.spots.length, 0)
  const occupied = sections.reduce(
    (sum, section) => sum + section.spots.filter((spot) => !!spot.vehicleId).length,
    0,
  )

  function handleSpotClick(floor: Floor, spot: ParkingSpot) {
    if (spot.vehicleId) {
      const vehicle = vehicleMap[spot.vehicleId] ?? getVehicleById(spot.vehicleId)
      if (vehicle) setModal({ type: 'detail', floor, vehicle, spot })
      return
    }

    setModal({ type: 'register', floor, spot })
  }

  function handleRefresh() {
    setModal({ type: 'none' })
    load()
  }

  return (
    <div className="min-h-full">
      <Header
        title="Mapa de Pisos"
        subtitle={`${occupied} ocupada${occupied !== 1 ? 's' : ''} · ${totalSpots - occupied} livre${totalSpots - occupied !== 1 ? 's' : ''}`}
        right={
          <button
            onClick={() => navigate('/floors')}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 active:bg-blue-50 touch-manipulation"
          >
            <CogIcon className="h-4 w-4" />
            Configurar
          </button>
        }
      />

      <div className="flex items-center gap-4 border-b border-gray-100 bg-white px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />
          <span className="text-xs text-gray-500">Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-blue-600" />
          <span className="text-xs text-gray-500">Ocupada</span>
        </div>
        <span className="ml-auto text-xs text-gray-400">{totalSpots} vagas</span>
      </div>

      <div className="space-y-4 p-3">
        {sections.length === 0 ? (
          <EmptyMapState onAdd={() => navigate('/floors/new')} />
        ) : (
          sections.map((section) => (
            <FloorMapSection
              key={section.floor.id}
              floor={section.floor}
              spots={section.spots}
              vehicleMap={vehicleMap}
              onSpotClick={handleSpotClick}
              onConfigure={() => navigate(`/floors/edit/${section.floor.id}`)}
            />
          ))
        )}
      </div>

      {modal.type === 'register' && (
        <VehicleForm
          floor={modal.floor}
          spot={modal.spot}
          onSave={handleRefresh}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'detail' && (
        <VehicleDetail
          vehicle={modal.vehicle}
          floor={modal.floor}
          spot={modal.spot}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', floor: modal.floor, vehicle: modal.vehicle, spot: modal.spot })}
          onRefresh={handleRefresh}
        />
      )}

      {modal.type === 'edit' && (
        <VehicleForm
          floor={modal.floor}
          spot={modal.spot}
          vehicle={modal.vehicle}
          onSave={handleRefresh}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
    </div>
  )
}

function FloorMapSection({
  floor,
  spots,
  vehicleMap,
  onSpotClick,
  onConfigure,
}: {
  floor: Floor
  spots: ParkingSpot[]
  vehicleMap: Record<string, Vehicle>
  onSpotClick: (floor: Floor, spot: ParkingSpot) => void
  onConfigure: () => void
}) {
  const occupied = spots.filter((spot) => !!spot.vehicleId).length
  const hasLayout = spots.length > 0 && spots.every((spot) => spot.x !== undefined)
  const canvasDims = useMemo(
    () => ({
      width: Math.max(320, spots.reduce((max, spot) => Math.max(max, (spot.x ?? 0) + 72), 0)),
      height: Math.max(112, spots.reduce((max, spot) => Math.max(max, (spot.y ?? 0) + 72), 0)),
    }),
    [spots],
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-gray-900">{floor.name}</h2>
          <p className="text-xs text-gray-500">
            {occupied} ocupada{occupied !== 1 ? 's' : ''} · {spots.length - occupied} livre{spots.length - occupied !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onConfigure}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 active:bg-blue-50 touch-manipulation"
        >
          Editar
        </button>
      </div>

      {spots.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400">Nenhuma vaga configurada.</p>
      ) : hasLayout ? (
        <div className="overflow-auto p-3">
          <div className="relative" style={{ width: canvasDims.width, height: canvasDims.height }}>
            {spots.map((spot) => {
              const vehicle = spot.vehicleId ? vehicleMap[spot.vehicleId] : undefined
              return (
                <div
                  key={spot.id}
                  className="absolute"
                  style={{ left: spot.x, top: spot.y, width: 56, height: 56 }}
                >
                  <SpotCard spot={spot} vehicle={vehicle} onClick={() => onSpotClick(floor, spot)} />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-2 p-3" style={{ gridTemplateColumns: `repeat(${floor.columns}, 1fr)` }}>
          {spots.map((spot) => {
            const vehicle = spot.vehicleId ? vehicleMap[spot.vehicleId] : undefined
            return <SpotCard key={spot.id} spot={spot} vehicle={vehicle} onClick={() => onSpotClick(floor, spot)} />
          })}
        </div>
      )}
    </section>
  )
}

function EmptyMapState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <PlusIcon className="h-7 w-7 text-blue-600" />
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-800">Nenhum piso cadastrado</h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500">Crie um piso para visualizar as vagas no mapa geral.</p>
      <button
        onClick={onAdd}
        className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white active:bg-blue-700 touch-manipulation"
      >
        Criar primeiro piso
      </button>
    </div>
  )
}
