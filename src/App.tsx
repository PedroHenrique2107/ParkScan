import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AllFloorsMapPage from './pages/AllFloorsMapPage'
import FloorsPage from './pages/FloorsPage'
import FloorConfigPage from './pages/FloorConfigPage'
import FloorMapPage from './pages/FloorMapPage'
import SearchPage from './pages/SearchPage'
import HistoryPage from './pages/HistoryPage'
import { runDailyMaintenance } from './services/dailyMaintenance'

export default function App() {
  useEffect(() => {
    runDailyMaintenance()

    const interval = window.setInterval(runDailyMaintenance, 60_000)
    document.addEventListener('visibilitychange', runDailyMaintenance)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', runDailyMaintenance)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="floor-map" element={<AllFloorsMapPage />} />
        <Route path="floors" element={<FloorsPage />} />
        <Route path="floors/new" element={<FloorConfigPage />} />
        <Route path="floors/edit/:floorId" element={<FloorConfigPage />} />
        <Route path="floors/:floorId" element={<FloorMapPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
