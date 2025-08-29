import { useState, useEffect } from 'react'
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
  Alert,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { ArrowBack, AutoFixHigh, Visibility, History, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useShiftsStore } from '../stores/shiftsStore'
import { useSupabaseAuthStore } from '../stores/supabaseAuthStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'

export default function ManagerDashboardNew() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { shifts, setShifts, constraints, getWorkerPreferences } = useShiftsStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [firstShiftTime, setFirstShiftTime] = useState({ start: '20:00', end: '00:00' })
  

  const [shiftTimes, setShiftTimes] = useState({
    first: { start: '20:00', end: '00:00' },
    second: { start: '08:00', end: '12:00' }
  })

  // Calculate second shift based on first shift
  const calculateSecondShift = (firstShift: { start: string, end: string }) => {
    const startHour = parseInt(firstShift.start.split(':')[0])
    const endHour = parseInt(firstShift.end.split(':')[0])
    
    if (startHour === 20 && endHour === 0) {
      return { start: '08:00', end: '12:00' }
    } else if (startHour === 0 && endHour === 4) {
      return { start: '12:00', end: '16:00' }
    } else if (startHour === 4 && endHour === 8) {
      return { start: '16:00', end: '20:00' }
    } else {
      return { start: '08:00', end: '12:00' } // default
    }
  }

  // Update shift times when first shift changes
  const handleFirstShiftChange = (newFirstShift: { start: string, end: string }) => {
    setFirstShiftTime(newFirstShift)
    const secondShift = calculateSecondShift(newFirstShift)
    setShiftTimes({
      first: newFirstShift,
      second: secondShift
    })
  }
  const navigate = useNavigate()

  // Auto-detect if we should show current week or next week
  const now = new Date()
  const currentWeekStart = startOfWeek(now)
  const currentWeekEnd = addDays(currentWeekStart, 6)
  const isCurrentWeekActive = now <= currentWeekEnd
  


  // Auto-set tab based on current week status
  const [tabValue, setTabValue] = useState(isCurrentWeekActive ? 0 : 1)
  
  // Week navigation state
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0)
  
  // Calculate the selected week dates
  const selectedWeekStart = startOfWeek(addDays(now, selectedWeekOffset * 7))
  const selectedWeekDates = eachDayOfInterval({
    start: selectedWeekStart,
    end: addDays(selectedWeekStart, 7),
  })
  
  const getWeekLabel = (offset: number) => {
    if (offset === 0) return 'שבוע נוכחי'
    if (offset === 1) return 'שבוע הבא'
    if (offset === -1) return 'שבוע שעבר'
    return `שבוע ${offset > 0 ? '+' : ''}${offset}`
  }

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון']

  // Get real workers from auth store
  const { getAllUsers } = useSupabaseAuthStore()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  
  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAllUsers()
      setAllUsers(users)
      setWorkers(users.filter(user => user.role === 'worker'))
    }
    loadUsers()
  }, [getAllUsers])

  // Demo positions (based on the photo)
  const demoPositions = [
    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ו\'', 'ז\'', 'ח\'', '20', 'גישרון 11', 'גישרון 17', '5/6', '39א', '39ב', 'סיור 10', 'סיור 10א', 'עתודות', 'אפטרים'
  ]

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Smart auto-assignment algorithm
  const generateNextWeekAssignments = () => {
    setIsGenerating(true)
    const newShifts: any[] = []
    
    // Positions that should not be auto-assigned (manager assigns manually)
    const manualPositions = ['עתודות', 'אפטרים']
    
    // Positions that require male workers only
    const maleOnlyPositions = ['סיור 10', 'סיור 10א']
    
    // Track worker assignments for fairness
    const workerAssignments: { [workerId: string]: { [position: string]: number } } = {}
    
    // Initialize worker assignments tracking
    workers.forEach(worker => {
      workerAssignments[worker.id] = {}
      demoPositions.forEach(position => {
        workerAssignments[worker.id][position] = 0
      })
    })
    
    selectedWeekDates.forEach((date, dayIndex) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const isFirstSunday = dayIndex === 0
      const isLastSunday = dayIndex === 7
      
      demoPositions.forEach((position) => {
        // Skip manual positions
        if (manualPositions.includes(position)) {
          return
        }
        
        // Determine available time slots for this day
        const availableSlots = []
        if (isFirstSunday) {
          availableSlots.push('first')
        } else if (isLastSunday) {
          availableSlots.push('second')
        } else {
          availableSlots.push('first', 'second')
        }
        
        availableSlots.forEach((slot) => {
          // Find available workers for this slot
          let availableWorkers = workers.filter(worker => {
            // Check if worker has constraints for this date/slot
            const hasConstraint = constraints.some(c => 
              c.workerId === worker.id && 
              c.date === dateStr && 
              c.timeSlot === slot &&
              c.isBlocked
            )
            
            if (hasConstraint) return false
            
            // For male-only positions, filter by gender
            if (maleOnlyPositions.includes(position) && worker.gender !== 'male') {
              return false
            }
            
            return true
          })
          
          if (availableWorkers.length === 0) return
          
          // Score workers based on preferences and fairness
          const scoredWorkers = availableWorkers.map(worker => {
            let score = 0
            
            // Get worker preferences
            const workerPrefs = getWorkerPreferences(worker.id)
            
            // Preference scoring (higher score = better match)
            if (workerPrefs) {
              if (workerPrefs.preferPosition1 === position) score += 10
              else if (workerPrefs.preferPosition2 === position) score += 6
              else if (workerPrefs.preferPosition3 === position) score += 3
            }
            
            // Fairness scoring (fewer assignments = higher score)
            const currentAssignments = workerAssignments[worker.id][position] || 0
            score += (10 - currentAssignments) * 2 // Bonus for fewer assignments
            
            // Random factor to break ties
            score += Math.random()
            
            return { worker, score }
          })
          
          // Sort by score (highest first)
          scoredWorkers.sort((a, b) => b.score - a.score)
          
          const assignedWorker = scoredWorkers[0]?.worker
          
          if (assignedWorker) {
            // Update assignment tracking
            workerAssignments[assignedWorker.id][position] = 
              (workerAssignments[assignedWorker.id][position] || 0) + 1
            
            const shiftTime = shiftTimes[slot as keyof typeof shiftTimes]
            newShifts.push({
              id: `${dateStr}-${position}-${slot}`,
              date: dateStr,
              startTime: shiftTime?.start || '08:00',
              endTime: shiftTime?.end || '12:00',
              station: position,
              workerId: assignedWorker.id,
              workerName: assignedWorker.name,
              status: 'assigned' as const,
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

  const renderCurrentWeekTable = () => {
    if (isMobile) {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              📱 תצוגה מותאמת לטלפון - כל עמדה בכרטיס נפרד
            </Typography>
          </Alert>
          {demoPositions.map((position) => (
            <Card key={position} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {position}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                     {selectedWeekDates.map((date, index) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const shift = shifts.find(s => s.date === dateStr && s.station === position)
                    
                    return (
                      <Box key={dateStr} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {hebrewDays[index]}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(date, 'dd/MM')}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120 }}>
                          {shift ? (
                            <Select
                              value={shift.workerId}
                              onChange={e => handleWorkerChange(shift.id, e.target.value as string)}
                              size="small"
                              fullWidth
                            >
                              {workers.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                  {w.name}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              לא משובץ
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )
    }

    return (
      <Box>
        <TableContainer
          component={Paper}
          className="table-scroll-container"
          sx={{ 
            width: '100%', 
            overflowX: 'auto',
            '& th:first-of-type, & td:first-of-type': { pr: 0 }
          }}
        >
          <Table size="small" sx={{ 
            '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
            '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
          }}>
            <TableHead>
              <TableRow>
                                 <TableCell sx={{ fontWeight: 'bold', width: '20%', fontSize: '1.1rem' }}>עמדה</TableCell>
                                  {selectedWeekDates.map((date, index) => (
                   <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center', width: '11.4%', pl: index === 0 ? 0 : undefined }}>
                     <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 'bold' }}>
                       {hebrewDays[index]}
                     </Typography>
                     <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' }, fontWeight: 'bold' }}>
                       {format(date, 'dd/MM')}
                     </Typography>
                   </TableCell>
                 ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {demoPositions.map((position) => (
                <TableRow key={position}>
                  <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>{position}</TableCell>
                                     {selectedWeekDates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const shift = shifts.find(s => s.date === dateStr && s.station === position)
                    
                    return (
                      <TableCell key={dateStr} align="center" sx={{ width: '11.4%' }}>
                        {shift ? (
                          <Select
                            value={shift.workerId}
                            onChange={e => handleWorkerChange(shift.id, e.target.value as string)}
                            size="small"
                            sx={{ 
                              minWidth: { xs: 60, sm: 80 },
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              '& .MuiSelect-select': {
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                padding: { xs: '4px 8px', sm: '8px 12px' }
                              }
                            }}
                          >
                            {workers.map((w) => (
                              <MenuItem key={w.id} value={w.id} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                {w.name}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                            לא משובץ
                          </Typography>
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
  }

  const renderNextWeekTable = () => {
    if (isMobile) {
      return (
        <Box>
          {/* Dynamic Shift Time Selection */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>שעות משמרות</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
              <Typography variant="subtitle2">בחר משמרת:</Typography>
              <Select
                value={`${firstShiftTime.start}-${firstShiftTime.end}`}
                onChange={(e) => {
                  const [start, end] = e.target.value.split('-')
                  handleFirstShiftChange({ start, end })
                }}
                size="small"
                fullWidth
              >
                <MenuItem value="20:00-00:00">20:00-00:00 → 08:00-12:00</MenuItem>
                <MenuItem value="00:00-04:00">00:00-04:00 → 12:00-16:00</MenuItem>
                <MenuItem value="04:00-08:00">04:00-08:00 → 16:00-20:00</MenuItem>
              </Select>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={generateNextWeekAssignments} 
              disabled={isGenerating}
              startIcon={<AutoFixHigh />}
              sx={{ flex: 1 }}
            >
              {isGenerating ? 'יוצר שיבוצים חכם...' : 'יצירת שיבוצים חכם אוטומטי'}
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setShifts([])}
              disabled={isGenerating}
              startIcon={<Delete />}
              sx={{ minWidth: '120px' }}
            >
              נקה הכל
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>אלגוריתם חכם:</strong> המערכת מתחשבת ב:
              <br />• אילוצי עובדים (מתי לא יכולים לעבוד)
              <br />• העדפות עובדים (מיקומים מועדפים)
              <br />• הוגנות (חלוקה מאוזנת של משמרות)
              <br />• דרישות מיוחדות (סיור 10/10א - גברים בלבד)
              <br />• עתודות ואפטרים - לא מוקצים אוטומטית
            </Typography>
          </Alert>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              📱 תצוגה מותאמת לטלפון - כל עמדה בכרטיס נפרד
            </Typography>
          </Alert>
          
          {demoPositions.map((position) => (
            <Card key={position} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {position}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                     {selectedWeekDates.map((date, dayIndex) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isFirstSunday = dayIndex === 0
                    const isLastSunday = dayIndex === 7
                    
                    const availableSlots = []
                    if (isFirstSunday) {
                      availableSlots.push('first')
                    } else if (isLastSunday) {
                      availableSlots.push('second')
                    } else {
                      availableSlots.push('first', 'second')
                    }
                    
                    return (
                      <Box key={dateStr} sx={{ 
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {hebrewDays[dayIndex]}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {format(date, 'dd/MM')}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {availableSlots.map((slot) => {
                            const shiftId = `${dateStr}-${position}-${slot}`
                            const existingShift = shifts.find(s => s.id === shiftId)
                            const shiftTime = shiftTimes[slot as keyof typeof shiftTimes]
                            
                            return (
                              <Box key={slot} sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 1,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 1
                              }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {shiftTime.start}-{shiftTime.end}
                                </Typography>
                                <Box sx={{ minWidth: 120 }}>
                                  <Select
                                    value={existingShift?.workerId || ''}
                                    onChange={e => handleWorkerChange(shiftId, e.target.value as string)}
                                    size="small"
                                    fullWidth
                                  >
                                    <MenuItem value="">
                                      <em>בחר עובד</em>
                                    </MenuItem>
                                    {workers.map((w) => (
                                      <MenuItem key={w.id} value={w.id}>
                                        {w.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                              </Box>
                            )
                          })}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )
    }

    return (
      <Box>
        {/* Dynamic Shift Time Selection */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>שעות משמרות</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
            <Typography variant="subtitle2">בחר משמרת:</Typography>
            <Select
              value={`${firstShiftTime.start}-${firstShiftTime.end}`}
              onChange={(e) => {
                const [start, end] = e.target.value.split('-')
                handleFirstShiftChange({ start, end })
              }}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
            >
              <MenuItem value="20:00-00:00">20:00-00:00 → 08:00-12:00</MenuItem>
              <MenuItem value="00:00-04:00">00:00-04:00 → 12:00-16:00</MenuItem>
              <MenuItem value="04:00-08:00">04:00-08:00 → 16:00-20:00</MenuItem>
            </Select>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={generateNextWeekAssignments} 
            disabled={isGenerating}
            startIcon={<AutoFixHigh />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isGenerating ? 'יוצר שיבוצים חכם...' : 'יצירת שיבוצים חכם אוטומטי'}
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => setShifts([])}
            disabled={isGenerating}
            startIcon={<Delete />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            נקה הכל
          </Button>
        </Box>

        <Alert severity="success" sx={{ mb: 2, display: { xs: 'block', sm: 'none' } }}>
          <Typography variant="body2">
            ✅ גרסה חדשה! הטבלה מותאמת למסך הטלפון - {new Date().toLocaleTimeString()}
          </Typography>
        </Alert>

        <Box>
          <TableContainer
            component={Paper}
            className="table-scroll-container"
            sx={{ 
              width: '100%', 
              overflowX: 'auto',
              '& th:first-of-type, & td:first-of-type': { pr: 0 }
            }}
          >
                      <Table size="small" sx={{ 
            '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
            '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>עמדה</TableCell>
                                                                           {selectedWeekDates.map((date, index) => (
                     <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center', width: '11.4%', pl: index === 0 ? 0 : undefined }}>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                        {hebrewDays[index]}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' } }}>
                        {format(date, 'dd/MM')}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {demoPositions.map((position) => (
                  <TableRow key={position}>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%', pr: 0, pl: 0 }}>{position}</TableCell>
                    {selectedWeekDates.map((date, dayIndex) => {
                      const dateStr = format(date, 'yyyy-MM-dd')
                      const isFirstSunday = dayIndex === 0
                      const isLastSunday = dayIndex === 7
                      
                      // For Sundays, only show one shift (evening for first Sunday, morning for last Sunday)
                      const availableSlots = []
                      if (isFirstSunday) {
                        availableSlots.push('first')
                      } else if (isLastSunday) {
                        availableSlots.push('second')
                      } else {
                        availableSlots.push('first', 'second')
                      }
                    
                      return (
                        <TableCell key={dateStr} align="center" sx={{ width: '11.4%' }}>
                          {availableSlots.map((slot, slotIndex) => {
                            const shiftId = `${dateStr}-${position}-${slot}`
                            const existingShift = shifts.find(s => s.id === shiftId)
                            const shiftTime = shiftTimes[slot as keyof typeof shiftTimes]
                            
                            return (
                              <Box key={slot} sx={{ mb: slotIndex > 0 ? 0.5 : 0 }}>
                                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.6rem' }}>
                                  {shiftTime?.start}-{shiftTime?.end}
                                </Typography>
                                <Select
                                  value={existingShift?.workerId || ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const worker = workers.find(w => w.id === e.target.value)
                                      if (existingShift) {
                                        handleWorkerChange(existingShift.id, e.target.value)
                                      } else {
                                        // Create new shift
                                        const newShift = {
                                          id: shiftId,
                                          date: dateStr,
                                          startTime: shiftTime?.start || '08:00',
                                          endTime: shiftTime?.end || '12:00',
                                          station: position,
                                          workerId: e.target.value,
                                          workerName: worker?.name || '',
                                          status: 'assigned' as const,
                                        }
                                        setShifts([...shifts, newShift])
                                      }
                                    }
                                  }}
                                  size="small"
                                  sx={{ 
                                    minWidth: { xs: 60, sm: 80 },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    '& .MuiSelect-select': {
                                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                      padding: { xs: '4px 8px', sm: '8px 12px' }
                                    }
                                  }}
                                  displayEmpty
                                >
                                  <MenuItem value="" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: 'inherit' }}>בחר</Typography>
                                  </MenuItem>
                                  {workers.map((w) => (
                                    <MenuItem key={w.id} value={w.id} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                      {w.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Box>
                            )
                          })}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        

      </Box>
    )
  }

  const renderConstraintsTable = () => {
    // Use the already fetched data from the top level
    const allUsers = getAllUsers()
    
    const workerConstraints = allUsers.filter(user => user.role === 'worker').map(worker => {
      const workerConstraints = constraints.filter(c => c.workerId === worker.id)
      return {
        worker,
        constraints: workerConstraints
      }
    })

    return (
      <Box>

        
        
        
        <TableContainer
          component={Paper}
          className="table-scroll-container"
          sx={{ 
            width: '100%', 
            '& th:first-of-type, & td:first-of-type': { pr: 0 }
          }}
        >
          <Table size="small" sx={{ 
            '& .MuiTableRow-root > *:first-of-type': { pr: 0, pl: 0, textAlign: 'right' },
            '& .MuiTableRow-root > *:nth-of-type(2)': { pl: 0 }
          }}>
                         <TableHead>
               <TableRow>
                 <TableCell sx={{ fontWeight: 'bold', width: '20%', pr: 0, pl: 0, textAlign: 'center' }}>עובד</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', width: '20%', textAlign: 'center' }}>תאריך</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', width: '20%', textAlign: 'center' }}>משמרת</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', width: '40%', textAlign: 'center' }}>הסבר</TableCell>
               </TableRow>
             </TableHead>
            <TableBody>
              {workerConstraints.map(({ worker, constraints }) =>
                constraints.length === 0 ? (
                                     <TableRow key={worker.id}>
                     <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '20%', textAlign: 'center' }}>{worker.name}</TableCell>
                     <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '20%', textAlign: 'center' }}>
                       <Chip label="אין אילוצים" color="success" size="small" />
                     </TableCell>
                     <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '20%', textAlign: 'center' }}></TableCell>
                     <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '40%', textAlign: 'center' }}></TableCell>
                   </TableRow>
                ) : (
                  constraints.map((constraint) => (
                                         <TableRow key={constraint.id}>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, pr: 0, pl: 0, width: '20%', textAlign: 'center' }}>{worker.name}</TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '20%', textAlign: 'center' }}>
                         {format(new Date(constraint.date), 'dd/MM/yyyy')}
                       </TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '20%', textAlign: 'center' }}>
                         {constraint.timeSlot === 'second' ? '08:00-12:00' : 
                          constraint.timeSlot === 'first' ? '20:00-00:00' : 
                          constraint.timeSlot === 'morning' ? '08:00-12:00' : '20:00-00:00'}
                       </TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' }, width: '40%', textAlign: 'center' }}>
                         {constraint.reason || 'לא צוין הסבר'}
                       </TableCell>
                     </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
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
                 <Typography variant="h4" sx={{ color: 'blue', fontSize: '2rem' }}>
           🎯 ניהול שיבוצים - מנהל {new Date().toLocaleTimeString()} - Fixed 🎯
         </Typography>
      </Box>

             {/* Week Navigation */}
       <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
         <Button
           variant="outlined"
           size="small"
           onClick={() => setSelectedWeekOffset(prev => prev - 1)}
           disabled={selectedWeekOffset <= -4}
         >
           שבוע קודם
         </Button>
         <Typography variant="h6" sx={{ minWidth: 120, textAlign: 'center' }}>
           {getWeekLabel(selectedWeekOffset)}
         </Typography>
         <Button
           variant="outlined"
           size="small"
           onClick={() => setSelectedWeekOffset(prev => prev + 1)}
           disabled={selectedWeekOffset >= 4}
         >
           שבוע הבא
         </Button>
         <Button
           variant="outlined"
           size="small"
           onClick={() => setSelectedWeekOffset(0)}
         >
           שבוע נוכחי
         </Button>
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