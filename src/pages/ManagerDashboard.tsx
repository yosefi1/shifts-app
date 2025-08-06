import { useState } from 'react'
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material'
import { useShiftsStore } from '../stores/shiftsStore'
import { useAuthStore } from '../stores/authStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'

export default function ManagerDashboard() {
  const { shifts, setShifts, stations } = useShiftsStore()
  const { user } = useAuthStore()
  const [isGenerating, setIsGenerating] = useState(false)

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 6),
  })

  // Simple demo workers for assignment
  const workers = [
    { id: '2', name: 'עובד 2' },
    { id: '3', name: 'עובד 3' },
  ]

  // Generate automatic assignments (simple round-robin)
  const generateAssignments = () => {
    setIsGenerating(true)
    const newShifts = []
    let workerIndex = 0
    nextWeekDates.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      stations.forEach((station) => {
        const worker = workers[workerIndex % workers.length]
        newShifts.push({
          id: `${dateStr}-${station.id}`,
          date: dateStr,
          startTime: '08:00',
          endTime: '16:00',
          station: station.name,
          workerId: worker.id,
          workerName: worker.name,
          status: 'assigned',
        })
        workerIndex++
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

  return (
    <Box dir="rtl">
      <Typography variant="h4" gutterBottom>
        ניהול משמרות לשבוע הבא
      </Typography>
      <Button variant="contained" color="primary" onClick={generateAssignments} disabled={isGenerating} sx={{ mb: 3 }}>
        יצירת שיבוצים אוטומטית
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>תאריך</TableCell>
              <TableCell>עמדה</TableCell>
              <TableCell>עובד</TableCell>
              <TableCell>שעות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{format(new Date(shift.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{shift.station}</TableCell>
                <TableCell>
                  <Select
                    value={shift.workerId}
                    onChange={e => handleWorkerChange(shift.id, e.target.value as string)}
                    size="small"
                  >
                    {workers.map((w) => (
                      <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
} 