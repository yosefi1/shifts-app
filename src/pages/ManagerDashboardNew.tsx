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

export default function ManagerDashboardNew() {
  const { shifts, setShifts, availability } = useShiftsStore()
  const [tabValue, setTabValue] = useState(0)
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

  // Demo positions (based on the photo)
  const demoPositions = [
    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ו\'', 'ז\'', 'ח\'', '20', 'גישרון 11', 'גישרון 17', '5/6', '39א', '39ב', 'סיור 10', 'סיור 10א', 'עתודות', 'אפטרים'
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
        if (isFirstSunday) {
          availableSlots.push('first')
        } else if (isLastSunday) {
          availableSlots.push('second')
        } else {
          availableSlots.push('first', 'second')
        }
        
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

     const renderCurrentWeekTable = () => (
     <Box sx={{ overflowX: 'auto' }}>
       <TableContainer component={Paper} sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
         <Table size="small">
           <TableHead>
             <TableRow>
               <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>עמדה</TableCell>
               {currentWeekDates.map((date, index) => (
                 <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: 60 }}>
                   <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                     {hebrewDays[index]}
                   </Typography>
                   <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>
                     {format(date, 'dd/MM')}
                   </Typography>
                 </TableCell>
               ))}
             </TableRow>
           </TableHead>
           <TableBody>
             {demoPositions.map((position) => (
               <TableRow key={position}>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>{position}</TableCell>
                 {currentWeekDates.map((date) => {
                   const dateStr = format(date, 'yyyy-MM-dd')
                   const shift = shifts.find(s => s.date === dateStr && s.station === position)
                   
                   return (
                     <TableCell key={dateStr} align="center" sx={{ minWidth: 60 }}>
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

     const renderNextWeekTable = () => (
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
       
       <Button 
         variant="contained" 
         color="primary" 
         onClick={generateNextWeekAssignments} 
         disabled={isGenerating}
         startIcon={<AutoFixHigh />}
         sx={{ mb: 2, width: { xs: '100%', sm: 'auto' } }}
       >
         {isGenerating ? 'יוצר שיבוצים...' : 'יצירת שיבוצים אוטומטית'}
       </Button>

       <Box sx={{ overflowX: 'auto' }}>
         <TableContainer component={Paper} sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
           <Table size="small">
             <TableHead>
               <TableRow>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>עמדה</TableCell>
                 {nextWeekDates.map((date, index) => (
                   <TableCell key={format(date, 'yyyy-MM-dd')} sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: 60 }}>
                     <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                       {hebrewDays[index]}
                     </Typography>
                     <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>
                       {format(date, 'dd/MM')}
                     </Typography>
                   </TableCell>
                 ))}
               </TableRow>
             </TableHead>
             <TableBody>
               {demoPositions.map((position) => (
                 <TableRow key={position}>
                   <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>{position}</TableCell>
                   {nextWeekDates.map((date, dayIndex) => {
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
                       <TableCell key={dateStr} align="center" sx={{ minWidth: 60 }}>
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

     const renderConstraintsTable = () => {
     const workerConstraints = workers.map(worker => {
       const workerAvail = availability.filter(avail => avail.workerId === worker.id)
       return {
         worker,
         constraints: workerAvail.filter(avail => !avail.isAvailable)
       }
     })

     return (
       <Box sx={{ overflowX: 'auto' }}>
         <TableContainer component={Paper} sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
           <Table size="small">
             <TableHead>
               <TableRow>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>עובד</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>תאריך</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>משמרת</TableCell>
                 <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>הסבר</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {workerConstraints.map(({ worker, constraints }) =>
                 constraints.length === 0 ? (
                   <TableRow key={worker.id}>
                     <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>{worker.name}</TableCell>
                     <TableCell colSpan={3} align="center">
                       <Chip label="אין אילוצים" color="success" size="small" />
                     </TableCell>
                   </TableRow>
                 ) : (
                   constraints.map((constraint) => (
                     <TableRow key={constraint.id}>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>{worker.name}</TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>
                         {format(new Date(constraint.date), 'dd/MM/yyyy')}
                       </TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>
                         {constraint.timeSlot === 'morning' ? '08:00-12:00' : '20:00-00:00'}
                       </TableCell>
                       <TableCell sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}>
                         {constraint.note || 'לא צוין הסבר'}
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
          🎯 ניהול שיבוצים - מנהל {new Date().toLocaleTimeString()} 🎯
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
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

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && renderCurrentWeekTable()}
        {tabValue === 1 && renderNextWeekTable()}
        {tabValue === 2 && renderConstraintsTable()}
        {tabValue === 3 && renderPreviousAssignments()}
      </Box>
    </Box>
  )
 } 