import { useState } from 'react'
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
  DialogActions
} from '@mui/material'
import { ArrowBack, Info, Edit } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'

interface ConstraintNote {
  date: string
  timeSlot: string
  note: string
}

export default function Availability() {
  const { user } = useAuthStore()
  const { availability, addAvailability, updateAvailability } = useShiftsStore()
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [constraintNotes, setConstraintNotes] = useState<ConstraintNote[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; date: string; timeSlot: string }>({
    open: false,
    date: '',
    timeSlot: ''
  })
  const [currentNote, setCurrentNote] = useState('')
  const navigate = useNavigate()

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 7), // 8 days total (ראשון-ראשון)
  })

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון']
  const timeSlots = [
    { id: 'morning', label: '08:00-12:00', description: 'משמרת בוקר' },
    { id: 'evening', label: '20:00-00:00', description: 'משמרת ערב' }
  ]

  const handleToggle = (date: string, timeSlot: string) => {
    const key = `${date}-${timeSlot}`
    const isCurrentlySelected = selectedDates.includes(key)
    
    if (isCurrentlySelected) {
      // Unchecking - remove from selected and remove note
      setSelectedDates((prev) => prev.filter((d) => d !== key))
      setConstraintNotes((prev) => prev.filter((note) => !(note.date === date && note.timeSlot === timeSlot)))
    } else {
      // Checking - add to selected and open note dialog
      setSelectedDates((prev) => [...prev, key])
      const existingNote = constraintNotes.find((note) => note.date === date && note.timeSlot === timeSlot)
      setCurrentNote(existingNote?.note || '')
      setNoteDialog({ open: true, date, timeSlot })
    }
  }

  const handleNoteSave = () => {
    const { date, timeSlot } = noteDialog
    setConstraintNotes((prev) => {
      const filtered = prev.filter((note) => !(note.date === date && note.timeSlot === timeSlot))
      return [...filtered, { date, timeSlot, note: currentNote }]
    })
    setNoteDialog({ open: false, date: '', timeSlot: '' })
    setCurrentNote('')
  }

  const handleNoteCancel = () => {
    // If canceling, also uncheck the constraint
    const { date, timeSlot } = noteDialog
    const key = `${date}-${timeSlot}`
    setSelectedDates((prev) => prev.filter((d) => d !== key))
    setNoteDialog({ open: false, date: '', timeSlot: '' })
    setCurrentNote('')
  }

  const getNoteForShift = (date: string, timeSlot: string) => {
    return constraintNotes.find((note) => note.date === date && note.timeSlot === timeSlot)?.note || ''
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      nextWeekDates.forEach((date, index) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isFirstSunday = index === 0 // First Sunday
        const isLastSunday = index === 7 // Last Sunday
        
        timeSlots.forEach((slot) => {
          // Skip morning shift for first Sunday (only evening available)
          if (isFirstSunday && slot.id === 'morning') return
          // Skip evening shift for last Sunday (only morning available)
          if (isLastSunday && slot.id === 'evening') return
          
          const key = `${dateStr}-${slot.id}`
          const isAvailable = !selectedDates.includes(key) // Inverted logic - checked means NOT available
          const note = getNoteForShift(dateStr, slot.id)
          const avail = {
            id: `${user?.id}-${dateStr}-${slot.id}`,
            workerId: user?.id || '',
            date: dateStr,
            timeSlot: slot.id,
            isAvailable,
            note: note || undefined,
          }
          const existing = availability.find((a) => a.id === avail.id)
          if (existing) {
            updateAvailability(avail.id, avail)
          } else {
            addAvailability(avail)
          }
        })
      })
      toast.success('הזמינות נשמרה בהצלחה!')
    } catch {
      toast.error('שגיאה בשמירת הזמינות')
    } finally {
      setIsSubmitting(false)
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

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>יום</TableCell>
              {timeSlots.map((slot) => (
                <TableCell key={slot.id} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
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
                    const key = `${dateStr}-${slot.id}`
                    const isChecked = selectedDates.includes(key)
                    const note = getNoteForShift(dateStr, slot.id)
                    
                    // Hide morning shift for first Sunday
                    if (isFirstSunday && slot.id === 'morning') {
                      return <TableCell key={slot.id} align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">לא זמין</Typography>
                      </TableCell>
                    }
                    
                    // Hide evening shift for last Sunday
                    if (isLastSunday && slot.id === 'evening') {
                      return <TableCell key={slot.id} align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">לא זמין</Typography>
                      </TableCell>
                    }
                    
                    return (
                      <TableCell key={slot.id} align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggle(dateStr, slot.id)}
                                sx={{
                                  '&.Mui-checked': {
                                    color: 'error.main',
                                  },
                                }}
                              />
                            }
                            label=""
                          />
                          {isChecked && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCurrentNote(note)
                                  setNoteDialog({ open: true, date: dateStr, timeSlot: slot.id })
                                }}
                                sx={{ p: 0.5 }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              {note && (
                                <Typography variant="caption" color="textSecondary" sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {note}
                                </Typography>
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

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'שומר...' : 'שמור אילוצים'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          חזור
        </Button>
      </Box>

      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onClose={handleNoteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>הוסף הסבר לאילוץ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="הסבר מדוע אינך יכול לעבוד במשמרת זו"
            fullWidth
            multiline
            rows={3}
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="לדוגמה: יש לי פגישה רפואית, אני בחופשה, יש לי אירוע משפחתי..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteCancel}>ביטול</Button>
          <Button onClick={handleNoteSave} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 