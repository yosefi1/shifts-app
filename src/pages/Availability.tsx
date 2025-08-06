import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  TextField,
  Chip,
  Alert,
  Divider,
  Paper,
} from '@mui/material'
import { CalendarToday, Save, CheckCircle } from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'

export default function Availability() {
  const { user } = useAuthStore()
  const { availability, addAvailability, updateAvailability } = useShiftsStore()
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get next week dates
  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 6),
  })

  useEffect(() => {
    // Load existing availability for next week
    const existingAvailability = availability.filter(
      (avail) => avail.workerId === user?.id && avail.date >= format(nextWeekStart, 'yyyy-MM-dd')
    )

    const selected = existingAvailability
      .filter((avail) => avail.isAvailable)
      .map((avail) => avail.date)

    const reasonsMap: Record<string, string> = {}
    existingAvailability.forEach((avail) => {
      if (avail.reason) {
        reasonsMap[avail.date] = avail.reason
      }
    })

    setSelectedDates(selected)
    setReasons(reasonsMap)
  }, [availability, user?.id, nextWeekStart])

  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const handleReasonChange = (date: string, reason: string) => {
    setReasons((prev) => ({
      ...prev,
      [date]: reason,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Remove existing availability for next week
      const existingIds = availability
        .filter(
          (avail) => avail.workerId === user?.id && avail.date >= format(nextWeekStart, 'yyyy-MM-dd')
        )
        .map((avail) => avail.id)

      // Add new availability
      const newAvailability = nextWeekDates.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isAvailable = selectedDates.includes(dateStr)
        const reason = reasons[dateStr] || ''

        return {
          id: `${user?.id}-${dateStr}`,
          workerId: user?.id || '',
          date: dateStr,
          isAvailable,
          reason: isAvailable ? '' : reason,
        }
      })

      // In a real app, this would be an API call
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update store
      newAvailability.forEach((avail) => {
        const existing = availability.find((a) => a.id === avail.id)
        if (existing) {
          updateAvailability(avail.id, avail)
        } else {
          addAvailability(avail)
        }
      })

      toast.success('Availability submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit availability')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDayName = (date: Date) => {
    return format(date, 'EEEE')
  }

  const getDayNumber = (date: Date) => {
    return format(date, 'd')
  }

  const getMonthName = (date: Date) => {
    return format(date, 'MMM')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Set Your Availability
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Mark your availability for the week of {format(nextWeekStart, 'MMMM dd, yyyy')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                Next Week Schedule
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Check the boxes for days you're available to work. Unchecked days will be marked as unavailable.
              </Alert>

              <Grid container spacing={2}>
                {nextWeekDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const isSelected = selectedDates.includes(dateStr)
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6

                  return (
                    <Grid item xs={12} sm={6} key={dateStr}>
                      <Paper
                        elevation={isSelected ? 3 : 1}
                        sx={{
                          p: 2,
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          borderRadius: 2,
                          backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                          opacity: isWeekend ? 0.7 : 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleDateToggle(dateStr)}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {getDayName(date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {getMonthName(date)} {getDayNumber(date)}
                                </Typography>
                              </Box>
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          {isWeekend && (
                            <Chip label="Weekend" size="small" color="secondary" />
                          )}
                        </Box>

                        {!isSelected && (
                          <TextField
                            fullWidth
                            label="Reason for unavailability"
                            value={reasons[dateStr] || ''}
                            onChange={(e) => handleReasonChange(dateStr, e.target.value)}
                            size="small"
                            placeholder="Optional reason..."
                            multiline
                            rows={2}
                          />
                        )}
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CheckCircle /> : <Save />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Availability'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Available Days: {selectedDates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unavailable Days: {7 - selectedDates.length}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Available Days:</strong>
              </Typography>
              {selectedDates.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedDates.map((date) => (
                    <Chip
                      key={date}
                      label={format(new Date(date), 'EEE, MMM d')}
                      color="success"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No days selected
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> Once submitted, you can update your availability until the manager reviews the assignments.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 