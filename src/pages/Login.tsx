import { useState } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [personalNumber, setPersonalNumber] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = login(personalNumber)
    if (user) {
      navigate('/')
    } else {
      setError('מספר אישי לא תקין (0-17)')
    }
  }

  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f0ff 0%, #fafafa 100%)' }}>
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            כניסה למערכת
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
            מספר אישי: 0 (מנהל) או 1-17 (עובדים)
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="מספר אישי"
              variant="outlined"
              fullWidth
              value={personalNumber}
              onChange={e => setPersonalNumber(e.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { direction: 'rtl' } }}
              sx={{ mb: 2 }}
            />
            {error && <Typography color="error" align="center">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              כניסה
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
} 