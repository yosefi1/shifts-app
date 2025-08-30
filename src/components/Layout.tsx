import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNeonStore } from '../stores/neonStore'
import { Schedule, People, Dashboard, ExitToApp } from '@mui/icons-material'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useNeonStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('userId')
    window.location.reload() // Simple way to reset the app state
  }

  const menuItems = currentUser?.role === 'manager' ? [
    { text: 'דשבורד', icon: <Dashboard />, path: '/dashboard' },
    { text: 'ניהול שיבוצים', icon: <Schedule />, path: '/manager-dashboard' },
    { text: 'עובדים', icon: <People />, path: '/workers' },
    { text: 'שיבוצים', icon: <Schedule />, path: '/shifts' }
  ] : [
    { text: 'דשבורד', icon: <Dashboard />, path: '/dashboard' },
    { text: 'אילוצים', icon: <Schedule />, path: '/availability' },
    { text: 'שיבוצים', icon: <Schedule />, path: '/shifts' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* User Info */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #34495e',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            {currentUser?.name}
          </div>
          <div style={{ fontSize: '14px', color: '#bdc3c7' }}>
            {currentUser?.role === 'manager' ? 'מנהל' : 'עובד'}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '15px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
                borderLeft: location.pathname === item.path ? '4px solid #3498db' : '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <ExitToApp />
            התנתק
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {children}
      </div>
    </div>
  )
}

export default Layout 