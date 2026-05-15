import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFloorById, createFloor, updateFloor } from '../services/floorService'
import Header from '../components/Header'

const INPUT =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const LABEL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export default function FloorConfigPage() {
  const navigate = useNavigate()
  const { floorId } = useParams<{ floorId: string }>()
  const isEdit = !!floorId

  const [name, setName] = useState('')
  const [totalSpots, setTotalSpots] = useState('20')
  const [columns, setColumns] = useState('4')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && floorId) {
      const floor = getFloorById(floorId)
      if (floor) {
        setName(floor.name)
        setTotalSpots(String(floor.totalSpots))
        setColumns(String(floor.columns))
      }
    }
  }, [isEdit, floorId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const spots = parseInt(totalSpots)
    const cols = parseInt(columns)

    if (!name.trim()) { setError('O nome do piso é obrigatório.'); return }
    if (isNaN(spots) || spots < 1 || spots > 500) { setError('Quantidade de vagas deve ser entre 1 e 500.'); return }
    if (isNaN(cols) || cols < 2 || cols > 6) { setError('Colunas deve ser entre 2 e 6.'); return }

    if (isEdit && floorId) {
      updateFloor(floorId, name.trim(), spots, cols)
    } else {
      createFloor(name.trim(), spots, cols)
    }

    navigate('/floors')
  }

  const spotsNum = parseInt(totalSpots) || 0

  return (
    <div className="min-h-full">
      <Header
        title={isEdit ? 'Editar Piso' : 'Novo Piso'}
        showBack
        backTo="/floors"
      />

      <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Nome */}
        <div>
          <label className={LABEL}>Nome do Piso</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Piso 1, Subsolo, Térreo..."
            className={INPUT}
          />
        </div>

        {/* Vagas */}
        <div>
          <label className={LABEL}>Quantidade de Vagas</label>
          <input
            type="number"
            value={totalSpots}
            onChange={(e) => setTotalSpots(e.target.value)}
            min="1"
            max="500"
            inputMode="numeric"
            className={INPUT}
          />
          {spotsNum > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              Vagas serão numeradas de 01 a {String(spotsNum).padStart(2, '0')}.
            </p>
          )}
        </div>

        {/* Colunas */}
        <div>
          <label className={LABEL}>Colunas na grade visual</label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColumns(String(c))}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-colors touch-manipulation ${
                  columns === String(c)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Colunas exibidas no mapa de vagas.</p>
        </div>

        {/* Preview mini grid */}
        {spotsNum > 0 && spotsNum <= 50 && (
          <div>
            <label className={LABEL}>Preview da grade</label>
            <div
              className={`grid gap-1.5`}
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: Math.min(spotsNum, 30) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[9px] text-emerald-500 font-bold"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              ))}
              {spotsNum > 30 && (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 font-bold col-span-1">
                  +{spotsNum - 30}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/floors')}
            className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm active:bg-gray-200 touch-manipulation"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-semibold text-sm active:bg-blue-700 touch-manipulation"
          >
            {isEdit ? 'Salvar' : 'Criar Piso'}
          </button>
        </div>
      </form>
    </div>
  )
}
