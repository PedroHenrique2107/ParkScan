import type { ParkingSpot, Vehicle } from '../types'

interface SpotCardProps {
  spot: ParkingSpot
  vehicle?: Vehicle
  onClick: () => void
}

export default function SpotCard({ spot, vehicle, onClick }: SpotCardProps) {
  const occupied = !!vehicle

  return (
    <button
      onClick={onClick}
      className={`
        relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center
        p-1 text-center transition-all active:scale-95 touch-manipulation select-none
        ${
          occupied
            ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
            : 'bg-emerald-50 border-emerald-300 text-emerald-700'
        }
      `}
    >
      <span className={`text-[10px] font-bold leading-none ${occupied ? 'text-blue-200' : 'text-emerald-400'}`}>
        {spot.number}
      </span>
      {occupied ? (
        <>
          <span className="text-[11px] font-bold leading-tight mt-1 px-0.5 break-all">
            {vehicle!.plate}
          </span>
          <span className="text-[9px] text-blue-200 leading-tight mt-0.5 truncate w-full px-1 text-center">
            {vehicle!.model.split(' ')[0]}
          </span>
        </>
      ) : (
        <span className="text-[10px] font-medium mt-1">Livre</span>
      )}
    </button>
  )
}
