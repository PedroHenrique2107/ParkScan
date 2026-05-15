import { useState, useRef, useEffect } from 'react'

interface AutocompleteProps {
  value: string
  onChange: (val: string) => void
  suggestions: string[]
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
  const [filtered, setFiltered] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = value.trim().toLowerCase()
    if (!q) {
      setFiltered([])
      setOpen(false)
      return
    }
    const results = suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .sort((a, b) => {
        const ai = a.toLowerCase().indexOf(q)
        const bi = b.toLowerCase().indexOf(q)
        return ai - bi
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
              key={item}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(item)
                setOpen(false)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                onChange(item)
                setOpen(false)
              }}
              className="px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 active:bg-blue-100 border-b border-gray-50 last:border-0"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
