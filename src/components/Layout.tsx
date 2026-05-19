import { useRef, useState, type TouchEvent } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

const REFRESH_PULL_DISTANCE = 90

export default function Layout() {
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLElement>(null)

  function handleTouchStart(e: TouchEvent<HTMLElement>) {
    if (scrollRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY
    }
  }

  function handleTouchMove(e: TouchEvent<HTMLElement>) {
    if (startYRef.current === null || scrollRef.current?.scrollTop !== 0) return

    const distance = e.touches[0].clientY - startYRef.current
    setPullDistance(Math.min(Math.max(distance, 0), REFRESH_PULL_DISTANCE + 28))
  }

  function handleTouchEnd() {
    if (pullDistance >= REFRESH_PULL_DISTANCE) {
      window.location.reload()
      return
    }

    startYRef.current = null
    setPullDistance(0)
  }

  return (
    <div className="app-shell flex flex-col h-full bg-gray-50">
      <main
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative flex-1 overflow-y-auto overscroll-contain"
      >
        <div
          className="pointer-events-none sticky top-0 z-50 flex justify-center overflow-hidden transition-[height] duration-150"
          style={{ height: pullDistance }}
        >
          <div className="mt-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm border border-blue-100">
            {pullDistance >= REFRESH_PULL_DISTANCE ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </div>
        </div>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
