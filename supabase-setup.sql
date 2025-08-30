-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'worker')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  keepShabbat BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  station TEXT NOT NULL,
  workerId TEXT NOT NULL REFERENCES users(id),
  workerName TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create constraints table
CREATE TABLE IF NOT EXISTS constraints (
  id TEXT PRIMARY KEY,
  workerId TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  timeSlot TEXT NOT NULL CHECK (timeSlot IN ('first', 'second')),
  reason TEXT NOT NULL,
  isBlocked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Force refresh preferences table schema cache by using new name
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS worker_preferences CASCADE;

CREATE TABLE worker_preferences (
  id SERIAL PRIMARY KEY,
  workerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  preferPosition1 TEXT,
  preferPosition2 TEXT,
  preferPosition3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE worker_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON worker_preferences;
CREATE POLICY "Users can view their own preferences" ON worker_preferences
  FOR SELECT USING (auth.uid()::text = workerId);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON worker_preferences;
CREATE POLICY "Users can insert their own preferences" ON worker_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = workerId);

DROP POLICY IF EXISTS "Users can update their own preferences" ON worker_preferences;
CREATE POLICY "Users can update their own preferences" ON worker_preferences
  FOR UPDATE USING (auth.uid()::text = workerId);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON worker_preferences;
CREATE POLICY "Users can delete their own preferences" ON worker_preferences
  FOR DELETE USING (auth.uid()::text = workerId);

-- Manager can view all preferences
DROP POLICY IF EXISTS "Managers can view all preferences" ON worker_preferences;
CREATE POLICY "Managers can view all preferences" ON worker_preferences
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'manager'
  ));

-- Insert initial users
INSERT INTO users (id, name, role, gender, keepShabbat) VALUES
  ('0', 'מנהל', 'manager', NULL, NULL),
  ('8863762', 'בן קורל', 'worker', 'male', true),
  ('8279948', 'טל אדרי', 'worker', 'male', true),
  ('9033163', 'ליאב אביסידריס', 'worker', 'male', true),
  ('8880935', 'ליאל שקד', 'worker', 'male', true),
  ('8679277', 'מאור יצחק קפון', 'worker', 'male', true),
  ('9192400', 'מור לחמני', 'worker', 'male', true),
  ('9181564', 'נויה חזן', 'worker', 'female', false),
  ('8379870', 'סילנאט טזרה', 'worker', 'female', false),
  ('8783268', 'סתיו גינה', 'worker', 'male', true),
  ('9113482', 'עהד הזימה', 'worker', 'male', true),
  ('9113593', 'עומרי סעד', 'worker', 'male', true),
  ('8801813', 'קטרין בטקיס', 'worker', 'female', false),
  ('8573304', 'רונן רזיאב', 'worker', 'male', true),
  ('5827572', 'רפאל ניסן', 'worker', 'male', true),
  ('9147342', 'רפאלה רזניקוב', 'worker', 'female', false),
  ('8798653', 'שירן מוסרי', 'worker', 'male', true),
  ('9067567', 'שרון סולימני', 'worker', 'male', true),
  ('8083576', 'יקיר אלדד', 'worker', 'male', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (all users can read all data)
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access" ON shifts;
CREATE POLICY "Allow public read access" ON shifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access" ON constraints;
CREATE POLICY "Allow public read access" ON constraints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access" ON worker_preferences;
CREATE POLICY "Allow public read access" ON worker_preferences FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update their own data
DROP POLICY IF EXISTS "Allow users to insert their own constraints" ON constraints;
CREATE POLICY "Allow users to insert their own constraints" ON constraints FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to update their own constraints" ON constraints;
CREATE POLICY "Allow users to update their own constraints" ON constraints FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow users to delete their own constraints" ON constraints;
CREATE POLICY "Allow users to delete their own constraints" ON constraints FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own preferences" ON worker_preferences;
CREATE POLICY "Allow users to insert their own preferences" ON worker_preferences FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to update their own preferences" ON worker_preferences;
CREATE POLICY "Allow users to update their own preferences" ON worker_preferences FOR UPDATE USING (true);

-- Create policies for managers to manage all data
DROP POLICY IF EXISTS "Allow managers to manage all data" ON users;
CREATE POLICY "Allow managers to manage all data" ON users FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow managers to manage all shifts" ON shifts;
CREATE POLICY "Allow managers to manage all shifts" ON shifts FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow managers to manage all constraints" ON constraints;
CREATE POLICY "Allow managers to manage all constraints" ON constraints FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow managers to manage all preferences" ON worker_preferences;
CREATE POLICY "Allow managers to manage all preferences" ON worker_preferences FOR ALL USING (true);
