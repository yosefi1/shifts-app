import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton
} from '@mui/material'
import { ArrowBack, Add, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuthStore } from '../stores/supabaseAuthStore'
import { format, addDays, startOfWeek } from 'date-fns'
import { he } from 'date-fns/locale'

export default function Constraints() {
  const navigate = useNavigate()
  const { user, getConstraints, addConstraint, removeConstraint } = useSupabaseAuthStore()
  
  const [constraints, setConstraints] = useState<any[]>([])
  const [newConstraint, setNewConstraint] = useState({
    date: '',
    timeSlot: 'first',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Generate next 7 days
  const today = new Date()
  const nextWeekDates = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  // Load existing constraints
  useEffect(() => {
    const loadConstraints = async () => {
      try {
        const data = await getConstraints()
        // Filter constraints for current user only
        const userConstraints = data.filter((c: any) => c.workerId === user?.id)
        setConstraints(userConstraints)
      } catch (error) {
        console.error('Failed to load constraints:', error)
        setError('שגיאה בטעינת האילוצים')
      }
    }
    
    if (user) {
      loadConstraints()
    }
  }, [user, getConstraints])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const constraint = {
        id: `${user.id}-${newConstraint.date}-${newConstraint.timeSlot}`,
        workerId: user.id,
        date: newConstraint.date,
        timeSlot: newConstraint.timeSlot,
        reason: newConstraint.reason,
        isBlocked: true,
        created_at: new Date().toISOString()
      }

      await addConstraint(constraint)
      
      // Add to local state
      setConstraints([...constraints, constraint])
      
      // Reset form
      setNewConstraint({ date: '', timeSlot: 'first', reason: '' })
      setSuccess('האילוץ נוסף בהצלחה!')
    } catch (error) {
      setError('שגיאה בהוספת האילוץ')
      console.error('Add constraint error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (constraintId: string) => {
    try {
      await removeConstraint(constraintId)
      setConstraints(constraints.filter(c => c.id !== constraintId))
      setSuccess('האילוץ נמחק בהצלחה!')
    } catch (error) {
      setError('שגיאה במחיקת האילוץ')
      console.error('Delete constraint error:', error)
    }
  }

  const getTimeSlotText = (timeSlot: string) => {
    switch (timeSlot) {
      case 'first': return '20:00-00:00'
      case 'second': return '08:00-12:00'
      default: return timeSlot
    }
  }

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, 'EEEE', { locale: he })
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">יש להתחבר כדי לראות אילוצים</Typography>
      </Box>
    )
  }

  return (
    <Box dir="rtl" sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: 'blue' }}>
          ניהול אילוצים
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          כאן תוכל להוסיף אילוצים (מתי לא תוכל לעבוד) למנהלים
        </Typography>
      </Alert>

      {/* Add new constraint form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>הוסף אילוץ חדש</Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>תאריך</InputLabel>
            <Select
              value={newConstraint.date}
              onChange={(e) => setNewConstraint({ ...newConstraint, date: e.target.value })}
              label="תאריך"
              required
            >
              {nextWeekDates.map((date) => (
                <MenuItem key={format(date, 'yyyy-MM-dd')} value={format(date, 'yyyy-MM-dd')}>
                  {getDayName(format(date, 'yyyy-MM-dd'))} - {format(date, 'dd/MM/yyyy')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>משמרת</InputLabel>
            <Select
              value={newConstraint.timeSlot}
              onChange={(e) => setNewConstraint({ ...newConstraint, timeSlot: e.target.value })}
              label="משמרת"
              required
            >
              <MenuItem value="first">20:00-00:00 (ערב)</MenuItem>
              <MenuItem value="second">08:00-12:00 (בוקר)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="סיבה"
            value={newConstraint.reason}
            onChange={(e) => setNewConstraint({ ...newConstraint, reason: e.target.value })}
            required
            multiline
            rows={3}
            placeholder="למה לא תוכל לעבוד? (חופשה, פגישה רפואית, וכו')"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<Add />}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isSubmitting ? 'מוסיף...' : 'הוסף אילוץ'}
          </Button>
        </Box>
      </Paper>

      {/* Show error/success messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Display existing constraints */}
      <Typography variant="h6" sx={{ mb: 2 }}>האילוצים שלך</Typography>
      
      {constraints.length === 0 ? (
        <Alert severity="info">
          אין לך אילוצים עדיין. הוסף אילוץ חדש למעלה.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {constraints.map((constraint) => (
            <Card key={constraint.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      {getDayName(constraint.date)} - {format(new Date(constraint.date), 'dd/MM/yyyy')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      משמרת: {getTimeSlotText(constraint.timeSlot)}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {constraint.reason}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(constraint.id)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
