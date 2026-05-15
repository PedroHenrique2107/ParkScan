import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Floor } from '../types'
import { getFloors, deleteFloor, getFloorStats } from '../services/floorService'
import Header from '../components/Header'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from '../components/Icons'

export default function FloorsPage() {
  const navigate = useNavigate()
  const [floors, setFloors] = useState<Floor[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Floor | null>(null)

  const load = useCallback(() => setFloors(getFloors()), [])

  useEffect(() => { load() }, [load])

  function handleDelete() {
    if (!deleteTarget) return
    deleteFloor(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  return (
    <div className="min-h-full">
      <Header
        title="Pisos"
        subtitle={`${floors.length} piso${floors.length !== 1 ? 's' : ''} cadastrado${floors.length !== 1 ? 's' : ''}`}
        right={
          <button
            onClick={() => navigate('/floors/new')}
            className="flex items-center gap-1 bg-blue-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold active:bg-blue-700 touch-manipulation"
          >
            <PlusIcon className="w-4 h-4" />
            Novo
          </button>
        }
      />

      <div className="p-4 space-y-3">
        {floors.length === 0 ? (
          <EmptyState onAdd={() => navigate('/floors/new')} />
        ) : (
          floors.map((floor) => {
            const stats = getFloorStats(floor.id)
            const pct = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0

            return (
              <div key={floor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => navigate(`/floors/${floor.id}`)}
                  className="w-full p-4 text-left active:bg-gray-50 rounded-2xl touch-manipulation"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{floor.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{stats.total} vagas no total</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Occupation bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="Ocupadas" value={stats.occupied} color="text-blue-600" />
                    <MiniStat label="Livres" value={stats.free} color="text-emerald-600" />
                    <MiniStat label="Ocupação" value={`${pct}%`} color="text-gray-600" />
                  </div>
                </button>

                <div className="border-t border-gray-50 flex">
                  <button
                    onClick={() => navigate(`/floors/edit/${floor.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-blue-600 text-sm font-medium active:bg-blue-50 rounded-bl-2xl touch-manipulation"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                  <div className="w-px bg-gray-50" />
                  <button
                    onClick={() => setDeleteTarget(floor)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-500 text-sm font-medium active:bg-red-50 rounded-br-2xl touch-manipulation"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Excluir "${deleteTarget.name}"?`}
          detail="Todos os veículos registrados neste piso serão removidos."
          confirmLabel="Excluir"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <span className="text-3xl">🏢</span>
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1">Nenhum piso cadastrado</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Crie o primeiro piso para começar a registrar veículos.
      </p>
      <button
        onClick={onAdd}
        className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm active:bg-blue-700 touch-manipulation"
      >
        Criar primeiro piso
      </button>
    </div>
  )
}
