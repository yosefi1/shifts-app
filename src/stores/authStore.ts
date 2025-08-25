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
  { id: '1', name: 'עובד 1', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '2', name: 'עובד 2', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '3', name: 'עובד 3', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '4', name: 'עובד 4', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '5', name: 'עובד 5', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '6', name: 'עובד 6', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '7', name: 'עובד 7', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '8', name: 'עובד 8', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '9', name: 'עובד 9', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '10', name: 'עובד 10', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '11', name: 'עובד 11', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '12', name: 'עובד 12', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '13', name: 'עובד 13', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '14', name: 'עובד 14', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '15', name: 'עובד 15', role: 'worker', gender: 'male', keepShabbat: true },
  { id: '16', name: 'עובד 16', role: 'worker', gender: 'female', keepShabbat: false },
  { id: '17', name: 'עובד 17', role: 'worker', gender: 'male', keepShabbat: true }
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