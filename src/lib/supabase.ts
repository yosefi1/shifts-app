import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project details
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table types
export interface DatabaseUser {
  id: string
  name: string
  role: 'manager' | 'worker'
  gender?: 'male' | 'female'
  keepShabbat?: boolean
  created_at?: string
}

export interface DatabaseShift {
  id: string
  date: string
  startTime: string
  endTime: string
  station: string
  workerId: string
  workerName: string
  status: 'assigned' | 'pending' | 'completed'
  created_at?: string
}

export interface DatabaseConstraint {
  id: string
  workerId: string
  date: string
  timeSlot: 'first' | 'second'
  reason: string
  isBlocked: boolean
  created_at?: string
}

export interface DatabasePreference {
  id: string
  workerId: string
  notes: string
  preferPosition1: string
  preferPosition2: string
  preferPosition3: string
  created_at?: string
}
