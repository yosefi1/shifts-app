import { useState } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material'

const users = {
  '1': { id: '1', name: 'מנהל', role: 'manager' },
  '2': { id: '2', name: 'עובד 2', role: 'worker' },
  '3': { id: '3', name: 'עובד 3', role: 'worker' },
}

export default function Login() {
  const [personalNumber, setPersonalNumber] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (users[personalNumber]) {
      localStorage.setItem('user', JSON.stringify(users[personalNumber]))
      window.location.reload()
    } else {
      setError('מספר אישי לא תקין')
    }
  }

  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f0ff 0%, #fafafa 100%)' }}>
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            כניסה למערכת
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