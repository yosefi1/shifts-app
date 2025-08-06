import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItemIcon,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
} from '@mui/material'
import {
  Schedule,
  Assignment,
  CalendarToday,
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shifts-tabpanel-${index}`}
      aria-labelledby={`shifts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Shifts() {
  const { user } = useAuthStore()
  const { shifts } = useShiftsStore()
  const [tabValue, setTabValue] = useState(0)

  const userShifts = shifts.filter((shift) => shift.workerId === user?.id)

  const upcomingShifts = userShifts.filter((shift) => isFuture(new Date(shift.date)))
  const todayShifts = userShifts.filter((shift) => isToday(new Date(shift.date)))
  const pastShifts = userShifts.filter((shift) => isPast(new Date(shift.date)))

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'assigned':
        return 'info'
      default:
        return 'default'
    }
  }

  const getShiftIcon = (date: string) => {
    if (isToday(new Date(date))) {
      return <CalendarToday color="primary" />
    } else if (isTomorrow(new Date(date))) {
      return <Schedule color="secondary" />
    }
    return <Assignment />
  }

  const renderShiftList = (shiftList: typeof userShifts) => {
    if (shiftList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No shifts found
          </Typography>
        </Box>
      )
    }

    return (
      <List>
        {shiftList
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((shift) => (
            <Card key={shift.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getShiftIcon(shift.date)}
                    </Avatar>
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{shift.station}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(shift.date), 'EEEE, MMMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Chip
                    label={shift.status}
                    color={getShiftStatusColor(shift.status) as any}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {shift.startTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {shift.endTime}
                    </Typography>
                  </Grid>
                </Grid>

                {shift.genderRequirement && shift.genderRequirement !== 'any' && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`${shift.genderRequirement} only`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
      </List>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Shifts
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your assigned shifts
      </Typography>

      {todayShifts.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {todayShifts.length} shift(s) today!
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="shifts tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Upcoming</Typography>
                {upcomingShifts.length > 0 && (
                  <Chip label={upcomingShifts.length} size="small" color="primary" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Today</Typography>
                {todayShifts.length > 0 && (
                  <Chip label={todayShifts.length} size="small" color="warning" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Past</Typography>
                {pastShifts.length > 0 && (
                  <Chip label={pastShifts.length} size="small" color="default" />
                )}
              </Box>
            }
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderShiftList(upcomingShifts)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderShiftList(todayShifts)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderShiftList(pastShifts)}
        </TabPanel>
      </Paper>

      {userShifts.length === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Shifts Assigned
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You don't have any shifts assigned yet. Make sure to set your availability for next week.
            </Typography>
            <Button variant="contained" href="/availability">
              Set Availability
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
} 