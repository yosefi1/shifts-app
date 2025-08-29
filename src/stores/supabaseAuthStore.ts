import { create } from 'zustand'
import { supabase, DatabaseUser } from '../lib/supabase'

export interface User {
  id: string
  name: string
  role: 'manager' | 'worker'
  gender?: 'male' | 'female'
  keepShabbat?: boolean
}

interface SupabaseAuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (userId: string) => Promise<User | null>
  getAllUsers: () => Promise<User[]>
  updateWorker: (workerId: string, updates: Partial<User>) => Promise<void>
  addWorker: (worker: Omit<User, 'id'> & { id?: string }) => Promise<void>
  removeWorker: (workerId: string) => Promise<void>
  initializeUsers: () => Promise<void>
  checkSession: () => Promise<User | null>
  testDatabaseConnection: () => Promise<{ success: boolean; error: string | null }>
  
  // Constraints management
  getConstraints: () => Promise<any[]>
  addConstraint: (constraint: any) => Promise<void>
  updateConstraint: (constraintId: string, updates: any) => Promise<void>
  removeConstraint: (constraintId: string) => Promise<void>
  
  // Preferences management
  getPreferences: (workerId: string) => Promise<any | null>
  addPreference: (preference: any) => Promise<boolean>
  updatePreference: (workerId: string, updates: any) => Promise<boolean>
}

export const useSupabaseAuthStore = create<SupabaseAuthState>((set, get) => ({
  user: null, // Start with no user
  
  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },

  login: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          role: data.role,
          gender: data.gender,
          keepShabbat: data.keepShabbat
        }
        get().setUser(user)
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get users error:', error)
      return []
    }
  },

  updateWorker: async (workerId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', workerId)

      if (error) throw error

      // Update current user if it's the one being updated
      const currentUser = get().user
      if (currentUser && currentUser.id === workerId) {
        get().setUser({ ...currentUser, ...updates })
      }
    } catch (error) {
      console.error('Update worker error:', error)
      throw error
    }
  },

  addWorker: async (worker: Omit<User, 'id'> & { id?: string }) => {
    try {
      let newId: string
      if (worker.id) {
        newId = worker.id
        // Check if ID already exists
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('id', newId)
          .single()
        
        if (data) {
          throw new Error('מספר אישי כבר קיים במערכת')
        }
      } else {
        // Auto-generate ID if not provided
        const { data } = await supabase
          .from('users')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)
          .single()
        
        newId = data ? (parseInt(data.id) + 1).toString() : '1'
      }

      const newWorker: DatabaseUser = { ...worker, id: newId }
      const { error } = await supabase
        .from('users')
        .insert([newWorker])

      if (error) throw error
    } catch (error) {
      console.error('Add worker error:', error)
      throw error
    }
  },

  removeWorker: async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', workerId)

      if (error) throw error
    } catch (error) {
      console.error('Remove worker error:', error)
      throw error
    }
  },

  initializeUsers: async () => {
    try {
      // Check if users table exists and has data
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        // Table doesn't exist, create it with initial data
        await supabase.rpc('create_users_table')
        
        // Insert initial users
        const initialUsers: DatabaseUser[] = [
          { id: '0', name: 'מנהל', role: 'manager' },
          { id: '8863762', name: 'בן קורל', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '8279948', name: 'טל אדרי', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9033163', name: 'ליאב אביסידריס', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '8880935', name: 'ליאל שקד', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '8679277', name: 'מאור יצחק קפון', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9192400', name: 'מור לחמני', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9181564', name: 'נויה חזן', role: 'worker', gender: 'female', keepShabbat: false },
          { id: '8379870', name: 'סילנאט טזרה', role: 'worker', gender: 'female', keepShabbat: false },
          { id: '8783268', name: 'סתיו גינה', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9113482', name: 'עהד הזימה', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9113593', name: 'עומרי סעד', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '8801813', name: 'קטרין בטקיס', role: 'worker', gender: 'female', keepShabbat: false },
          { id: '8573304', name: 'רונן רזיאב', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '5827572', name: 'רפאל ניסן', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9147342', name: 'רפאלה רזניקוב', role: 'worker', gender: 'female', keepShabbat: false },
          { id: '8798653', name: 'שירן מוסרי', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '9067567', name: 'שרון סולימני', role: 'worker', gender: 'male', keepShabbat: true },
          { id: '8083576', name: 'יקיר אלדד', role: 'worker', gender: 'male', keepShabbat: true }
        ]

        const { error: insertError } = await supabase
          .from('users')
          .insert(initialUsers)

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Initialize users error:', error)
    }
  },

  // Check for existing session on app start
  checkSession: async () => {
    try {
      // Check if we have a stored user in localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        // Verify the user still exists in database
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          // User exists, restore session
          set({ user })
          return user
        } else {
          // User no longer exists, clear storage
          localStorage.removeItem('user')
          set({ user: null })
        }
      }
      return null
    } catch (error) {
      console.error('Check session error:', error)
      localStorage.removeItem('user')
      set({ user: null })
      return null
    }
  },

  // Test database connection and table existence
  testDatabaseConnection: async () => {
    try {
      console.log('Testing database connection...')
      
      // Test basic connection
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Database connection test failed:', error)
        return { success: false, error: error.message }
      }
      
      console.log('Database connection successful')
      return { success: true, error: null }
    } catch (error) {
      console.error('Database test error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },
  
  // Constraints management
  getConstraints: async () => {
    try {
      const { data, error } = await supabase
        .from('constraints')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get constraints error:', error)
      return []
    }
  },
  
  addConstraint: async (constraint: any) => {
    try {
      const { error } = await supabase
        .from('constraints')
        .insert([constraint])
      
      if (error) throw error
    } catch (error) {
      console.error('Add constraint error:', error)
      throw error
    }
  },
  
  updateConstraint: async (constraintId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('constraints')
        .update(updates)
        .eq('id', constraintId)
      
      if (error) throw error
    } catch (error) {
      console.error('Update constraint error:', error)
      throw error
    }
  },
  
  removeConstraint: async (constraintId: string) => {
    try {
      const { error } = await supabase
        .from('constraints')
        .delete()
        .eq('id', constraintId)
      
      if (error) throw error
    } catch (error) {
      console.error('Remove constraint error:', error)
      throw error
    }
  },
  
  // Preferences management
  getPreferences: async (workerId: string) => {
    try {
      const { data, error } = await supabase
        .from('worker_preferences')
        .select('*')
        .eq('workerId', workerId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting preferences:', error)
      return null
    }
  },
  
  addPreference: async (preference: any) => {
    try {
      const { error } = await supabase
        .from('worker_preferences')
        .insert([preference])
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding preference:', error)
      return false
    }
  },
  
  updatePreference: async (workerId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('worker_preferences')
        .update(updates)
        .eq('workerId', workerId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating preference:', error)
      return false
    }
  }
}))
