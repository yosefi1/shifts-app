import { create } from 'zustand'

export interface User {
  id: string
  name: string
  role: 'manager' | 'worker'
  gender?: 'male' | 'female'
  keepShabbat?: boolean
}

export interface Shift {
  id: string
  date: string
  timeSlot: 'first' | 'second'
  workerId: string
  position: string
  created_at: string
}

export interface Constraint {
  id: string
  workerId: string
  date: string
  timeSlot: 'first' | 'second'
  reason: string
  isBlocked: boolean
  created_at: string
}

export interface Preference {
  id: string
  workerId: string
  notes: string
  preferPosition1: string
  preferPosition2: string
  preferPosition3: string
  created_at: string
  updated_at: string
}

interface NeonStore {
  // Users
  users: User[]
  currentUser: User | null
  
  // Data
  shifts: Shift[]
  constraints: Constraint[]
  preferences: Preference[]
  
  // Actions
  login: (userId: string) => Promise<User | null>
  getAllUsers: () => Promise<User[]>
  addWorker: (worker: Omit<User, 'id' | 'created_at'> & { id: string }) => Promise<boolean>
  updateWorker: (userId: string, updates: Partial<User>) => Promise<boolean>
  removeWorker: (userId: string) => Promise<boolean>
  
  // Constraints
  getConstraints: (workerId?: string) => Promise<Constraint[]>
  addConstraint: (constraint: Omit<Constraint, 'id' | 'created_at'>) => Promise<boolean>
  updateConstraint: (constraintId: string, updates: Partial<Constraint>) => Promise<boolean>
  removeConstraint: (constraintId: string) => Promise<boolean>
  
  // Preferences
  getPreferences: (workerId: string) => Promise<Preference | null>
  addPreference: (preference: Omit<Preference, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updatePreference: (workerId: string, updates: Partial<Preference>) => Promise<boolean>
  
  // Initialize
  initialize: () => Promise<void>
}

const callAPI = async (action: string, data: any) => {
  try {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'API call failed')
    }
    
    return result.data
  } catch (error) {
    console.error(`API call error for ${action}:`, error)
    throw error
  }
}

export const useNeonStore = create<NeonStore>((set, get) => ({
  users: [],
  currentUser: null,
  shifts: [],
  constraints: [],
  preferences: [],

  login: async (userId: string) => {
    try {
      const user = await callAPI('login', { userId })
      if (user) {
        set({ currentUser: user })
        return user
      }
      return null
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  },

  getAllUsers: async () => {
    try {
      const users = await callAPI('getAllUsers', {})
      set({ users })
      return users
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  },

  addWorker: async (worker) => {
    try {
      await callAPI('addWorker', worker)
      return true
    } catch (error) {
      console.error('Error adding worker:', error)
      return false
    }
  },

  updateWorker: async (userId, updates) => {
    try {
      await callAPI('updateWorker', { userId, updates })
      return true
    } catch (error) {
      console.error('Error updating worker:', error)
      return false
    }
  },

  removeWorker: async (userId) => {
    try {
      await callAPI('removeWorker', { userId })
      return true
    } catch (error) {
      console.error('Error removing worker:', error)
      return false
    }
  },

  getConstraints: async (workerId) => {
    try {
      const constraints = await callAPI('getConstraints', { workerId })
      set({ constraints })
      return constraints
    } catch (error) {
      console.error('Error getting constraints:', error)
      return []
    }
  },

  addConstraint: async (constraint) => {
    try {
      await callAPI('addConstraint', constraint)
      return true
    } catch (error) {
      console.error('Error adding constraint:', error)
      return false
    }
  },

  updateConstraint: async (constraintId, updates) => {
    try {
      await callAPI('updateConstraint', { constraintId, constraintUpdates: updates })
      return true
    } catch (error) {
      console.error('Error updating constraint:', error)
      return false
    }
  },

  removeConstraint: async (constraintId) => {
    try {
      await callAPI('removeConstraint', { constraintId })
      return true
    } catch (error) {
      console.error('Error removing constraint:', error)
      return false
    }
  },

  getPreferences: async (workerId) => {
    try {
      const preferences = await callAPI('getPreferences', { workerId })
      return preferences
    } catch (error) {
      console.error('Error getting preferences:', error)
      return null
    }
  },

  addPreference: async (preference) => {
    try {
      await callAPI('addPreference', preference)
      return true
    } catch (error) {
      console.error('Error adding preference:', error)
      return false
    }
  },

  updatePreference: async (workerId, updates) => {
    try {
      await callAPI('updatePreference', { workerId, prefUpdates: updates })
      return true
    } catch (error) {
      console.error('Error updating preference:', error)
      return false
    }
  },

  initialize: async () => {
    try {
      // Initialize users
      await get().getAllUsers()
    } catch (error) {
      console.error('Error initializing Neon store:', error)
    }
  }
}))
