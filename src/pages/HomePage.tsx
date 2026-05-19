import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFloors, getSpotsByFloor } from '../services/floorService'
import { getActiveVehicles } from '../services/vehicleService'
import { getTodayHistory } from '../services/historyService'
import { SearchIcon, MapIcon, ClockIcon, CogIcon, CarIcon } from '../components/Icons'

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ vehicles: 0, freeSpots: 0, movedToday: 0 })

  useEffect(() => {
    const floors = getFloors()
    const activeVehicles = getActiveVehicles()

    let totalFree = 0
    for (const floor of floors) {
      const spots = getSpotsByFloor(floor.id)
      totalFree += spots.filter((s) => !s.vehicleId).length
    }

    setStats({
      vehicles: activeVehicles.length,
      freeSpots: totalFree,
      movedToday: getTodayHistory().length,
    })
  }, [])

  const buttons = [
    { label: 'Buscar Veículo', icon: SearchIcon, to: '/search', color: 'bg-blue-600 text-white' },
    { label: 'Mapa de Pisos', icon: MapIcon, to: '/floors', color: 'bg-indigo-600 text-white' },
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
