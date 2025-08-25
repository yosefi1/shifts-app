import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Select, 
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert
} from '@mui/material'
import { ArrowBack, AutoFixHigh, Visibility, History } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'

export default function ManagerDashboard() {
  const { shifts, setShifts, availability } = useShiftsStore()
  const [tabValue, setTabValue] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const navigate = useNavigate()

  const currentWeekStart = startOfWeek(new Date())
  const currentWeekDates = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 7),
  })

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 7),
  })

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון']

  // Demo workers
  const workers = [
    { id: '2', name: 'עובד 2' },
    { id: '3', name: 'עובד 3' },
  ]

  // Demo positions (based on the image)
  const demoPositions = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
    '20', '516', 'גישרון 11', 'גישרון 17', '39 א', '39 ב', 'סיור 10', 'סיור 10א'
  ]

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Auto-assignment algorithm
  const generateNextWeekAssignments = () => {
    setIsGenerating(true)
    const newShifts: any[] = []
    
    nextWeekDates.forEach((date, dayIndex) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const isFirstSunday = dayIndex === 0
      const isLastSunday = dayIndex === 7
      
      demoPositions.forEach((position, positionIndex) => {
        // Determine available time slots for this day
        const availableSlots = []
        if (!isFirstSunday) availableSlots.push('morning')
        if (!isLastSunday) availableSlots.push('evening')
        
        availableSlots.forEach((slot) => {
          // Find available workers for this slot
          const availableWorkers = workers.filter(worker => {
            const workerAvailability = availability.find(avail => 
              avail.workerId === worker.id && 
              avail.date === dateStr && 
              avail.timeSlot === slot
            )
            return !workerAvailability || workerAvailability.isAvailable
          })
          
          // Assign worker (simple round-robin for demo)
          const assignedWorker = availableWorkers[positionIndex % availableWorkers.length] || availableWorkers[0]
          
          if (assignedWorker) {
            newShifts.push({
              id: `${dateStr}-${position}-${slot}`,
              date: dateStr,
              startTime: slot === 'morning' ? '08:00' : '20:00',
              endTime: slot === 'morning' ? '12:00' : '00:00',
              station: position,
              workerId: assignedWorker.id,
              workerName: assignedWorker.name,
              status: 'assigned',
            })
          }
        })
      })
    })
    
    setShifts(newShifts)
    setIsGenerating(false)
  }

  const handleWorkerChange = (shiftId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId)
    setShifts(
      shifts.map((shift) =>
        shift.id === shiftId ? { ...shift, workerId, workerName: worker?.name || '' } : shift
      )
    )
  }

  const renderCurrentWeekTable = () => (
    <TableContainer
      component={Paper}
      className="table-scroll-container"
      sx={{ 
        width: '100%', 
        overflowX: 'auto',
        '& th:first-of-type, & td:first-of-type': { pr: 0 }
      }}
    >
      <Table sx={{ 
        '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
        '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>עמדה</TableCell>
            {currentWeekDates.map((date, index) => (
              <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {hebrewDays[index]}
                <Typography variant="caption" display="block">
                  {format(date, 'dd/MM')}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {demoPositions.slice(0, 10).map((position) => (
            <TableRow key={position}>
              <TableCell sx={{ fontWeight: 'bold' }}>{position}</TableCell>
              {currentWeekDates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const shift = shifts.find(s => s.date === dateStr && s.station === position)
                
                return (
                  <TableCell key={dateStr} align="center">
                    {shift ? (
                      <Select
                        value={shift.workerId}
                        onChange={e => handleWorkerChange(shift.id, e.target.value as string)}
                        size="small"
                        sx={{ minWidth: 100 }}
                      >
                        {workers.map((w) => (
                          <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Typography variant="caption" color="textSecondary">לא משובץ</Typography>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderNextWeekTable = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>אילוצים נאספו עד רביעי.</strong> ביום חמישי-שישי יפורסם השיבוץ הבא.
        </Typography>
      </Alert>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={generateNextWeekAssignments} 
        disabled={isGenerating}
        startIcon={<AutoFixHigh />}
        sx={{ mb: 2 }}
      >
        {isGenerating ? 'יוצר שיבוצים...' : 'יצירת שיבוצים אוטומטית'}
      </Button>

      <TableContainer
        component={Paper}
        className="table-scroll-container"
        sx={{ 
          width: '100%', 
          overflowX: 'auto',
          '& th:first-of-type, & td:first-of-type': { pr: 0 }
        }}
      >
        <Table sx={{ 
          '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
          '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', pr: 0, pl: 0 }}>עמדה</TableCell>
              {nextWeekDates.map((date, index) => (
                <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {hebrewDays[index]}
                  <Typography variant="caption" display="block">
                    {format(date, 'dd/MM')}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {demoPositions.slice(0, 10).map((position) => (
              <TableRow key={position}>
                <TableCell sx={{ fontWeight: 'bold', pr: 0, pl: 0 }}>{position}</TableCell>
                {nextWeekDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const shift = shifts.find(s => s.date === dateStr && s.station === position)
                  
                  return (
                    <TableCell key={dateStr} align="center">
                      {shift ? (
                        <Select
                          value={shift.workerId}
                          onChange={e => handleWorkerChange(shift.id, e.target.value as string)}
                          size="small"
                          sx={{ minWidth: 100 }}
                        >
                          {workers.map((w) => (
                            <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Typography variant="caption" color="textSecondary">לא משובץ</Typography>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  const renderConstraintsTable = () => {
    const workerConstraints = workers.map(worker => {
      const workerAvail = availability.filter(avail => avail.workerId === worker.id)
      return {
        worker,
        constraints: workerAvail.filter(avail => !avail.isAvailable)
      }
    })

    return (
      <TableContainer
        component={Paper}
        className="table-scroll-container"
        sx={{ 
          width: '100%', 
          overflowX: 'auto',
          '& th:first-of-type, & td:first-of-type': { pr: 0 }
        }}
      >
        <Table sx={{ 
          '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
          '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
        }}>
          <TableHead>
            <TableRow>
                             <TableCell sx={{ fontWeight: 'bold', pr: 0, pl: 0 }}>עובד</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>משמרת</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>הסבר</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workerConstraints.map(({ worker, constraints }) =>
              constraints.length === 0 ? (
                <TableRow key={worker.id}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell colSpan={3} align="center">
                    <Chip label="אין אילוצים" color="success" size="small" />
                  </TableCell>
                </TableRow>
              ) : (
                constraints.map((constraint) => (
                  <TableRow key={constraint.id}>
                    <TableCell sx={{ pr: 0, pl: 0 }}>{worker.name}</TableCell>
                    <TableCell>{format(new Date(constraint.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {constraint.timeSlot === 'morning' ? '08:00-12:00' : '20:00-00:00'}
                    </TableCell>
                    <TableCell>
                      {constraint.note || 'לא צוין הסבר'}
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const renderPreviousAssignments = () => (
    <Alert severity="info">
      <Typography variant="body2">
        כאן יוצגו השיבוצים הקודמים. רק מנהלים יכולים לראות היסטוריה זו.
      </Typography>
    </Alert>
  )

  return (
    <Box dir="rtl" sx={{ maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: 'red', fontSize: '2rem' }}>
          🚨 ניהול משמרות - TEST! {new Date().toLocaleTimeString()} 🚨
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3, px: 0 }}>
        <Tab 
          icon={<Visibility />} 
          label="שבוע נוכחי" 
          iconPosition="start"
        />
        <Tab 
          icon={<AutoFixHigh />} 
          label="שיבוץ הבא" 
          iconPosition="start"
        />
        <Tab 
          icon={<Visibility />} 
          label="אילוצים" 
          iconPosition="start"
        />
        <Tab 
          icon={<History />} 
          label="היסטוריה" 
          iconPosition="start"
        />
      </Tabs>

      <Box sx={{ mt: 2, px: 0 }}>
        {tabValue === 0 && renderCurrentWeekTable()}
        {tabValue === 1 && renderNextWeekTable()}
        {tabValue === 2 && renderConstraintsTable()}
        {tabValue === 3 && renderPreviousAssignments()}
      </Box>
    </Box>
  )
} 