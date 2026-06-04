export type Gender = 'ប្រុស' | 'ស្រី';

export interface Student {
  id: string;
  nameKh: string;
  nameEn: string;
  gender: Gender;
  dob: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  phone: string;
  address: string;
  conduct: string; // 'ល្អណាស់' | 'ល្អ' | 'មធ្យម' | 'ខ្សោយ'
  remarks: string;
  avatar: string; // placeholder key or color
}

export interface Subject {
  id: string;
  name: string;
  maxScore: number;
}

export interface MonthScore {
  studentId: string;
  scores: Record<string, number>; // subjectId -> score value
  comments?: string;
}

export interface MonthResult {
  student: Student;
  scores: Record<string, number>;
  total: number;
  average: number;
  rank: number;
  grade: string; // 'ល្អប្រសើរ (A)', 'ល្អណាស់ (B)', etc.
  gradeLetter: string; // 'A', 'B', etc.
}

export interface ClassConfig {
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
}
