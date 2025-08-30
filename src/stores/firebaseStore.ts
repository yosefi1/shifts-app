import { create } from 'zustand'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  setDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'

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

interface FirebaseStore {
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
  addWorker: (worker: Omit<User, 'id'>) => Promise<boolean>
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

export const useFirebaseStore = create<FirebaseStore>((set, get) => ({
  users: [],
  currentUser: null,
  shifts: [],
  constraints: [],
  preferences: [],

  login: async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const user = { id: userDoc.id, ...userDoc.data() } as User
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
      const querySnapshot = await getDocs(collection(db, 'users'))
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]
      set({ users })
      return users
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  },

  addWorker: async (worker) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...worker,
        created_at: new Date().toISOString()
      })
      console.log('Worker added with ID:', docRef.id)
      return true
    } catch (error) {
      console.error('Error adding worker:', error)
      return false
    }
  },

  updateWorker: async (userId, updates) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates)
      return true
    } catch (error) {
      console.error('Error updating worker:', error)
      return false
    }
  },

  removeWorker: async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId))
      return true
    } catch (error) {
      console.error('Error removing worker:', error)
      return false
    }
  },

  getConstraints: async (workerId) => {
    try {
      let q = collection(db, 'constraints')
      if (workerId) {
        q = query(q, where('workerId', '==', workerId))
      }
      const querySnapshot = await getDocs(q)
      const constraints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Constraint[]
      set({ constraints })
      return constraints
    } catch (error) {
      console.error('Error getting constraints:', error)
      return []
    }
  },

  addConstraint: async (constraint) => {
    try {
      await addDoc(collection(db, 'constraints'), {
        ...constraint,
        created_at: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error adding constraint:', error)
      return false
    }
  },

  updateConstraint: async (constraintId, updates) => {
    try {
      await updateDoc(doc(db, 'constraints', constraintId), updates)
      return true
    } catch (error) {
      console.error('Error updating constraint:', error)
      return false
    }
  },

  removeConstraint: async (constraintId) => {
    try {
      await deleteDoc(doc(db, 'constraints', constraintId))
      return true
    } catch (error) {
      console.error('Error removing constraint:', error)
      return false
    }
  },

  getPreferences: async (workerId) => {
    try {
      const q = query(collection(db, 'preferences'), where('workerId', '==', workerId))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as Preference
      }
      return null
    } catch (error) {
      console.error('Error getting preferences:', error)
      return null
    }
  },

  addPreference: async (preference) => {
    try {
      await addDoc(collection(db, 'preferences'), {
        ...preference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error adding preference:', error)
      return false
    }
  },

  updatePreference: async (workerId, updates) => {
    try {
      const q = query(collection(db, 'preferences'), where('workerId', '==', workerId))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'preferences', querySnapshot.docs[0].id)
        await updateDoc(docRef, {
          ...updates,
          updated_at: new Date().toISOString()
        })
      } else {
        // Create if doesn't exist
        await addDoc(collection(db, 'preferences'), {
          workerId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
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
      
      // Set up real-time listeners
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]
        set({ users })
      })

      onSnapshot(collection(db, 'constraints'), (snapshot) => {
        const constraints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Constraint[]
        set({ constraints })
      })

      onSnapshot(collection(db, 'preferences'), (snapshot) => {
        const preferences = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Preference[]
        set({ preferences })
      })
    } catch (error) {
      console.error('Error initializing Firebase store:', error)
    }
  }
}))
