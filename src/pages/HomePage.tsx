import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFloors, getSpotsByFloor } from '../services/floorService'
import { getActiveVehicles } from '../services/vehicleService'
import { getTodayHistory } from '../services/historyService'
import { APP_REFRESH_EVENT } from '../lib/refresh'
import { SearchIcon, MapIcon, ClockIcon, CogIcon, CarIcon } from '../components/Icons'

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ vehicles: 0, freeSpots: 0, movedToday: 0, totalSpots: 0 })

  const load = useCallback(() => {
    const floors = getFloors()
    const activeVehicles = getActiveVehicles()

    let totalFree = 0
    let totalSpots = 0
    for (const floor of floors) {
      const spots = getSpotsByFloor(floor.id)
      totalSpots += spots.length
      totalFree += spots.filter((s) => !s.vehicleId).length
    }

    setStats({
      vehicles: activeVehicles.length,
      freeSpots: totalFree,
      movedToday: getTodayHistory().length,
      totalSpots,
    })
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    window.addEventListener(APP_REFRESH_EVENT, load)
    return () => window.removeEventListener(APP_REFRESH_EVENT, load)
  }, [load])

  const occupancyPct = stats.totalSpots > 0 ? Math.round((stats.vehicles / stats.totalSpots) * 100) : 0

  const buttons = [
    { label: 'Buscar Veículo', icon: SearchIcon, to: '/search', color: 'bg-blue-600 text-white' },
    { label: 'Mapa de Pisos', icon: MapIcon, to: '/floor-map', color: 'bg-indigo-600 text-white' },
    { label: 'Histórico do Dia', icon: ClockIcon, to: '/history', color: 'bg-violet-600 text-white' },
    { label: 'Configurar Pisos', icon: CogIcon, to: '/floors', color: 'bg-gray-700 text-white' },
  ]

  return (
    <div className="min-h-full pb-4">
      {/* Header gradient */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-2 mb-1">
          <CarIcon className="w-6 h-6 opacity-80" />
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Estacionamento | MBL PARK - Avenida</span>
        </div>
        <h1 className="text-2xl font-bold">ParkScan</h1>
        <p className="text-blue-200 text-sm mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-5">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="No pátio"
            value={stats.vehicles}
            color="bg-white"
            valueColor="text-blue-600"
          />
          <StatCard
            label="Vagas livres"
            value={stats.freeSpots}
            color="bg-white"
            valueColor="text-emerald-600"
          />
          <StatCard
            label="Desceram hoje"
            value={stats.movedToday}
            color="bg-white"
            valueColor="text-violet-600"
          />
        </div>
        <div className="mt-3 rounded-2xl border border-blue-50 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ocupacao do patio</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {stats.vehicles} ocupadas
                <span className="font-medium text-gray-400"> / {stats.freeSpots} livres</span>
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
              {occupancyPct}%
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${occupancyPct}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-gray-400">
            <span>0%</span>
            <span>{stats.totalSpots} vagas</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ações rápidas</p>
        <div className="grid grid-cols-2 gap-3">
          {buttons.map(({ label, icon: Icon, to, color }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={`${color} rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm active:opacity-90 touch-manipulation`}
            >
              <Icon className="w-7 h-7 opacity-90" />
              <span className="font-semibold text-sm leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  valueColor,
}: {
  label: string
  value: number
  color: string
  valueColor: string
}) {
  return (
    <div className={`${color} rounded-2xl p-4 shadow-sm border border-gray-100 text-center`}>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
    </div>
  )
}
