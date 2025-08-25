import { create } from 'zustand'

export interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  station: string
  workerId: string
  workerName: string
  status: 'assigned' | 'pending' | 'completed'
}

export interface Availability {
  id: string
  workerId: string
  date: string
  timeSlot: 'morning' | 'evening' | 'first' | 'second'
  isAvailable: boolean
  note?: string
}

export interface Constraint {
  id: string
  workerId: string
  date: string
  timeSlot: 'morning' | 'evening' | 'first' | 'second'
  reason: string
  isBlocked: boolean
  createdAt: string
}

export interface WorkerPreferences {
  id: string
  workerId: string
  notes: string
  preferPosition1: string
  preferPosition2: string
  preferPosition3: string
  createdAt: string
}

interface ShiftsState {
  shifts: Shift[]
  availability: Availability[]
  constraints: Constraint[]
  preferences: WorkerPreferences[]
  setShifts: (shifts: Shift[]) => void
  setAvailability: (availability: Availability[]) => void
  setConstraints: (constraints: Constraint[]) => void
  setPreferences: (preferences: WorkerPreferences[]) => void
  addConstraint: (constraint: Omit<Constraint, 'id' | 'createdAt'>) => void
  removeConstraint: (constraintId: string) => void
  addPreference: (preference: Omit<WorkerPreferences, 'id' | 'createdAt'>) => void
  updatePreference: (workerId: string, updates: Partial<WorkerPreferences>) => void
  getWorkerConstraints: (workerId: string) => Constraint[]
  getWorkerPreferences: (workerId: string) => WorkerPreferences | null
}

export const useShiftsStore = create<ShiftsState>((set, get) => ({
  shifts: JSON.parse(localStorage.getItem('shifts') || '[]'),
  availability: JSON.parse(localStorage.getItem('availability') || '[]'),
  constraints: (() => {
    const stored = localStorage.getItem('constraints')
    if (stored) {
      return JSON.parse(stored)
    }
    // Default sample constraints
    const defaultConstraints = [
      {
        id: '1',
        workerId: '1',
        date: '2025-01-20',
        timeSlot: 'first',
        reason: 'חופשה משפחתית',
        isBlocked: true,
        createdAt: '2025-01-20T10:00:00.000Z'
      },
      {
        id: '2',
        workerId: '3',
        date: '2025-01-21',
        timeSlot: 'second',
        reason: 'פגישה רפואית',
        isBlocked: true,
        createdAt: '2025-01-21T10:00:00.000Z'
      },
      {
        id: '3',
        workerId: '5',
        date: '2025-01-22',
        timeSlot: 'first',
        reason: 'אירוע משפחתי',
        isBlocked: true,
        createdAt: '2025-01-22T10:00:00.000Z'
      },
      {
        id: '4',
        workerId: '7',
        date: '2025-01-23',
        timeSlot: 'second',
        reason: 'לימודים',
        isBlocked: true,
        createdAt: '2025-01-23T10:00:00.000Z'
      }
    ]
    localStorage.setItem('constraints', JSON.stringify(defaultConstraints))
    return defaultConstraints
  })(),
  preferences: JSON.parse(localStorage.getItem('preferences') || '[]'),
  
  setShifts: (shifts) => {
    set({ shifts })
    localStorage.setItem('shifts', JSON.stringify(shifts))
  },
  
  setAvailability: (availability) => {
    set({ availability })
    localStorage.setItem('availability', JSON.stringify(availability))
  },
  
  setConstraints: (constraints) => {
    set({ constraints })
    localStorage.setItem('constraints', JSON.stringify(constraints))
  },
  
  addConstraint: (constraint) => {
    const newConstraint: Constraint = {
      ...constraint,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    const constraints = [...get().constraints, newConstraint]
    set({ constraints })
    localStorage.setItem('constraints', JSON.stringify(constraints))
  },
  
  removeConstraint: (constraintId) => {
    const constraints = get().constraints.filter(c => c.id !== constraintId)
    set({ constraints })
    localStorage.setItem('constraints', JSON.stringify(constraints))
  },
  
  setPreferences: (preferences) => {
    set({ preferences })
    localStorage.setItem('preferences', JSON.stringify(preferences))
  },
  
  addPreference: (preference) => {
    const newPreference: WorkerPreferences = {
      ...preference,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    const preferences = [...get().preferences, newPreference]
    set({ preferences })
    localStorage.setItem('preferences', JSON.stringify(preferences))
  },
  
  updatePreference: (workerId, updates) => {
    const preferences = get().preferences.map(p => 
      p.workerId === workerId ? { ...p, ...updates } : p
    )
    set({ preferences })
    localStorage.setItem('preferences', JSON.stringify(preferences))
  },
  
  getWorkerConstraints: (workerId) => {
    return get().constraints.filter(c => c.workerId === workerId)
  },
  
  getWorkerPreferences: (workerId) => {
    return get().preferences.find(p => p.workerId === workerId) || null
  }
})) 