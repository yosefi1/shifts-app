import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material'
import { People } from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (user?.role === 'manager') {
    return (
      <Box dir="rtl">
        <Typography variant="h4" gutterBottom>
          ברוך הבא, {user?.name}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">ניהול שיבוצים</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  צפייה בשיבוצים נוכחיים, יצירת שיבוצים חדשים וניהול אילוצי עובדים
                </Typography>
                <Button variant="contained" fullWidth onClick={() => navigate('/manager')}>
                  עבור לניהול שיבוצים
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People />
                  ניהול עובדים
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  הוספה, עריכה ומחיקה של עובדים במערכת
                </Typography>
                <Button variant="contained" fullWidth onClick={() => navigate('/workers')}>
                  עבור לניהול עובדים
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">סטטיסטיקות</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  סקירה כללית של השיבוצים והעובדים במערכת
                </Typography>
                <Button variant="outlined" fullWidth disabled>
                  בקרוב
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">סטטיסטיקות</Typography>
              <Button variant="outlined" fullWidth disabled>
                בקרוב
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 