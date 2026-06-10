-- 1. បង្កើតតារាង students (Create students table)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name_kh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob TEXT,
  birth_place TEXT,
  father_name TEXT,
  mother_name TEXT,
  phone TEXT,
  address TEXT,
  conduct TEXT,
  remarks TEXT,
  avatar TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. បង្កើតតារាង subjects (Create subjects table)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_score NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. បង្កើតតារាង month_scores (Create month_scores table)
CREATE TABLE IF NOT EXISTS month_scores (
  student_id TEXT PRIMARY KEY,
  scores JSONB NOT NULL,
  comments TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. បង្កើតតារាង class_config (Create class_config table)
CREATE TABLE IF NOT EXISTS class_config (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  class_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  selected_month TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. បិទ RLS សម្រាប់ភាពងាយស្រួល (Disable Row Level Security for simple integration)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE month_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_config DISABLE ROW LEVEL SECURITY;
