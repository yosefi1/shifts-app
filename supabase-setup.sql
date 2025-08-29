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

-- Create preferences table
CREATE TABLE IF NOT EXISTS preferences (
  id TEXT PRIMARY KEY,
  workerId TEXT NOT NULL REFERENCES users(id) UNIQUE,
  notes TEXT,
  preferPosition1 TEXT,
  preferPosition2 TEXT,
  preferPosition3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (all users can read all data)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON shifts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON constraints FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON preferences FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update their own data
CREATE POLICY "Allow users to insert their own constraints" ON constraints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own constraints" ON constraints FOR UPDATE USING (true);
CREATE POLICY "Allow users to delete their own constraints" ON constraints FOR DELETE USING (true);

CREATE POLICY "Allow users to insert their own preferences" ON preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own preferences" ON preferences FOR UPDATE USING (true);

-- Create policies for managers to manage all data
CREATE POLICY "Allow managers to manage all data" ON users FOR ALL USING (true);
CREATE POLICY "Allow managers to manage all shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow managers to manage all constraints" ON constraints FOR ALL USING (true);
CREATE POLICY "Allow managers to manage all preferences" ON preferences FOR ALL USING (true);
