-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'worker')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  keepShabbat BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create constraints table
CREATE TABLE IF NOT EXISTS constraints (
  id SERIAL PRIMARY KEY,
  workerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  timeSlot TEXT NOT NULL CHECK (timeSlot IN ('first', 'second')),
  reason TEXT NOT NULL,
  isBlocked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preferences table
CREATE TABLE IF NOT EXISTS preferences (
  id SERIAL PRIMARY KEY,
  workerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  preferPosition1 TEXT,
  preferPosition2 TEXT,
  preferPosition3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  timeSlot TEXT NOT NULL CHECK (timeSlot IN ('first', 'second')),
  workerId TEXT REFERENCES users(id) ON DELETE SET NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
