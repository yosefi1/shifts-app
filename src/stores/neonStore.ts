import { create } from 'zustand'
import { neon } from '@neondatabase/serverless'

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

export const useNeonStore = create<NeonStore>((set, get) => ({
  users: [],
  currentUser: null,
  shifts: [],
  constraints: [],
  preferences: [],

  login: async (userId: string) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      const result = await sql`SELECT * FROM users WHERE id = ${userId}`
      
      if (result.length > 0) {
        const user = result[0] as User
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
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      const result = await sql`SELECT * FROM users ORDER BY id`
      const users = result as User[]
      set({ users })
      return users
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  },

  addWorker: async (worker: Omit<User, 'id' | 'created_at'> & { id: string }) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`
        INSERT INTO users (id, name, role, gender, keepShabbat, created_at) 
        VALUES (${worker.id}, ${worker.name}, ${worker.role}, ${worker.gender}, ${worker.keepShabbat}, NOW())
      `
      return true
    } catch (error) {
      console.error('Error adding worker:', error)
      return false
    }
  },

  updateWorker: async (userId, updates) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      // Build dynamic update query
      const updateFields = Object.entries(updates)
        .filter(([_, value]) => value !== undefined)
        .map(([key, _]) => `${key} = $${key}`)
        .join(', ')
      
      if (updateFields.length === 0) return true
      
      await sql`UPDATE users SET ${sql.unsafe(updateFields)} WHERE id = ${userId}`
      return true
    } catch (error) {
      console.error('Error updating worker:', error)
      return false
    }
  },

  removeWorker: async (userId) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`DELETE FROM users WHERE id = ${userId}`
      return true
    } catch (error) {
      console.error('Error removing worker:', error)
      return false
    }
  },

  getConstraints: async (workerId) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      let result
      
      if (workerId) {
        result = await sql`SELECT * FROM constraints WHERE workerId = ${workerId} ORDER BY date`
      } else {
        result = await sql`SELECT * FROM constraints ORDER BY date`
      }
      
      const constraints = result as Constraint[]
      set({ constraints })
      return constraints
    } catch (error) {
      console.error('Error getting constraints:', error)
      return []
    }
  },

  addConstraint: async (constraint) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`
        INSERT INTO constraints (workerId, date, timeSlot, reason, isBlocked, created_at) 
        VALUES (${constraint.workerId}, ${constraint.date}, ${constraint.timeSlot}, ${constraint.reason}, ${constraint.isBlocked}, NOW())
      `
      return true
    } catch (error) {
      console.error('Error adding constraint:', error)
      return false
    }
  },

  updateConstraint: async (constraintId, updates) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`
        UPDATE constraints 
        SET reason = ${updates.reason || ''}, isBlocked = ${updates.isBlocked ?? true}
        WHERE id = ${constraintId}
      `
      return true
    } catch (error) {
      console.error('Error updating constraint:', error)
      return false
    }
  },

  removeConstraint: async (constraintId) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`DELETE FROM constraints WHERE id = ${constraintId}`
      return true
    } catch (error) {
      console.error('Error removing constraint:', error)
      return false
    }
  },

  getPreferences: async (workerId) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      const result = await sql`SELECT * FROM preferences WHERE workerId = ${workerId} LIMIT 1`
      
      if (result.length > 0) {
        return result[0] as Preference
      }
      return null
    } catch (error) {
      console.error('Error getting preferences:', error)
      return null
    }
  },

  addPreference: async (preference) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`
        INSERT INTO preferences (workerId, notes, preferPosition1, preferPosition2, preferPosition3, created_at, updated_at) 
        VALUES (${preference.workerId}, ${preference.notes}, ${preference.preferPosition1}, ${preference.preferPosition2}, ${preference.preferPosition3}, NOW(), NOW())
      `
      return true
    } catch (error) {
      console.error('Error adding preference:', error)
      return false
    }
  },

  updatePreference: async (workerId, updates) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL || '')
      await sql`
        UPDATE preferences 
        SET notes = ${updates.notes || ''}, 
            preferPosition1 = ${updates.preferPosition1 || ''}, 
            preferPosition2 = ${updates.preferPosition2 || ''}, 
            preferPosition3 = ${updates.preferPosition3 || ''}, 
            updated_at = NOW()
        WHERE workerId = ${workerId}
      `
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
