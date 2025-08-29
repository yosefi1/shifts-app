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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material'
import { ArrowBack, Add, Edit, Delete, People } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuthStore, User } from '../stores/supabaseAuthStore'

export default function Workers() {
  const navigate = useNavigate()
  
  // Workers management state
  const [workersDialogOpen, setWorkersDialogOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<any>(null)
  const [newWorker, setNewWorker] = useState({
    id: '',
    name: '',
    gender: 'male' as 'male' | 'female',
    keepShabbat: true
  })
  const [error, setError] = useState<string | null>(null)

  // Get real workers from auth store
  const { getAllUsers, updateWorker, addWorker, removeWorker, testDatabaseConnection } = useSupabaseAuthStore()
  const [workers, setWorkers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAllUsers()
      setWorkers(users.filter((user: User) => user.role === 'worker'))
    }
    loadUsers()
  }, [getAllUsers])

  // Test database connection
  const handleTestConnection = async () => {
    try {
      setIsLoading(true)
      const result = await testDatabaseConnection()
      if (result.success) {
        alert('חיבור למסד הנתונים תקין!')
      } else {
        alert(`שגיאה בחיבור למסד הנתונים: ${result.error}`)
      }
    } catch (error) {
      alert('שגיאה בבדיקת החיבור')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Workers management functions
  const handleAddWorker = async () => {
    try {
      setError(null)
      await addWorker({
        id: newWorker.id,
        name: newWorker.name,
        role: 'worker',
        gender: newWorker.gender,
        keepShabbat: newWorker.keepShabbat
      })
      setNewWorker({ id: '', name: '', gender: 'male', keepShabbat: true })
      setWorkersDialogOpen(false)
      // Reload users
      const users = await getAllUsers()
      setWorkers(users.filter(user => user.role === 'worker'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהוספת עובד')
    }
  }
  
  const handleEditWorker = async () => {
    if (editingWorker) {
      try {
        setError(null)
        await updateWorker(editingWorker.id, {
          id: editingWorker.id,
          name: editingWorker.name,
          gender: editingWorker.gender,
          keepShabbat: editingWorker.keepShabbat
        })
        setEditingWorker(null)
        setWorkersDialogOpen(false)
        // Reload users
        const users = await getAllUsers()
        setWorkers(users.filter(user => user.role === 'worker'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בעריכת עובד')
      }
    }
  }
  
  const handleDeleteWorker = async (workerId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) {
      try {
        await removeWorker(workerId)
        // Reload users
        const users = await getAllUsers()
        setWorkers(users.filter(user => user.role === 'worker'))
      } catch (err) {
        setError('שגיאה במחיקת עובד')
      }
    }
  }

  return (
    <Box dir="rtl" sx={{ maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: 'blue', fontSize: '2rem' }}>
          <People sx={{ mr: 1, verticalAlign: 'middle' }} />
          ניהול עובדים
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">רשימת עובדים</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? 'בודק...' : 'בדוק חיבור DB'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingWorker(null)
              setNewWorker({ id: '', name: '', gender: 'male', keepShabbat: true })
              setError(null)
              setWorkersDialogOpen(true)
            }}
          >
            הוסף עובד
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>מספר אישי</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>שם</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>מגדר</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>שומר שבת</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell sx={{ textAlign: 'center' }}>{worker.id}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{worker.name}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {worker.gender === 'male' ? 'זכר' : worker.gender === 'female' ? 'נקבה' : 'לא צוין'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip 
                    label={worker.keepShabbat ? 'כן' : 'לא'} 
                    color={worker.keepShabbat ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                                             onClick={() => {
                         setEditingWorker(worker)
                         setError(null)
                         setWorkersDialogOpen(true)
                       }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteWorker(worker.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Workers Management Dialog */}
              <Dialog open={workersDialogOpen} onClose={() => {
          setWorkersDialogOpen(false)
          setError(null)
        }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorker ? 'ערוך עובד' : 'הוסף עובד חדש'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="מספר אישי"
              value={editingWorker ? editingWorker.id : newWorker.id}
              onChange={(e) => {
                if (editingWorker) {
                  setEditingWorker({ ...editingWorker, id: e.target.value })
                } else {
                  setNewWorker({ ...newWorker, id: e.target.value })
                }
              }}
              fullWidth
              dir="rtl"
            />
            <TextField
              label="שם העובד"
              value={editingWorker ? editingWorker.name : newWorker.name}
              onChange={(e) => {
                if (editingWorker) {
                  setEditingWorker({ ...editingWorker, name: e.target.value })
                } else {
                  setNewWorker({ ...newWorker, name: e.target.value })
                }
              }}
              fullWidth
              dir="rtl"
            />
            
            <Select
              value={editingWorker ? editingWorker.gender : newWorker.gender}
              onChange={(e) => {
                if (editingWorker) {
                  setEditingWorker({ ...editingWorker, gender: e.target.value as 'male' | 'female' })
                } else {
                  setNewWorker({ ...newWorker, gender: e.target.value as 'male' | 'female' })
                }
              }}
              fullWidth
              label="מגדר"
            >
              <MenuItem value="male">זכר</MenuItem>
              <MenuItem value="female">נקבה</MenuItem>
            </Select>
            
            <FormControlLabel
              control={
                <Switch
                  checked={editingWorker ? editingWorker.keepShabbat : newWorker.keepShabbat}
                  onChange={(e) => {
                    if (editingWorker) {
                      setEditingWorker({ ...editingWorker, keepShabbat: e.target.checked })
                    } else {
                      setNewWorker({ ...newWorker, keepShabbat: e.target.checked })
                    }
                  }}
                />
              }
              label="שומר שבת"
            />
          </Box>
        </DialogContent>
        <DialogActions>
                      <Button onClick={() => {
              setWorkersDialogOpen(false)
              setError(null)
            }}>
              ביטול
            </Button>
                      <Button 
              onClick={editingWorker ? handleEditWorker : handleAddWorker}
              variant="contained"
              disabled={editingWorker ? (!editingWorker.name || !editingWorker.id) : (!newWorker.name || !newWorker.id)}
            >
            {editingWorker ? 'שמור' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
