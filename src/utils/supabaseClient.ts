import { createClient } from '@supabase/supabase-js';
import { Student, Subject, MonthScore, ClassConfig } from '../types';

// Retrieve credentials securely from local storage or environment variables
export function getSupabaseKeys() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  const savedUrl = localStorage.getItem('supabase_url') || '';
  const savedKey = localStorage.getItem('supabase_anon_key') || '';
  
  return {
    url: envUrl || savedUrl || '',
    key: envKey || savedKey || '',
    isFromEnv: !!(envUrl && envKey),
    hasConfig: !!(envUrl || savedUrl) && !!(envKey || savedKey)
  };
}

// Lazy initializer for the Supabase Client
export function getSupabaseClient() {
  const { url, key } = getSupabaseKeys();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

// Database schema translation helpers (CamelCase <=> snake_case)
export function mapStudentToDB(s: Student) {
  return {
    id: s.id,
    name_kh: s.nameKh,
    name_en: s.nameEn,
    gender: s.gender,
    dob: s.dob || '',
    birth_place: s.birthPlace || '',
    father_name: s.fatherName || '',
    mother_name: s.motherName || '',
    phone: s.phone || '',
    address: s.address || '',
    conduct: s.conduct,
    remarks: s.remarks || '',
    avatar: s.avatar || ''
  };
}

export function mapStudentFromDB(s: any): Student {
  return {
    id: s.id,
    nameKh: s.name_kh || s.nameKh || '',
    nameEn: s.name_en || s.nameEn || '',
    gender: s.gender,
    dob: s.dob || '',
    birthPlace: s.birth_place || s.birthPlace || '',
    fatherName: s.father_name || s.fatherName || '',
    motherName: s.mother_name || s.motherName || '',
    phone: s.phone || '',
    address: s.address || '',
    conduct: s.conduct,
    remarks: s.remarks || '',
    avatar: s.avatar || ''
  };
}

export function mapSubjectToDB(s: Subject) {
  return {
    id: s.id,
    name: s.name,
    max_score: s.maxScore
  };
}

export function mapSubjectFromDB(s: any): Subject {
  return {
    id: s.id,
    name: s.name,
    maxScore: Number(s.max_score !== undefined ? s.max_score : (s.maxScore !== undefined ? s.maxScore : 10))
  };
}

export function mapMonthScoreToDB(m: MonthScore) {
  return {
    student_id: m.studentId,
    scores: m.scores || {},
    comments: m.comments || ''
  };
}

export function mapMonthScoreFromDB(m: any): MonthScore {
  return {
    studentId: m.student_id || m.studentId || '',
    scores: m.scores || {},
    comments: m.comments || ''
  };
}

export function mapConfigToDB(c: ClassConfig) {
  return {
    id: 'current_config',
    class_name: c.className,
    teacher_name: c.teacherName,
    academic_year: c.academicYear,
    selected_month: c.selectedMonth
  };
}

export function mapConfigFromDB(c: any): ClassConfig {
  return {
    className: c.class_name || c.className || '',
    teacherName: c.teacher_name || c.teacherName || '',
    academicYear: c.academic_year || c.academicYear || '',
    selectedMonth: c.selected_month || c.selectedMonth || ''
  };
}

// Function to fetch more than 1000 records dynamically using cursor pagination
// This fully respects the user instruction: "សូមដាក់លក្ខ័ណ្ឌឱ្យទាញទិន្នន័យលើសពីរ១០០០ជួរ"
export async function fetchPaginatedRows(supabase: any, tableName: string) {
  let allData: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + step - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      if (data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    } else {
      hasMore = false;
    }
  }
  return allData;
}

// SQL configuration templates that match the application schema
export const SUPABASE_SQL_CREATION = `-- 1. បង្កើតតារាង students (Create students table)
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
`;
