import { useState, useEffect, useCallback } from 'react'
import type { Floor, ParkingSpot, Vehicle } from '../types'
import { searchVehicles } from '../services/vehicleService'
import { getFloorById, getSpotsByFloor } from '../services/floorService'
import Header from '../components/Header'
import VehicleDetail from '../components/VehicleDetail'
import VehicleForm from '../components/VehicleForm'
import { SearchIcon } from '../components/Icons'

type Detail = { vehicle: Vehicle; floor: Floor; spot: ParkingSpot } | null

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Vehicle[]>([])
  const [detail, setDetail] = useState<Detail>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const vehicles = searchVehicles(query)
    setResults(vehicles)
  }, [query])

  const openDetail = useCallback((vehicle: Vehicle) => {
    const floor = getFloorById(vehicle.floorId)
    const spots = getSpotsByFloor(vehicle.floorId)
    const spot = spots.find((s) => s.id === vehicle.spotId)
    if (floor && spot) setDetail({ vehicle, floor, spot })
  }, [])

  function handleRefresh() {
    setDetail(null)
    setEditing(false)
    setResults(searchVehicles(query))
  }

  return (
    <div className="min-h-full">
      <Header title="Buscar Veículo" />

      {/* Search input */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100 px-4 py-3">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Placa, modelo, piso ou vaga..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-200 transition-all"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Digite para buscar veículos</p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-700 font-semibold">Nenhum resultado</p>
            <p className="text-gray-400 text-sm mt-1">Tente outra placa ou modelo.</p>
          </div>
        )}

        {results.map((vehicle) => (
          <SearchResult key={vehicle.id} vehicle={vehicle} onOpen={openDetail} />
        ))}
      </div>

      {detail && !editing && (
        <VehicleDetail
          vehicle={detail.vehicle}
          floor={detail.floor}
          spot={detail.spot}
          onClose={() => setDetail(null)}
          onEdit={() => setEditing(true)}
          onRefresh={handleRefresh}
        />
      )}

      {detail && editing && (
        <VehicleForm
          floor={detail.floor}
          spot={detail.spot}
          vehicle={detail.vehicle}
          onSave={handleRefresh}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function SearchResult({ vehicle, onOpen }: { vehicle: Vehicle; onOpen: (v: Vehicle) => void }) {
  const floor = getFloorById(vehicle.floorId)
  const spots = getSpotsByFloor(vehicle.floorId)
  const spot = spots.find((s) => s.id === vehicle.spotId)

  return (
    <button
      onClick={() => onOpen(vehicle)}
      className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left active:bg-gray-50 touch-manipulation shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-base">{vehicle.plate}</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              No andar
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{vehicle.model}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-blue-700">{floor?.name ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">Vaga {spot?.number ?? '—'}</p>
        </div>
      </div>
    </button>
  )
}
