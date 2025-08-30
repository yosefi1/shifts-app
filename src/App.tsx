import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useFirebaseStore } from './stores/firebaseStore'
import { initializeFirebaseData } from './lib/initFirebaseData'
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
  const { initialize } = useFirebaseStore()

  useEffect(() => {
    // Initialize Firebase store and data
    const setupFirebase = async () => {
      try {
        await initialize()
        await initializeFirebaseData()
      } catch (error) {
        console.error('Failed to initialize Firebase:', error)
      }
    }
    setupFirebase()
  }, [initialize])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="manager" element={<ManagerDashboard />} />
          <Route path="manager-new" element={<ManagerDashboardNew />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="workers" element={<Workers />} />
          <Route path="availability" element={<Availability />} />
          <Route path="constraints" element={<Constraints />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
 
 