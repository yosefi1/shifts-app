import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <Box dir="rtl">
      <Typography variant="h4" gutterBottom>
        ברוך הבא, {user?.name}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">הגשת זמינות</Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/availability')}>
                עבור להגשת זמינות
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">המשמרות שלי</Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/shifts')}>
                עבור למשמרות
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {user?.role === 'manager' && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">ניהול משמרות</Typography>
                <Button variant="contained" fullWidth onClick={() => navigate('/manager')}>
                  עבור לניהול
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
} 