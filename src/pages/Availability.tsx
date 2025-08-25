import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material'
import { ArrowBack, Info, Edit, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'

export default function Availability() {
  const { user } = useAuthStore()
  const { constraints, addConstraint, removeConstraint, addPreference, updatePreference, getWorkerPreferences } = useShiftsStore()
  const [constraintDialog, setConstraintDialog] = useState<{ open: boolean; date: string; timeSlot: string }>({
    open: false,
    date: '',
    timeSlot: ''
  })
  const [constraintReason, setConstraintReason] = useState('')
  const [preferences, setPreferences] = useState({
    notes: '',
    preferPosition1: '',
    preferPosition2: '',
    preferPosition3: ''
  })

  // Load existing preferences on component mount
  useEffect(() => {
    if (user) {
      const existingPreferences = getWorkerPreferences(user.id)
      if (existingPreferences) {
        setPreferences({
          notes: existingPreferences.notes,
          preferPosition1: existingPreferences.preferPosition1,
          preferPosition2: existingPreferences.preferPosition2,
          preferPosition3: existingPreferences.preferPosition3
        })
      }
    }
  }, [user, getWorkerPreferences])
  const navigate = useNavigate()

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 7), // 8 days total (ראשון-ראשון)
  })

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון']
  const timeSlots = [
    { id: 'first', label: '20:00-00:00', description: 'משמרת ראשונה' },
    { id: 'second', label: '08:00-12:00', description: 'משמרת שנייה' }
  ]
  
  const availablePositions = [
    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ו\'', 'ז\'', 'ח\'', '20', 
    'גישרון 11', 'גישרון 17', '5/6', '39א', '39ב', 
    'סיור 10', 'סיור 10א', 'עתודות', 'אפטרים'
  ]

  const handleAddConstraint = (date: string, timeSlot: string) => {
    setConstraintDialog({ open: true, date, timeSlot })
    setConstraintReason('')
  }

  const handleConstraintSave = () => {
    const { date, timeSlot } = constraintDialog
    if (!user) return

    addConstraint({
      workerId: user.id,
      date,
      timeSlot: timeSlot as 'first' | 'second',
      reason: constraintReason,
      isBlocked: true
    })

    setConstraintDialog({ open: false, date: '', timeSlot: '' })
    setConstraintReason('')
    toast.success('אילוץ נוסף בהצלחה')
  }

  const handleConstraintCancel = () => {
    setConstraintDialog({ open: false, date: '', timeSlot: '' })
    setConstraintReason('')
  }

  const handleRemoveConstraint = (constraintId: string) => {
    removeConstraint(constraintId)
    toast.success('אילוץ הוסר בהצלחה')
  }

  const getConstraintForShift = (date: string, timeSlot: string) => {
    if (!user) return null
    return constraints.find(c => 
      c.workerId === user.id && 
      c.date === date && 
      c.timeSlot === timeSlot
    )
  }

  const hasConstraint = (date: string, timeSlot: string) => {
    return getConstraintForShift(date, timeSlot) !== null
  }

  const handleToggleConstraint = (date: string, timeSlot: string) => {
    const constraint = getConstraintForShift(date, timeSlot)
    if (constraint) {
      // Remove constraint if it exists
      removeConstraint(constraint.id)
      toast.success('אילוץ הוסר')
    } else {
      // Add constraint if it doesn't exist
      handleAddConstraint(date, timeSlot)
    }
  }

  return (
    <Box dir="rtl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          סימון אילוצים לשבוע הבא
          <Tooltip title="סמן את המשמרות בהן אתה לא יכול לעבוד">
            <IconButton size="small" sx={{ ml: 1 }}>
              <Info />
            </IconButton>
          </Tooltip>
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>הוראות:</strong> סמן את המשמרות בהן אתה <strong>לא יכול</strong> לעבוד בשבוע הבא.
          משמרות לא מסומנות ייחשבו כזמינות שלך לעבודה.
          <br />
          <strong>הערה:</strong> ראשון הראשון - רק משמרת ערב (20:00-00:00), ראשון האחרון - רק משמרת בוקר (08:00-12:00).
          <br />
          <strong>טיפ:</strong> לחץ על העיפרון כדי להוסיף הסבר לאילוץ.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TableContainer component={Paper} sx={{ maxWidth: '600px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '25%', py: 1 }}>יום</TableCell>
                {timeSlots.map((slot) => (
                  <TableCell key={slot.id} sx={{ fontWeight: 'bold', textAlign: 'center', width: '37.5%', py: 1 }}>
                    {slot.label}
                    <Typography variant="caption" display="block" color="textSecondary">
                      {slot.description}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          <TableBody>
            {nextWeekDates.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const dayName = hebrewDays[index]
              const dayNumber = format(date, 'dd/MM')
              const isFirstSunday = index === 0
              const isLastSunday = index === 7
              
              return (
                <TableRow key={dateStr} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Typography variant="body1">{dayName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {dayNumber}
                    </Typography>
                  </TableCell>
                  {timeSlots.map((slot) => {
                    const isChecked = hasConstraint(dateStr, slot.id)
                    const constraint = getConstraintForShift(dateStr, slot.id)
                    
                    // Hide morning shift for first Sunday
                    if (isFirstSunday && slot.id === 'first') {
                      return <TableCell key={slot.id} align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">לא זמין</Typography>
                      </TableCell>
                    }
                    
                    // Hide evening shift for last Sunday
                    if (isLastSunday && slot.id === 'second') {
                      return <TableCell key={slot.id} align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">לא זמין</Typography>
                      </TableCell>
                    }
                    
                    return (
                      <TableCell key={slot.id} align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggleConstraint(dateStr, slot.id)}
                                sx={{
                                  '&.Mui-checked': {
                                    color: 'error.main',
                                  },
                                }}
                                size="small"
                              />
                            }
                            label=""
                          />
                          {isChecked && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setConstraintReason(constraint?.reason || '')
                                  setConstraintDialog({ open: true, date: dateStr, timeSlot: slot.id })
                                }}
                                sx={{ p: 0.5 }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              {constraint?.reason && (
                                <Chip
                                  label={constraint.reason}
                                  onDelete={() => handleRemoveConstraint(constraint.id)}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  icon={<Delete fontSize="small" />}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
                     </TableBody>
         </Table>
       </TableContainer>
       </Box>

      {/* Preferences Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Paper sx={{ p: 2, maxWidth: '500px', width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
            העדפות עבודה
            <Tooltip title="ציין העדפות עבודה כלליות ומיקומים מועדפים">
              <IconButton size="small" sx={{ ml: 1 }}>
                <Info />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* General Notes */}
            <TextField
              label="הערות כלליות"
              multiline
              rows={2}
              value={preferences.notes}
              onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
              placeholder="לדוגמה: אני מעדיף משמרות בוקר, יש לי העדפה לעבוד בסופי שבוע..."
              fullWidth
              dir="rtl"
              size="small"
            />
            
            <Divider />
            
                         {/* Position Preferences */}
             <Box>
               <Typography variant="subtitle2" sx={{ mb: 1 }}>מיקומים מועדפים (לפי סדר עדיפות)</Typography>
               <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                 <FormControl sx={{ minWidth: 100 }}>
                   <InputLabel>עדיפות ראשונה</InputLabel>
                   <Select
                     value={preferences.preferPosition1}
                     onChange={(e) => setPreferences({ ...preferences, preferPosition1: e.target.value })}
                     label="עדיפות ראשונה"
                     size="small"
                   >
                     <MenuItem value="">
                       <em>בחר מיקום</em>
                     </MenuItem>
                     {availablePositions.map((position) => (
                       <MenuItem key={position} value={position}>{position}</MenuItem>
                     ))}
                   </Select>
                 </FormControl>
                 
                 <FormControl sx={{ minWidth: 100 }}>
                   <InputLabel>עדיפות שנייה</InputLabel>
                   <Select
                     value={preferences.preferPosition2}
                     onChange={(e) => setPreferences({ ...preferences, preferPosition2: e.target.value })}
                     label="עדיפות שנייה"
                     size="small"
                   >
                     <MenuItem value="">
                       <em>בחר מיקום</em>
                     </MenuItem>
                     {availablePositions.map((position) => (
                       <MenuItem key={position} value={position}>{position}</MenuItem>
                     ))}
                   </Select>
                 </FormControl>
                 
                 <FormControl sx={{ minWidth: 100 }}>
                   <InputLabel>עדיפות שלישית</InputLabel>
                   <Select
                     value={preferences.preferPosition3}
                     onChange={(e) => setPreferences({ ...preferences, preferPosition3: e.target.value })}
                     label="עדיפות שלישית"
                     size="small"
                   >
                     <MenuItem value="">
                       <em>בחר מיקום</em>
                     </MenuItem>
                     {availablePositions.map((position) => (
                       <MenuItem key={position} value={position}>{position}</MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Box>
             </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (!user) return
            
            // Save preferences
            const existingPreferences = getWorkerPreferences(user.id)
            if (existingPreferences) {
              updatePreference(user.id, {
                notes: preferences.notes,
                preferPosition1: preferences.preferPosition1,
                preferPosition2: preferences.preferPosition2,
                preferPosition3: preferences.preferPosition3
              })
            } else {
              addPreference({
                workerId: user.id,
                notes: preferences.notes,
                preferPosition1: preferences.preferPosition1,
                preferPosition2: preferences.preferPosition2,
                preferPosition3: preferences.preferPosition3
              })
            }
            
            toast.success('הזמינות והעדפות נשמרו בהצלחה!')
          }}
        >
          שמור זמינות והעדפות
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          חזור
        </Button>
      </Box>

      {/* Note Dialog */}
      <Dialog open={constraintDialog.open} onClose={handleConstraintCancel} maxWidth="sm" fullWidth>
        <DialogTitle>הוסף הסבר לאילוץ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="הסבר מדוע אינך יכול לעבוד במשמרת זו"
            fullWidth
            multiline
            rows={3}
            value={constraintReason}
            onChange={(e) => setConstraintReason(e.target.value)}
            placeholder="לדוגמה: יש לי פגישה רפואית, אני בחופשה, יש לי אירוע משפחתי..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConstraintCancel}>ביטול</Button>
          <Button onClick={handleConstraintSave} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 