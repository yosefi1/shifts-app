import { useState } from 'react'
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, isToday, isPast, isFuture } from 'date-fns'

export default function Shifts() {
  const { user } = useAuthStore()
  const { shifts } = useShiftsStore()
  const [tabValue, setTabValue] = useState(0)
  const navigate = useNavigate()

  const userShifts = shifts.filter((shift) => shift.workerId === user?.id)
  const upcomingShifts = userShifts.filter((shift) => isFuture(new Date(shift.date)))
  const todayShifts = userShifts.filter((shift) => isToday(new Date(shift.date)))
  const pastShifts = userShifts.filter((shift) => isPast(new Date(shift.date)))

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const renderShiftList = (shiftList: typeof userShifts) => {
    if (shiftList.length === 0) {
      return <Typography align="center">אין משמרות</Typography>
    }
    return (
      <List>
        {shiftList.map((shift) => (
          <ListItem key={shift.id}>
            <ListItemText
              primary={shift.station}
              secondary={format(new Date(shift.date), 'dd/MM/yyyy') + ' | ' + shift.startTime + '-' + shift.endTime}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <Box dir="rtl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          המשמרות שלי
        </Typography>
      </Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="קרובות" />
        <Tab label="היום" />
        <Tab label="עבר" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && renderShiftList(upcomingShifts)}
        {tabValue === 1 && renderShiftList(todayShifts)}
        {tabValue === 2 && renderShiftList(pastShifts)}
      </Box>
    </Box>
  )
} 