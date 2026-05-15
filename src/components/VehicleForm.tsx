import { useState } from 'react'
import type { Floor, ParkingSpot, Vehicle } from '../types'
import { registerVehicle, updateVehicle } from '../services/vehicleService'
import { formatPlate, isValidPlate } from '../lib/plate'
import { CAR_MODELS } from '../data/carModels'
import Autocomplete from './Autocomplete'
import { XIcon } from './Icons'

interface VehicleFormProps {
  floor: Floor
  spot: ParkingSpot
  vehicle?: Vehicle
  onSave: () => void
  onClose: () => void
}

const INPUT =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const LABEL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export default function VehicleForm({ floor, spot, vehicle, onSave, onClose }: VehicleFormProps) {
  const [plate, setPlate] = useState(vehicle?.plate ?? '')
  const [model, setModel] = useState(vehicle?.model ?? '')
  const [observation, setObservation] = useState(vehicle?.observation ?? '')
  const [error, setError] = useState('')

  function handlePlate(val: string) {
    setPlate(formatPlate(val))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!plate.trim()) { setError('Placa é obrigatória'); return }
    if (!isValidPlate(plate)) { setError('Informe uma placa no formato ABC-1234 ou ABC1D23'); return }
    if (!model.trim()) { setError('Modelo é obrigatório'); return }

    if (vehicle) {
      updateVehicle(vehicle.id, plate, model, observation)
    } else {
      registerVehicle(plate, model, floor.id, spot.id, observation)
    }
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {vehicle ? 'Editar Veículo' : 'Registrar Veículo'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {floor.name} · Vaga {spot.number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-100 touch-manipulation"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Piso</label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-600 font-medium">
                {floor.name}
              </div>
            </div>
            <div>
              <label className={LABEL}>Vaga</label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-600 font-medium">
                {spot.number}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="plate" className={LABEL}>Placa *</label>
            <input
              id="plate"
              type="text"
              value={plate}
              onChange={(e) => handlePlate(e.target.value)}
              placeholder="ABC-1234 ou ABC1D23"
              className={INPUT}
              inputMode="text"
              autoCapitalize="characters"
            />
          </div>

          <div>
            <label htmlFor="model" className={LABEL}>Modelo *</label>
            <Autocomplete
              id="model"
              value={model}
              onChange={setModel}
              suggestions={CAR_MODELS}
              placeholder="Ex: Onix, HB20, Corolla..."
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="obs" className={LABEL}>Observação</label>
            <textarea
              id="obs"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Arranhado, chave entregue, etc..."
              rows={2}
              className={`${INPUT} resize-none`}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm active:bg-gray-200 touch-manipulation"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-semibold text-sm active:bg-blue-700 touch-manipulation"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
