import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useNeonStore } from './stores/neonStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import ManagerDashboardNew from './pages/ManagerDashboardNew'
import Shifts from './pages/Shifts'
import Workers from './pages/Workers'
import Availability from './pages/Availability'
import Constraints from './pages/Constraints'

function App() {
  const { currentUser, login, initialize } = useNeonStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      try {
        await initialize()
        
        // Check for stored user ID in localStorage
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
          await login(storedUserId)
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initApp()
  }, [initialize, login])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        טוען... Loading...
      </div>
    )
  }

  if (!currentUser) {
    return <Login />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            currentUser.role === 'manager' ? <ManagerDashboard /> : <Dashboard />
          } />
          <Route path="/manager-dashboard" element={
            currentUser.role === 'manager' ? <ManagerDashboardNew /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/workers" element={
            currentUser.role === 'manager' ? <Workers /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/availability" element={<Availability />} />
          <Route path="/constraints" element={<Constraints />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
