import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Assignment,
  CheckCircle,
  Edit,
  Save,
  Cancel,
  AutoAwesome,
  People,
  Schedule,
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useShiftsStore } from '../stores/shiftsStore'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'

// Demo workers for testing
const demoWorkers = [
  { id: '1', name: 'John Worker', gender: 'male', department: 'Production' },
  { id: '2', name: 'Sarah Worker', gender: 'female', department: 'Production' },
  { id: '3', name: 'Mike Worker', gender: 'male', department: 'Production' },
  { id: '4', name: 'Lisa Worker', gender: 'female', department: 'Production' },
]

// Demo stations
const demoStations: Station[] = [
  { id: '1', name: 'Assembly Line A', genderRequirement: 'any', maxWorkers: 2, priority: 1 },
  { id: '2', name: 'Quality Control', genderRequirement: 'female', maxWorkers: 1, priority: 2 },
  { id: '3', name: 'Heavy Lifting', genderRequirement: 'male', maxWorkers: 1, priority: 3 },
  { id: '4', name: 'Packaging', genderRequirement: 'any', maxWorkers: 2, priority: 4 },
]

export default function ManagerDashboard() {
  const { shifts, availability, stations, setShifts, setStations } = useShiftsStore()
  const [editingShift, setEditingShift] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)

  // Initialize demo data
  useEffect(() => {
    if (stations.length === 0) {
      setStations(demoStations)
    }
  }, [stations, setStations])

  const nextWeekStart = startOfWeek(addDays(new Date(), 7))
  const nextWeekDates = eachDayOfInterval({
    start: nextWeekStart,
    end: addDays(nextWeekStart, 6),
  })

  const handleEditShift = (shift: any) => {
    setEditingShift(shift.id)
    setEditForm({
      workerId: shift.workerId,
      station: shift.station,
      startTime: shift.startTime,
      endTime: shift.endTime,
    })
  }

  const handleSaveEdit = () => {
    if (editingShift) {
      const updatedShift = {
        ...shifts.find((s) => s.id === editingShift)!,
        ...editForm,
        workerName: demoWorkers.find((w) => w.id === editForm.workerId)?.name || '',
      }
      
      const updatedShifts = shifts.map((s) => 
        s.id === editingShift ? updatedShift : s
      )
      setShifts(updatedShifts)
      
      setEditingShift(null)
      setEditForm({})
      toast.success('Shift updated successfully!')
    }
  }

  const handleCancelEdit = () => {
    setEditingShift(null)
    setEditForm({})
  }

  const generateAssignments = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newShifts: any[] = []
      const availableWorkers = availability.filter((a) => a.isAvailable)
      
      nextWeekDates.forEach((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayAvailableWorkers = availableWorkers.filter((a) => a.date === dateStr)
        
        demoStations.forEach((station) => {
          const eligibleWorkers = dayAvailableWorkers.filter((a) => {
            const worker = demoWorkers.find((w) => w.id === a.workerId)
            return station.genderRequirement === 'any' || 
                   worker?.gender === station.genderRequirement
          })

          // Assign workers to stations
          for (let i = 0; i < Math.min(station.maxWorkers, eligibleWorkers.length); i++) {
            const worker = demoWorkers.find((w) => w.id === eligibleWorkers[i].workerId)
            if (worker) {
              newShifts.push({
                id: `${dateStr}-${station.id}-${worker.id}`,
                date: dateStr,
                startTime: '08:00',
                endTime: '16:00',
                station: station.name,
                workerId: worker.id,
                workerName: worker.name,
                status: 'assigned',
                genderRequirement: station.genderRequirement,
              })
            }
          }
        })
      })

      setShifts(newShifts)
      toast.success('Automatic assignments generated successfully!')
    } catch (error) {
      toast.error('Failed to generate assignments')
    } finally {
      setIsGenerating(false)
    }
  }

  const approveAllShifts = () => {
    const updatedShifts = shifts.map((shift) => ({
      ...shift,
      status: 'approved' as const,
    }))
    setShifts(updatedShifts)
    toast.success('All shifts approved!')
  }

  const getStats = () => {
    const totalShifts = shifts.length
    const pendingShifts = shifts.filter((s) => s.status === 'assigned').length
    const approvedShifts = shifts.filter((s) => s.status === 'approved').length
    const workersWithAvailability = new Set(availability.filter((a) => a.isAvailable).map((a) => a.workerId)).size

    return { totalShifts, pendingShifts, approvedShifts, workersWithAvailability }
  }

  const stats = getStats()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manager Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and manage shift assignments for the week of {format(nextWeekStart, 'MMMM dd, yyyy')}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Shifts</Typography>
              </Box>
              <Typography variant="h4">{stats.totalShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4">{stats.pendingShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h4">{stats.approvedShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Available Workers</Typography>
              </Box>
              <Typography variant="h4">{stats.workersWithAvailability}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={generateAssignments}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Automatic Assignments'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CheckCircle />}
              onClick={approveAllShifts}
              disabled={shifts.length === 0}
            >
              Approve All Shifts
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shift Assignments
          </Typography>
          
          {shifts.length === 0 ? (
            <Alert severity="info">
              No shifts have been generated yet. Click "Generate Automatic Assignments" to create shift assignments based on worker availability.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Worker</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>
                          {format(new Date(shift.date), 'EEE, MMM dd')}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{shift.station}</Typography>
                            {shift.genderRequirement && shift.genderRequirement !== 'any' && (
                              <Chip
                                label={`${shift.genderRequirement} only`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{shift.workerName}</TableCell>
                        <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                        <TableCell>
                          <Chip
                            label={shift.status}
                            color={shift.status === 'approved' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {editingShift === shift.id ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Save">
                                <IconButton size="small" onClick={handleSaveEdit}>
                                  <Save />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton size="small" onClick={handleCancelEdit}>
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditShift(shift)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingShift} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Shift Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Worker</InputLabel>
                <Select
                  value={editForm.workerId || ''}
                  onChange={(e) => setEditForm({ ...editForm, workerId: e.target.value })}
                  label="Worker"
                >
                  {demoWorkers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      {worker.name} ({worker.gender})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Station</InputLabel>
                <Select
                  value={editForm.station || ''}
                  onChange={(e) => setEditForm({ ...editForm, station: e.target.value })}
                  label="Station"
                >
                  {demoStations.map((station) => (
                    <MenuItem key={station.id} value={station.name}>
                      {station.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={editForm.startTime || ''}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={editForm.endTime || ''}
                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 