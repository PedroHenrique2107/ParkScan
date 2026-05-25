import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFloorById, createFloor, updateFloor, getSpotsByFloor } from '../services/floorService'
import Header from '../components/Header'
import { CarIcon, PlusIcon, TrashIcon } from '../components/Icons'

const INPUT =
  'w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const LABEL = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
const SPOT_SIZE = 80
const SPOT_GAP = 84
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
      spots.push({ id: `new-${n}`, number: String(n).padStart(2, '0'), x: col * SPOT_GAP, y: row * SPOT_GAP })
      n++
    }
  }
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      spots.push({ id: `new-${n}`, number: String(n).padStart(2, '0'), x: SPOT_GAP * 3 + col * SPOT_GAP, y: row * SPOT_GAP })
      n++
    }
  }
  return spots
}

function snapToGrid(value: number): number {
  return Math.max(0, Math.round(value / SPOT_GAP) * SPOT_GAP)
}

function snapPosition(position: Pick<LayoutSpot, 'x' | 'y'>): Pick<LayoutSpot, 'x' | 'y'> {
  return {
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
  }
}

function positionKey(position: Pick<LayoutSpot, 'x' | 'y'>): string {
  return `${position.x}:${position.y}`
}

function findNextFreeGridPosition(
  usedPositions: Set<string>,
  startPosition: Pick<LayoutSpot, 'x' | 'y'>,
): Pick<LayoutSpot, 'x' | 'y'> {
  let row = Math.floor(startPosition.y / SPOT_GAP)
  let col = Math.floor(startPosition.x / SPOT_GAP)

  while (usedPositions.has(positionKey({ x: col * SPOT_GAP, y: row * SPOT_GAP }))) {
    col++
    if (col >= 6) {
      col = 0
      row++
    }
  }

  return { x: col * SPOT_GAP, y: row * SPOT_GAP }
}

function organizeLayoutSpots(spots: LayoutSpot[]): LayoutSpot[] {
  const usedPositions = new Set<string>()

  return [...spots]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((spot) => {
      const snappedPosition = snapPosition(spot)
      const position = usedPositions.has(positionKey(snappedPosition))
        ? findNextFreeGridPosition(usedPositions, snappedPosition)
        : snappedPosition

      usedPositions.add(positionKey(position))
      return { ...spot, ...position }
    })
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
  const [layoutSpots, setLayoutSpots] = useState<LayoutSpot[]>([])
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffsetRef = useRef({ startMouseX: 0, startMouseY: 0, startSpotX: 0, startSpotY: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEdit && floorId) {
      const floor = getFloorById(floorId)
      if (floor) {
        setName(floor.name)
        const spots = getSpotsByFloor(floorId)
        setLayoutSpots(
          organizeLayoutSpots(spots.map((s, i) => ({
            id: s.id,
            number: s.number,
            x: s.x ?? (i % 4) * SPOT_GAP,
            y: s.y ?? Math.floor(i / 4) * SPOT_GAP,
          }))),
        )
      }
    }
  }, [isEdit, floorId])

  useEffect(() => {
    if (!draggingId) return

    function onMove(e: PointerEvent) {
      const dx = e.clientX - dragOffsetRef.current.startMouseX
      const dy = e.clientY - dragOffsetRef.current.startMouseY
      const position = snapPosition({
        x: dragOffsetRef.current.startSpotX + dx,
        y: dragOffsetRef.current.startSpotY + dy,
      })
      setLayoutSpots((prev) =>
        prev.map((s) => (s.id === draggingId ? { ...s, ...position } : s)),
      )
    }

    function onUp() {
      setLayoutSpots((prev) => organizeLayoutSpots(prev))
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
    setSelectedId(spot.id)
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
    const organizedSpots = organizeLayoutSpots(layoutSpots)
    if (isEdit && floorId) {
      updateFloor(floorId, name.trim(), '', organizedSpots)
    } else {
      createFloor(name.trim(), '', organizedSpots)
    }
    navigate('/floors')
  }

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <Header title={isEdit ? 'Editar Piso' : 'Novo Piso'} showBack backTo="/floors" />

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Section 1: Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Cadastro de Piso</h2>
          <p className="text-xs text-gray-400 mb-4">
            Configure o nome e layout das vagas do piso
          </p>

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
            <button
              type="button"
              onClick={() => setLayoutSpots((prev) => organizeLayoutSpots(prev))}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 active:bg-blue-100 transition-colors touch-manipulation"
            >
              Organizar Automaticamente
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
                >
                  <CarIcon className="w-5 h-5 text-blue-500 pointer-events-none" />
                  <span className="text-[10px] font-bold text-blue-600 mt-0.5 pointer-events-none">
                    {spot.number}
                  </span>

                  {selectedId === spot.id && draggingId !== spot.id && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setLayoutSpots((prev) => prev.filter((s) => s.id !== spot.id))
                        setSelectedId(null)
                      }}
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
              Dica: Arraste as vagas para ajustar suas posições. Toque em uma vaga e
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
      <div className="sticky bottom-0 z-40 bg-gray-50/95 px-4 py-3 backdrop-blur border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-sm hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
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
