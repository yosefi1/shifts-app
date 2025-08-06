import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Availability from './pages/Availability'
import Shifts from './pages/Shifts'
import ManagerDashboard from './pages/ManagerDashboard'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/shifts" element={<Shifts />} />
          {user?.role === 'manager' && (
            <Route path="/manager" element={<ManagerDashboard />} />
          )}
        </Routes>
      </Layout>
    </Box>
  )
}

export default App 