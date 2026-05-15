import { NavLink } from 'react-router-dom'
import { HomeIcon, MapIcon, SearchIcon, ClockIcon } from './Icons'

const tabs = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/floors', label: 'Pisos', Icon: MapIcon },
  { to: '/search', label: 'Buscar', Icon: SearchIcon },
  { to: '/history', label: 'Histórico', Icon: ClockIcon },
]

export default function BottomNav() {
  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex h-16">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors touch-manipulation ${
                isActive ? 'text-blue-600' : 'text-gray-500 active:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
