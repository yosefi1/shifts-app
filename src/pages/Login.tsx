import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebaseStore } from '../stores/firebaseStore'
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material'

export default function Login() {
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useFirebaseStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const user = await login(userId)
      if (user) {
        if (user.role === 'manager') {
          navigate('/manager')
        } else {
          navigate('/availability')
        }
      } else {
        setError('משתמש לא נמצא')
      }
    } catch (err) {
      setError('שגיאה בהתחברות')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            התחברות למערכת ניהול משמרות
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="מספר אישי"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              margin="normal"
              required
              autoFocus
              dir="rtl"
            />
            
            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
            
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              מנהל: הכנס 0
              <br />
              עובד: הכנס מספר אישי
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 