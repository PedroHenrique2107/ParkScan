import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <main className="flex-1 overflow-y-auto overscroll-none">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
