import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Availability from './pages/Availability'
import Shifts from './pages/Shifts'
import ManagerDashboard from './pages/ManagerDashboardNew'
import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/shifts" element={<Shifts />} />
        {user.role === 'manager' && <Route path="/manager" element={<ManagerDashboard />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
} 