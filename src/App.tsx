import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSupabaseAuthStore } from './stores/supabaseAuthStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import Shifts from './pages/Shifts'
import Workers from './pages/Workers'
import Availability from './pages/Availability'
import Constraints from './pages/Constraints'

export default function App() {
  const { user, checkSession } = useSupabaseAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        await checkSession()
      } catch (error) {
        console.error('Failed to check session:', error)
      } finally {
        setIsLoading(false)
      }
    }
    initApp()
  }, [checkSession])

  // Show loading while checking session
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        טוען...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/constraints" element={<Constraints />} />
        {user.role === 'manager' && <Route path="/manager" element={<ManagerDashboard />} />}
        {user.role === 'manager' && <Route path="/workers" element={<Workers />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
