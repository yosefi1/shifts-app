import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from '@mui/material'
import {
  Schedule,
  Person,
  CheckCircle,
  Warning,
  TrendingUp,
  Assignment,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { shifts, availability } = useShiftsStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalShifts: 0,
    completedShifts: 0,
    upcomingShifts: 0,
    availabilitySubmitted: false,
  })

  useEffect(() => {
    // Calculate stats based on user role
    const userShifts = shifts.filter((shift) => shift.workerId === user?.id)
    const nextWeekStart = startOfWeek(addDays(new Date(), 7))
    const nextWeekEnd = addDays(nextWeekStart, 6)

    const upcomingShifts = userShifts.filter((shift) => {
      const shiftDate = new Date(shift.date)
      return shiftDate >= new Date() && shiftDate <= nextWeekEnd
    })

    const hasAvailability = availability.some(
      (avail) => avail.workerId === user?.id && avail.date >= format(nextWeekStart, 'yyyy-MM-dd')
    )

    setStats({
      totalShifts: userShifts.length,
      completedShifts: userShifts.filter((s) => new Date(s.date) < new Date()).length,
      upcomingShifts: upcomingShifts.length,
      availabilitySubmitted: hasAvailability,
    })
  }, [shifts, availability, user?.id])

  const getUpcomingShifts = () => {
    return shifts
      .filter((shift) => shift.workerId === user?.id)
      .filter((shift) => new Date(shift.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  const getQuickActions = () => {
    if (user?.role === 'manager') {
      return [
        {
          title: 'Review Assignments',
          description: 'Review and approve shift assignments',
          icon: <Assignment />,
          action: () => navigate('/manager'),
          color: 'primary',
        },
        {
          title: 'View All Shifts',
          description: 'See complete shift schedule',
          icon: <Schedule />,
          action: () => navigate('/manager'),
          color: 'secondary',
        },
      ]
    }

    return [
      {
        title: 'Set Availability',
        description: 'Mark your availability for next week',
        icon: <Schedule />,
        action: () => navigate('/availability'),
        color: stats.availabilitySubmitted ? 'success' : 'warning',
      },
      {
        title: 'View My Shifts',
        description: 'Check your assigned shifts',
        icon: <Person />,
        action: () => navigate('/shifts'),
        color: 'primary',
      },
    ]
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's your shift management overview
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Shifts</Typography>
              </Box>
              <Typography variant="h4">{stats.totalShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4">{stats.completedShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Upcoming</Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {stats.availabilitySubmitted ? (
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                ) : (
                  <Warning color="warning" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6">Availability</Typography>
              </Box>
              <Chip
                label={stats.availabilitySubmitted ? 'Submitted' : 'Pending'}
                color={stats.availabilitySubmitted ? 'success' : 'warning'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                {getQuickActions().map((action, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={action.action}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: `${action.color}.main` }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.title}
                      secondary={action.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Shifts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Shifts
              </Typography>
              {getUpcomingShifts().length > 0 ? (
                <List>
                  {getUpcomingShifts().map((shift) => (
                    <ListItem key={shift.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <Schedule fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${shift.station} - ${format(new Date(shift.date), 'MMM dd, yyyy')}`}
                        secondary={`${shift.startTime} - ${shift.endTime}`}
                      />
                      <Chip
                        label={shift.status}
                        color={shift.status === 'approved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming shifts scheduled
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/availability')}
                    sx={{ mt: 1 }}
                  >
                    Set Availability
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Bar for Availability */}
        {user?.role === 'worker' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Next Week Availability
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {stats.availabilitySubmitted ? 'Availability submitted' : 'Availability not submitted'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.availabilitySubmitted ? '100%' : '0%'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.availabilitySubmitted ? 100 : 0}
                  color={stats.availabilitySubmitted ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                {!stats.availabilitySubmitted && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/availability')}
                    sx={{ mt: 2 }}
                  >
                    Set Availability Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
} 