import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './Icons'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  right?: React.ReactNode
}

export default function Header({ title, subtitle, showBack = false, backTo, right }: HeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center h-14 px-4 gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full text-gray-600 active:bg-gray-100 touch-manipulation"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </header>
  )
}
