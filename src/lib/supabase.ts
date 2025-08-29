import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = 'https://nbfoawqmueodpkvlgjlf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZm9hd3FtdWVvZHBrdmxnamxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzI2OTcsImV4cCI6MjA3MjA0ODY5N30.-Uk5XYqHbFdPg9xW-u80P43ycxK6dlB1kTvvgKNmzOA'

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
