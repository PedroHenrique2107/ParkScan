import { useState } from 'react'
import type { Floor, ParkingSpot, Vehicle } from '../types'
import { markMovedDown, removeVehicle } from '../services/vehicleService'
import ConfirmDialog from './ConfirmDialog'
import { XIcon, PencilIcon, TrashIcon, ArrowDownIcon } from './Icons'

interface VehicleDetailProps {
  vehicle: Vehicle
  floor: Floor
  spot: ParkingSpot
  onClose: () => void
  onEdit: () => void
  onRefresh: () => void
}

type Confirm = 'remove' | 'movedown' | null

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function VehicleDetail({
  vehicle,
  floor,
  spot,
  onClose,
  onEdit,
  onRefresh,
}: VehicleDetailProps) {
  const [confirm, setConfirm] = useState<Confirm>(null)

  function handleRemove() {
    removeVehicle(vehicle.id)
    onRefresh()
  }

  function handleMoveDown() {
    markMovedDown(vehicle.id)
    onRefresh()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-t-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">{vehicle.plate}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{vehicle.model}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-100 touch-manipulation"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 pb-8 space-y-4">
            {/* Status badge */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  vehicle.status === 'PARKED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {vehicle.status === 'PARKED' ? 'No andar' : 'Desceu'}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Piso" value={floor.name} />
              <InfoCard label="Vaga" value={spot.number} />
              <InfoCard label="Entrada" value={formatDate(vehicle.createdAt)} full />
              {vehicle.observation && (
                <InfoCard label="Observação" value={vehicle.observation} full />
              )}
            </div>

            {vehicle.status === 'PARKED' && (
              <div className="space-y-3 pt-2">
                {/* Desceu button — destaque máximo */}
                <button
                  onClick={() => setConfirm('movedown')}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:bg-emerald-600 touch-manipulation"
                >
                  <ArrowDownIcon className="w-5 h-5" />
                  Veículo Desceu para Entrega
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={onEdit}
                    className="flex-1 py-3.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm flex items-center justify-center gap-1.5 active:bg-blue-100 touch-manipulation"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirm('remove')}
                    className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-1.5 active:bg-red-100 touch-manipulation"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirm === 'remove' && (
        <ConfirmDialog
          message="Remover veículo?"
          detail={`${vehicle.plate} · ${vehicle.model} será removido do pátio sem registrar no histórico.`}
          confirmLabel="Remover"
          danger
          onConfirm={handleRemove}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'movedown' && (
        <ConfirmDialog
          message="Veículo desceu?"
          detail={`${vehicle.plate} será marcado como entregue e a vaga ${spot.number} ficará livre.`}
          confirmLabel="Confirmar descida"
          onConfirm={handleMoveDown}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}

function InfoCard({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${full ? 'col-span-2' : ''}`}>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}
