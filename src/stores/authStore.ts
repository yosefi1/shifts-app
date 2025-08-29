import { create } from 'zustand'

export interface User {
  id: string
  name: string
  role: 'manager' | 'worker'
  gender?: 'male' | 'female'
  keepShabbat?: boolean
}

// Predefined users
const USERS: User[] = [
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

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (userId: string) => User | null
  getAllUsers: () => User[]
  updateWorker: (workerId: string, updates: Partial<User>) => void
  addWorker: (worker: Omit<User, 'id'> & { id?: string }) => void
  removeWorker: (workerId: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },
  login: (userId: string) => {
    const user = USERS.find(u => u.id === userId)
    if (user) {
      get().setUser(user)
      return user
    }
    return null
  },
  getAllUsers: () => USERS,
  updateWorker: (workerId: string, updates: Partial<User>) => {
    const userIndex = USERS.findIndex(u => u.id === workerId)
    if (userIndex !== -1) {
      USERS[userIndex] = { ...USERS[userIndex], ...updates }
      // Update current user if it's the one being updated
      const currentUser = get().user
      if (currentUser && currentUser.id === workerId) {
        get().setUser(USERS[userIndex])
      }
    }
  },
  addWorker: (worker: Omit<User, 'id'> & { id?: string }) => {
    let newId: string
    if (worker.id) {
      // Use provided ID if it exists
      newId = worker.id
      // Check if ID already exists
      if (USERS.find(u => u.id === newId)) {
        throw new Error('מספר אישי כבר קיים במערכת')
      }
    } else {
      // Auto-generate ID if not provided
      newId = (Math.max(...USERS.map(u => parseInt(u.id))) + 1).toString()
    }
    const newWorker: User = { ...worker, id: newId }
    USERS.push(newWorker)
  },
  removeWorker: (workerId: string) => {
    const userIndex = USERS.findIndex(u => u.id === workerId)
    if (userIndex !== -1) {
      USERS.splice(userIndex, 1)
    }
  }
})) 