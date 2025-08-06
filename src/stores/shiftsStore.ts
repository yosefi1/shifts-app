import { create } from 'zustand'

export interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  station: string
  workerId: string
  workerName: string
  status: 'assigned' | 'pending' | 'approved'
  genderRequirement?: 'male' | 'female' | 'any'
}

export interface Availability {
  id: string
  workerId: string
  date: string
  isAvailable: boolean
  reason?: string
}

export interface Station {
  id: string
  name: string
  genderRequirement?: 'male' | 'female' | 'any'
  maxWorkers: number
  priority: number
}

interface ShiftsState {
  shifts: Shift[]
  availability: Availability[]
  stations: Station[]
  setShifts: (shifts: Shift[]) => void
  setAvailability: (availability: Availability[]) => void
  setStations: (stations: Station[]) => void
  addShift: (shift: Shift) => void
  updateShift: (id: string, updates: Partial<Shift>) => void
  addAvailability: (availability: Availability) => void
  updateAvailability: (id: string, updates: Partial<Availability>) => void
}

export const useShiftsStore = create<ShiftsState>((set, get) => ({
  shifts: [],
  availability: [],
  stations: [],
  setShifts: (shifts) => set({ shifts }),
  setAvailability: (availability) => set({ availability }),
  setStations: (stations) => set({ stations }),
  addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })),
  updateShift: (id, updates) =>
    set((state) => ({
      shifts: state.shifts.map((shift) =>
        shift.id === id ? { ...shift, ...updates } : shift
      ),
    })),
  addAvailability: (availability) =>
    set((state) => ({ availability: [...state.availability, availability] })),
  updateAvailability: (id, updates) =>
    set((state) => ({
      availability: state.availability.map((avail) =>
        avail.id === id ? { ...avail, ...updates } : avail
      ),
    })),
})) 