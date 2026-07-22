import { useState, useRef, useEffect } from 'react'

export interface AutocompleteOption {
  value: string
  searchText?: string
}

interface AutocompleteProps {
  value: string
  onChange: (val: string) => void
  suggestions: readonly AutocompleteOption[]
  placeholder?: string
  className?: string
  id?: string
}

export default function Autocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  id,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState<AutocompleteOption[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = normalizeSearch(value)
    if (!q) {
      setFiltered([])
      setOpen(false)
      return
    }
    const results = suggestions
      .filter((suggestion) => (suggestion.searchText ?? normalizeSearch(suggestion.value)).includes(q))
      .sort((a, b) => {
        const ai = normalizeSearch(a.value).indexOf(q)
        const bi = normalizeSearch(b.value).indexOf(q)
        const aRank = ai === 0 ? 0 : ai > 0 ? 1 : 2
        const bRank = bi === 0 ? 0 : bi > 0 ? 1 : 2
        return aRank - bRank || ai - bi || a.value.localeCompare(b.value, 'pt-BR')
      })
      .slice(0, 10)
    setFiltered(results)
    setOpen(results.length > 0)
  }, [value, suggestions])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item.value}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(item.value)
                setOpen(false)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                onChange(item.value)
                setOpen(false)
              }}
              className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 active:bg-blue-100 border-b border-gray-50 last:border-0"
            >
              {item.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Normaliza texto para que a busca não dependa de acentos ou caixa. */
function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}
