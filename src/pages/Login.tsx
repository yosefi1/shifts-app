import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material'
import { Person, Lock } from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'

// Demo users for testing
const demoUsers = [
  {
    id: '1',
    name: 'John Worker',
    email: 'john@example.com',
    role: 'worker' as const,
    gender: 'male' as const,
    department: 'Production',
  },
  {
    id: '2',
    name: 'Sarah Worker',
    email: 'sarah@example.com',
    role: 'worker' as const,
    gender: 'female' as const,
    department: 'Production',
  },
  {
    id: '3',
    name: 'Mike Manager',
    email: 'mike@example.com',
    role: 'manager' as const,
    department: 'Management',
  },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuthStore()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple demo login - in real app, this would be API call
    const user = demoUsers.find((u) => u.email === email)
    if (user && password === 'password') {
      login(user)
    } else {
      setError('Invalid email or password. Use any demo email with password: password')
    }
  }

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email)
    setPassword('password')
    login(user)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Grid container spacing={3} maxWidth="1200px">
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Shifts App
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Professional Shift Management System
                </Typography>
              </Box>

              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  type="email"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  type="password"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Typography variant="h6" gutterBottom>
                Demo Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click any account to login instantly (password: password)
              </Typography>

              <List>
                {demoUsers.map((user, index) => (
                  <ListItem
                    key={user.id}
                    button
                    onClick={() => handleDemoLogin(user)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: user.role === 'manager' ? 'primary.main' : 'secondary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={`${user.role} • ${user.department}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.9)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Welcome to Shifts App
              </Typography>
              <Typography variant="body1" paragraph>
                A professional shift management system designed to streamline workforce scheduling.
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Features:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Workers can mark their availability for upcoming weeks" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Automatic shift assignment based on availability and requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Manager approval and manual adjustment capabilities" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Mobile-responsive design for access anywhere" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Real-time updates and notifications" />
                  </ListItem>
                </List>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  How it works:
                </Typography>
                <Typography variant="body2" paragraph>
                  1. Workers log in and set their availability for the next week
                </Typography>
                <Typography variant="body2" paragraph>
                  2. The system automatically assigns shifts based on availability and station requirements
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Managers review and can adjust assignments as needed
                </Typography>
                <Typography variant="body2">
                  4. Workers receive their final schedules
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 