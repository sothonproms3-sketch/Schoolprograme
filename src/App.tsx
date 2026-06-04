import React, { useState, useEffect } from 'react';
import { Student, Subject, MonthScore, ClassConfig } from './types';
import { DEFAULT_STUDENTS, MONTH_NAMES } from './data/defaultStudents';
import { DEFAULT_SUBJECTS } from './data/defaultSubjects';
import { SEED_SCORES } from './data/seedScores';

// Views
import StudentProfileBook from './components/StudentProfileBook';
import ScoreEntrySheet from './components/ScoreEntrySheet';
import MonthlyRanking from './components/MonthlyRanking';
import HonorRoll from './components/HonorRoll';
import ReportCard from './components/ReportCard';

// Icons
import { 
  BookOpen, 
  UserSquare2, 
  PencilRuler, 
  Trophy, 
  BookMarked, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  GraduationCap
} from 'lucide-react';

type TabView = 'profiles' | 'scores' | 'ranking' | 'honor' | 'report';

export default function App() {
  // Global State
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [monthScores, setMonthScores] = useState<MonthScore[]>([]);
  const [config, setConfig] = useState<ClassConfig>({
    className: 'ថ្នាក់ទី ៥ អា (Grade 5A)',
    teacherName: 'សេង ចាន់ថា',
    academicYear: '២០២៥ - ២០២៦',
    selectedMonth: 'កៅសិបប្រាំបី', // index or string
  });
  
  const [activeTab, setActiveTab] = useState<TabView>('profiles');

  // Load from local storage or seed
  useEffect(() => {
    const savedStudents = localStorage.getItem('grade_students');
    const savedSubjects = localStorage.getItem('grade_subjects');
    const savedScores = localStorage.getItem('grade_scores');
    const savedConfig = localStorage.getItem('grade_config');

    if (savedStudents && savedSubjects && savedScores && savedConfig) {
      try {
        setStudents(JSON.parse(savedStudents));
        setSubjects(JSON.parse(savedSubjects));
        setMonthScores(JSON.parse(savedScores));
        setConfig(JSON.parse(savedConfig));
      } catch (err) {
        console.error('Error loading backup state, seeding defaults...', err);
        seedDefaults();
      }
    } else {
      seedDefaults();
    }
  }, []);

  const seedDefaults = () => {
    setStudents(DEFAULT_STUDENTS);
    setSubjects(DEFAULT_SUBJECTS);
    setMonthScores(SEED_SCORES);
    const defaultConfig: ClassConfig = {
      className: 'ថ្នាក់ទី ៥ អា (Grade 5A)',
      teacherName: 'សេង ចាន់ថា',
      academicYear: '២០២៥ - ២០២៦',
      selectedMonth: 'មីនា',
    };
    setConfig(defaultConfig);
    
    // Save to local storage
    localStorage.setItem('grade_students', JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem('grade_subjects', JSON.stringify(DEFAULT_SUBJECTS));
    localStorage.setItem('grade_scores', JSON.stringify(SEED_SCORES));
    localStorage.setItem('grade_config', JSON.stringify(defaultConfig));
  };

  // State Persistence triggers
  const saveState = (
    newStudents: Student[],
    newSubjects: Subject[],
    newScores: MonthScore[],
    newConfig: ClassConfig
  ) => {
    setStudents(newStudents);
    setSubjects(newSubjects);
    setMonthScores(newScores);
    setConfig(newConfig);

    localStorage.setItem('grade_students', JSON.stringify(newStudents));
    localStorage.setItem('grade_subjects', JSON.stringify(newSubjects));
    localStorage.setItem('grade_scores', JSON.stringify(newScores));
    localStorage.setItem('grade_config', JSON.stringify(newConfig));
  };

  // Student Actions
  const handleAddStudent = (profile: Omit<Student, 'id' | 'avatar'>) => {
    const newStudent: Student = {
      ...profile,
      id: `stud-${Date.now()}`,
      avatar: 'bg-indigo-100 text-indigo-700',
    };
    const updated = [...students, newStudent];
    saveState(updated, subjects, monthScores, config);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    saveState(updated, subjects, monthScores, config);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបបំបាត់សិស្សម្នាក់នេះមែនទេ? ពិន្ទុទាំងអស់របស់សិស្សនឹងត្រូវលុបបំបាត់ផងដែរ។')) {
      const updatedStudents = students.filter((s) => s.id !== id);
      const updatedScores = monthScores.filter((e) => e.studentId !== id);
      saveState(updatedStudents, subjects, updatedScores, config);
    }
  };

  // Score Actions
  const handleUpdateScores = (studentId: string, scores: Record<string, number>, comments?: string) => {
    const existingIdx = monthScores.findIndex((e) => e.studentId === studentId);
    let updatedScores = [...monthScores];

    if (existingIdx >= 0) {
      updatedScores[existingIdx] = {
        ...updatedScores[existingIdx],
        scores,
        comments,
      };
    } else {
      updatedScores.push({
        studentId,
        scores,
        comments,
      });
    }

    saveState(students, subjects, updatedScores, config);
  };

  // Subject Actions
  const handleAddCustomSubject = (name: string, maxScore: number) => {
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      name,
      maxScore,
    };
    const updated = [...subjects, newSubj];
    saveState(students, updated, monthScores, config);
  };

  const handleRemoveSubject = (id: string) => {
    if (confirm('តើអ្នកចង់លុបមុខវិជ្ជាស្រង់ពិន្ទុនេះមែនទេ?')) {
      const updatedSubjects = subjects.filter((s) => s.id !== id);
      // Clean up score records of this specific subject
      const updatedScores = monthScores.map((e) => {
        const cleaned = { ...e.scores };
        delete cleaned[id];
        return { ...e, scores: cleaned };
      });
      saveState(students, updatedSubjects, updatedScores, config);
    }
  };

  // Demo scoring tools
  const handleAutofillScores = () => {
    const generated: MonthScore[] = students.map((student) => {
      // Find existing comments to preserve
      const existing = monthScores.find((e) => e.studentId === student.id);
      const scoresMap: Record<string, number> = {};
      
      subjects.forEach((subj) => {
        // Generate a random score between 5.5 and 9.8 for realistic distribution
        const score = Number((5.5 + Math.random() * 4.3).toFixed(1));
        scoresMap[subj.id] = Math.min(score, subj.maxScore);
      });

      return {
        studentId: student.id,
        scores: scoresMap,
        comments: existing?.comments || 'សិស្សមានការយកចិត្តទុកដាក់ស្ដាប់ និងខិតខំប្រឹងប្រែង។',
      };
    });

    saveState(students, subjects, generated, config);
  };

  const handleClearScores = () => {
    if (confirm('តើអ្នកពិតជាចង់សម្អាតពិន្ទុទាំងអស់របស់សិស្សគ្រប់គ្នាមែនទេ?')) {
      saveState(students, subjects, [], config);
    }
  };

  // Export Data payload
  const exportDatabase = () => {
    const dataStr = JSON.stringify({ students, subjects, monthScores, config }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `primary-school-scores-${config.className.replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import Data backup file
  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (parsedData.students && parsedData.subjects && parsedData.monthScores && parsedData.config) {
          saveState(
            parsedData.students,
            parsedData.subjects,
            parsedData.monthScores,
            parsedData.config
          );
          alert('បានស្ដារឯកសារទិន្នន័យ (Restore Backup) ដោយជោគជ័យ!');
        } else {
          alert('ឯកសារទិន្នន័យមិនត្រឹមត្រូវតាមទម្រង់កម្មវិធីឡើយ!');
        }
      } catch (err) {
        alert('មានកំហុសក្នុងការអានឯកសារទិន្នន័យ!');
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Main Announcement Brand Bar */}
      <header className="bg-blue-900 text-white shadow-md border-b border-blue-950 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-800 flex items-center justify-center text-white border border-blue-600/50 shadow-inner">
              <GraduationCap className="h-6 w-6 stroke-2" />
            </div>
            <div>
              <h1 className="font-moul text-sm tracking-wide text-amber-300">កម្មវិធីស្រង់ពិន្ទុបឋមសិក្សាចម្រុះ</h1>
              <p className="text-[10px] text-blue-200 uppercase font-mono tracking-wider font-semibold mt-0.5">
                Primary School Grading Dashboard
              </p>
            </div>
          </div>

          {/* Core backup widgets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportDatabase}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-800 hover:bg-blue-700 text-white border border-blue-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              title="ទាញយកឯកសាររក្សាទុក (.json)"
            >
              <Download className="h-3.5 w-3.5" />
              <span>បម្រុងទុកទិន្នន័យ (Backup)</span>
            </button>
            <label className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-800 hover:bg-blue-700 text-white border border-blue-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>ស្ដារទិន្នន័យ (Restore)</span>
              <input
                type="file"
                accept=".json"
                onChange={importDatabase}
                className="hidden"
              />
            </label>
            <button
              onClick={seedDefaults}
              className="flex items-center gap-1.5 py-1.5 px-2.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              title="ស្ដារលំនាំដើមគំរូ"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Classroom Setup form widgets */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 no-print shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Class Code */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">ថ្នាក់សិក្សា (Class Name)</label>
            <input
              type="text"
              value={config.className}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, className: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 hover:border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          {/* Teacher name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">គ្រូទទួលបន្ទុក (Teacher Name)</label>
            <input
              type="text"
              value={config.teacherName}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, teacherName: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 hover:border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          {/* Academic year */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">ឆ្នាំសិក្សា (Academic Year)</label>
            <input
              type="text"
              value={config.academicYear}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, academicYear: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 hover:border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
            />
          </div>

          {/* Selected month */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">ជ្រើសរើសខែ / ឆមាស (Period)</label>
            <select
              value={config.selectedMonth}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, selectedMonth: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 hover:border-slate-300 bg-white rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Primary Navigation Rail */}
      <nav className="bg-slate-100 border-b border-slate-200 no-print overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {/* Profiles */}
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
              activeTab === 'profiles'
                ? 'border-blue-700 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <UserSquare2 className="h-4 w-4" />
            <span>សៀវភៅសិក្ខាគារិក (Student Profile)</span>
          </button>

          {/* Scores Entry */}
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
              activeTab === 'scores'
                ? 'border-blue-700 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <PencilRuler className="h-4 w-4" />
            <span>បញ្ជីស្រង់ពិន្ទុ (Grading Sheet)</span>
          </button>

          {/* Monthly Rankings */}
          <button
            onClick={() => setActiveTab('ranking')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
              activeTab === 'ranking'
                ? 'border-blue-700 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>ចំណាត់ថ្នាក់ប្រចាំខែ (Ranking)</span>
          </button>

          {/* Honor Roll */}
          <button
            onClick={() => setActiveTab('honor')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
              activeTab === 'honor'
                ? 'border-blue-700 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>តារាងកិត្តិយស (Top 5 & Certificate)</span>
          </button>

          {/* Report Card */}
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
              activeTab === 'report'
                ? 'border-blue-700 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <BookMarked className="h-4 w-4" />
            <span>សៀវភៅតាមដាន (Report Cards)</span>
          </button>
        </div>
      </nav>

      {/* Active Component Wrapper Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {activeTab === 'profiles' ? (
          <StudentProfileBook
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        ) : activeTab === 'scores' ? (
          <ScoreEntrySheet
            students={students}
            subjects={subjects}
            monthScores={monthScores}
            onUpdateScores={handleUpdateScores}
            onAddCustomSubject={handleAddCustomSubject}
            onRemoveSubject={handleRemoveSubject}
            onAutofillScores={handleAutofillScores}
            onClearScores={handleClearScores}
          />
        ) : activeTab === 'ranking' ? (
          <MonthlyRanking
            students={students}
            subjects={subjects}
            monthScores={monthScores}
            className={config.className}
            teacherName={config.teacherName}
            academicYear={config.academicYear}
            selectedMonth={config.selectedMonth}
          />
        ) : activeTab === 'honor' ? (
          <HonorRoll
            students={students}
            subjects={subjects}
            monthScores={monthScores}
            className={config.className}
            teacherName={config.teacherName}
            academicYear={config.academicYear}
            selectedMonth={config.selectedMonth}
          />
        ) : (
          <ReportCard
            students={students}
            subjects={subjects}
            monthScores={monthScores}
            className={config.className}
            teacherName={config.teacherName}
            academicYear={config.academicYear}
            selectedMonth={config.selectedMonth}
            onUpdateScores={handleUpdateScores}
          />
        )}
      </main>

      {/* Bottom Legal footer notes */}
      <footer className="bg-slate-100 border-t border-slate-200 py-4 font-medium text-slate-400 text-center text-[10px] no-print">
        <div className="max-w-7xl mx-auto px-4">
          <p>© ២០២៦ កម្មវិធីស្រង់ពិន្ទុបឋមសិក្សាចម្រុះជាន់ខ្ពស់។ សាកសមឥតខ្ចោះជាមួយគ្រប់សាលាបឋមសិក្សាក្នុងប្រទេសកម្ពុជា។</p>
        </div>
      </footer>
    </div>
  );
}
