import React, { useState } from 'react'
import { useSupabaseAuthStore } from '../stores/supabaseAuthStore'

const Login: React.FC = () => {
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useSupabaseAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const user = await login(userId)
      if (user) {
        // Store user ID in localStorage for persistence
        localStorage.setItem('userId', userId)
        // No need to navigate - App.tsx will handle routing
      } else {
        setError('מזהה משתמש לא תקין')
      }
    } catch (err) {
      setError('שגיאה בהתחברות')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>התחברות למערכת</h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="הכנס מספר אישי"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !userId.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
        
        {error && (
          <div style={{
            marginTop: '1rem',
            color: '#dc3545',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <div style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p>מספרים אישיים לבדיקה:</p>
          <p><strong>0</strong> - מנהל</p>
          <p><strong>8863762</strong> - עובד</p>
          <p><strong>1234567</strong> - עובד</p>
        </div>
      </div>
    </div>
  )
}

export default Login 