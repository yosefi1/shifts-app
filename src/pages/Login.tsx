import { useState } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material'
import { useSupabaseAuthStore } from '../stores/supabaseAuthStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [personalNumber, setPersonalNumber] = useState('')
  const [error, setError] = useState('')
  const { login } = useSupabaseAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const user = await login(personalNumber)
      if (user) {
        navigate('/')
      } else {
        setError('מספר אישי לא תקין או לא נמצא במערכת')
      }
    } catch (error) {
      setError('שגיאה בחיבור למסד הנתונים')
    } finally {
      setIsLoading(false)
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
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'כניסה'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
} 