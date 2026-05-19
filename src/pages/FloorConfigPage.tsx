import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFloorById, createFloor, updateFloor, getSpotsByFloor } from '../services/floorService'
import Header from '../components/Header'
import { CarIcon, PlusIcon, TrashIcon } from '../components/Icons'

const INPUT =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const LABEL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
const SPOT_SIZE = 56
const SPOT_GAP = 64
const SNAP_TOLERANCE = 16

interface LayoutSpot {
  id: string
  number: string
  x: number
  y: number
}

function generateDefaultLayout(): LayoutSpot[] {
  const spots: LayoutSpot[] = []
  let n = 1
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      spots.push({ id: `new-${n}`, number: String(n).padStart(2, '0'), x: col * 64, y: row * 64 })
      n++
    }
  }
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      spots.push({ id: `new-${n}`, number: String(n).padStart(2, '0'), x: 192 + col * 64, y: row * 64 })
      n++
    }
  }
  return spots
}

function getUniqueCoordinates(values: number[]): number[] {
  return [...values]
    .sort((a, b) => a - b)
    .reduce<number[]>((coords, value) => {
      const existing = coords.find((coord) => Math.abs(coord - value) <= SNAP_TOLERANCE)
      if (existing === undefined) coords.push(value)
      return coords
    }, [])
}

function getCommonGap(coords: number[]): number {
  const gaps = coords
    .slice(1)
    .map((coord, index) => coord - coords[index])
    .filter((gap) => gap > SNAP_TOLERANCE)

  return gaps.length > 0 ? Math.min(...gaps) : SPOT_GAP
}

function isSpotNearPosition(spot: LayoutSpot, x: number, y: number): boolean {
  return Math.abs(spot.x - x) <= SNAP_TOLERANCE && Math.abs(spot.y - y) <= SNAP_TOLERANCE
}

function getNextSpotPosition(spots: LayoutSpot[]): Pick<LayoutSpot, 'x' | 'y'> {
  if (spots.length === 0) return { x: 0, y: 0 }

  const columns = getUniqueCoordinates(spots.map((spot) => spot.x))
  const rows = getUniqueCoordinates(spots.map((spot) => spot.y))

  for (const row of rows) {
    for (const column of columns) {
      if (!spots.some((spot) => isSpotNearPosition(spot, column, row))) {
        return { x: column, y: row }
      }
    }
  }

  return {
    x: columns[0] ?? 0,
    y: (rows[rows.length - 1] ?? 0) + getCommonGap(rows),
  }
}

function getLogicalSpotNumber(
  spots: LayoutSpot[],
  position: Pick<LayoutSpot, 'x' | 'y'>,
): string {
  const spotsWithCandidate = [...spots, { id: 'candidate', number: '', ...position }]
  const columns = getUniqueCoordinates(spotsWithCandidate.map((spot) => spot.x))
  const rows = getUniqueCoordinates(spotsWithCandidate.map((spot) => spot.y))
  const rowIndex = rows.findIndex((row) => Math.abs(row - position.y) <= SNAP_TOLERANCE)
  const columnIndex = columns.findIndex((column) => Math.abs(column - position.x) <= SNAP_TOLERANCE)

  if (rowIndex === -1 || columnIndex === -1) {
    return String(spots.length + 1).padStart(2, '0')
  }

  if (columns.length <= 2) {
    return String(rowIndex * columns.length + columnIndex + 1).padStart(2, '0')
  }

  const baseRows = rows.findIndex((row) =>
    columns.some((column) => !spotsWithCandidate.some((spot) => isSpotNearPosition(spot, column, row))),
  )
  const completeBaseRows = baseRows === -1 ? rows.length : baseRows
  const groupSize = Math.ceil(columns.length / 2)

  if (rowIndex < completeBaseRows) {
    const groupIndex = Math.floor(columnIndex / groupSize)
    const indexInGroup = columnIndex % groupSize
    return String(groupIndex * completeBaseRows * groupSize + rowIndex * groupSize + indexInGroup + 1).padStart(2, '0')
  }

  const baseTotal = completeBaseRows * columns.length
  const extraRowIndex = rowIndex - completeBaseRows
  return String(baseTotal + extraRowIndex * columns.length + columnIndex + 1).padStart(2, '0')
}

export default function FloorConfigPage() {
  const navigate = useNavigate()
  const { floorId } = useParams<{ floorId: string }>()
  const isEdit = !!floorId

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [layoutSpots, setLayoutSpots] = useState<LayoutSpot[]>([])
  const [error, setError] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffsetRef = useRef({ startMouseX: 0, startMouseY: 0, startSpotX: 0, startSpotY: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEdit && floorId) {
      const floor = getFloorById(floorId)
      if (floor) {
        setName(floor.name)
        setDescription(floor.description ?? '')
        const spots = getSpotsByFloor(floorId)
        setLayoutSpots(
          spots.map((s, i) => ({
            id: s.id,
            number: s.number,
            x: s.x ?? (i % 4) * 64,
            y: s.y ?? Math.floor(i / 4) * 64,
          })),
        )
      }
    }
  }, [isEdit, floorId])

  useEffect(() => {
    if (!draggingId) return

    function onMove(e: PointerEvent) {
      const dx = e.clientX - dragOffsetRef.current.startMouseX
      const dy = e.clientY - dragOffsetRef.current.startMouseY
      const newX = Math.max(0, dragOffsetRef.current.startSpotX + dx)
      const newY = Math.max(0, dragOffsetRef.current.startSpotY + dy)
      setLayoutSpots((prev) =>
        prev.map((s) => (s.id === draggingId ? { ...s, x: newX, y: newY } : s)),
      )
    }

    function onUp() {
      setDraggingId(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [draggingId])

  function startDrag(e: React.PointerEvent, spot: LayoutSpot) {
    e.preventDefault()
    dragOffsetRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startSpotX: spot.x,
      startSpotY: spot.y,
    }
    setDraggingId(spot.id)
  }

  function handleAddSpot() {
    setLayoutSpots((prev) => {
      const position = getNextSpotPosition(prev)

      return [
        ...prev,
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          number: getLogicalSpotNumber(prev, position),
          ...position,
        },
      ]
    })
  }

  const canvasDims = useMemo(
    () => ({
      width: Math.max(400, layoutSpots.reduce((m, s) => Math.max(m, s.x + SPOT_SIZE + 24), 0)),
      height: Math.max(380, layoutSpots.reduce((m, s) => Math.max(m, s.y + SPOT_SIZE + 24), 0)),
    }),
    [layoutSpots],
  )

  function handleSave() {
    setError('')
    if (!name.trim()) {
      setError('O nome do piso é obrigatório.')
      return
    }
    if (isEdit && floorId) {
      updateFloor(floorId, name.trim(), description.trim(), layoutSpots)
    } else {
      createFloor(name.trim(), description.trim(), layoutSpots)
    }
    navigate('/floors')
  }

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <Header title={isEdit ? 'Editar Piso' : 'Novo Piso'} showBack backTo="/floors" />

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Section 1: Name + Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Cadastro de Piso</h2>
          <p className="text-xs text-gray-400 mb-4">
            Configure o nome, descrição e layout das vagas do piso
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>
                Nome do Piso{' '}
                <span className="text-red-400 normal-case font-normal tracking-normal">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Piso 1, Subsolo, Térreo..."
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Piso próximo à entrada..."
                className={INPUT}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setLayoutSpots([])}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              <TrashIcon className="w-4 h-4" />
              Limpar Todas as Vagas
            </button>
          </div>
        </div>

        {/* Section 2: Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Layout das Vagas</h2>
          <p className="text-xs text-gray-400 mb-4">
            Carregue o layout padrão e ajuste as posições das vagas conforme necessário.
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddSpot}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <PlusIcon className="w-4 h-4" />
              Adicionar Vaga
            </button>

            <button
              type="button"
              onClick={() => setLayoutSpots(generateDefaultLayout())}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              Carregar Layout Padrão
            </button>
          </div>

          {/* Canvas */}
          <div
            className="overflow-auto rounded-xl border-2 border-dashed border-gray-200"
            style={{ minHeight: 380 }}
          >
            <div
              ref={canvasRef}
              className="relative"
              style={{
                width: canvasDims.width,
                height: canvasDims.height,
                minWidth: '100%',
                minHeight: 380,
              }}
            >
              {layoutSpots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-gray-300 text-center px-4">
                    Nenhuma vaga adicionada. Clique em "Adicionar Vaga" ou "Carregar Layout Padrão".
                  </p>
                </div>
              )}

              {layoutSpots.map((spot) => (
                <div
                  key={spot.id}
                  className={`absolute flex flex-col items-center justify-center rounded-xl border-2 select-none
                    ${
                      draggingId === spot.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg z-20 cursor-grabbing'
                        : 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-md z-10 cursor-grab'
                    }`}
                  style={{
                    left: spot.x,
                    top: spot.y,
                    width: SPOT_SIZE,
                    height: SPOT_SIZE,
                    touchAction: 'none',
                  }}
                  onPointerDown={(e) => startDrag(e, spot)}
                  onMouseEnter={() => setHoveredId(spot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <CarIcon className="w-5 h-5 text-blue-500 pointer-events-none" />
                  <span className="text-[10px] font-bold text-blue-600 mt-0.5 pointer-events-none">
                    {spot.number}
                  </span>

                  {hoveredId === spot.id && draggingId !== spot.id && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() =>
                        setLayoutSpots((prev) => prev.filter((s) => s.id !== spot.id))
                      }
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-30 text-xs leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <CarIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Vaga - Arraste para reposicionar</span>
          </div>

          <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
            <span className="shrink-0">💡</span>
            <span>
              Dica: Arraste as vagas para ajustar suas posições. Passe o mouse sobre uma vaga e
              clique no X para removê-la.
            </span>
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-100">
            {error}
          </p>
        )}
      </div>

      {/* Save button — fixed bottom right */}
      <div className="fixed bottom-0 right-0 p-4 z-40">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm shadow-xl hover:bg-gray-800 active:bg-gray-950 touch-manipulation"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Salvar Piso
        </button>
      </div>
    </div>
  )
}
