import { useState, useEffect, useCallback } from 'react'
import type { VehicleHistory } from '../types'
import { getTodayHistory, clearTodayHistory } from '../services/historyService'
import { getFloors } from '../services/floorService'
import Header from '../components/Header'
import ConfirmDialog from '../components/ConfirmDialog'
import { TrashIcon, FilterIcon } from '../components/Icons'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function HistoryPage() {
  const [history, setHistory] = useState<VehicleHistory[]>([])
  const [query, setQuery] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [floorNames, setFloorNames] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const load = useCallback(() => {
    const h = getTodayHistory().sort(
      (a, b) => new Date(b.movedDownAt).getTime() - new Date(a.movedDownAt).getTime(),
    )
    setHistory(h)
    const names = [...new Set(h.map((i) => i.floorName))].sort()
    setFloorNames(names)
  }, [])

  useEffect(() => { load() }, [load])

  // Fallback: build floor list from floors service too
  useEffect(() => {
    const floors = getFloors().map((f) => f.name)
    setFloorNames((prev) => [...new Set([...prev, ...floors])].sort())
  }, [])

  const filtered = history.filter((h) => {
    const q = query.toLowerCase()
    const matchQ = !q || h.plate.toLowerCase().includes(q) || h.model.toLowerCase().includes(q)
    const matchF = !floorFilter || h.floorName === floorFilter
    return matchQ && matchF
  })

  function handleClear() {
    clearTodayHistory()
    setShowConfirm(false)
    load()
  }

  return (
    <div className="min-h-full">
      <Header
        title="Histórico do Dia"
        subtitle={`${history.length} veículo${history.length !== 1 ? 's' : ''} entregue${history.length !== 1 ? 's' : ''} hoje`}
        right={
          history.length > 0 ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1 text-red-500 px-3 py-2 rounded-xl text-sm font-semibold active:bg-red-50 touch-manipulation"
            >
              <TrashIcon className="w-4 h-4" />
              Limpar
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100 px-4 py-3 space-y-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por placa ou modelo..."
          className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200 transition-all"
        />
        {floorNames.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <FilterIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setFloorFilter('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors touch-manipulation ${
                !floorFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {floorNames.map((name) => (
              <button
                key={name}
                onClick={() => setFloorFilter(name === floorFilter ? '' : name)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors touch-manipulation ${
                  floorFilter === name
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 active:bg-gray-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-700 font-semibold">Nenhuma entrega hoje</p>
            <p className="text-gray-400 text-sm mt-1">O histórico aparece aqui após marcar veículos como descidos.</p>
          </div>
        )}

        {history.length > 0 && filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Nenhum resultado para o filtro.</p>
        )}

        {filtered.map((item) => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>

      {showConfirm && (
        <ConfirmDialog
          message="Limpar histórico de hoje?"
          detail="Esta ação não poderá ser desfeita."
          confirmLabel="Limpar tudo"
          danger
          onConfirm={handleClear}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

function HistoryCard({ item }: { item: VehicleHistory }) {
  const duration = Math.round(
    (new Date(item.movedDownAt).getTime() - new Date(item.parkedAt).getTime()) / 60000,
  )
  const durationText =
    duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)}h ${duration % 60}min`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="font-bold text-gray-900 text-base">{item.plate}</span>
          <p className="text-sm text-gray-500">{item.model}</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
          Entregue
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <InfoItem label="Piso" value={item.floorName} />
        <InfoItem label="Vaga" value={item.spotNumber} />
        <InfoItem label="Entrada" value={`${formatDate(item.parkedAt)} ${formatTime(item.parkedAt)}`} />
        <InfoItem label="Saída" value={formatTime(item.movedDownAt)} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Permanência: {durationText}</span>
        {item.observation && (
          <span className="text-xs text-gray-400 truncate max-w-[60%] ml-2" title={item.observation}>
            📝 {item.observation}
          </span>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-gray-700 mt-0.5">{value}</p>
    </div>
  )
}
