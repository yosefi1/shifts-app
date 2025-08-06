import { useState } from 'react'
import { Box, Typography, Card, CardContent, Button, Grid, Checkbox, FormControlLabel, Alert } from '@mui/material'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'

export default function Availability() {
  const { user } = useAuthStore()
  const { availability, addAvailability, updateAvailability } = useShiftsStore()
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 6),
  })

  const handleToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      nextWeekDates.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isAvailable = selectedDates.includes(dateStr)
        const avail = {
          id: `${user?.id}-${dateStr}`,
          workerId: user?.id || '',
          date: dateStr,
          isAvailable,
        }
        const existing = availability.find((a) => a.id === avail.id)
        if (existing) {
          updateAvailability(avail.id, avail)
        } else {
          addAvailability(avail)
        }
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
      <Typography variant="h4" gutterBottom>
        הגשת זמינות לשבוע הבא
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        סמן את הימים בהם אתה זמין לעבוד בשבוע הבא
      </Alert>
      <Grid container spacing={2}>
        {nextWeekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          return (
            <Grid item xs={6} md={3} key={dateStr}>
              <Card>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedDates.includes(dateStr)}
                        onChange={() => handleToggle(dateStr)}
                      />
                    }
                    label={format(date, 'EEEE dd/MM')}
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        שמור זמינות
      </Button>
    </Box>
  )
} 