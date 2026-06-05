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
  GraduationCap,
  Shield,
  Lock,
  Unlock,
  Settings,
  Database,
  Trash2,
  Plus,
  Building,
  Sparkles
} from 'lucide-react';

type TabView = 'profiles' | 'scores' | 'ranking' | 'honor' | 'report' | 'class_settings' | 'subjects_admin' | 'database_admin';

export default function App() {
  // Global State
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [monthScores, setMonthScores] = useState<MonthScore[]>([]);
  const [config, setConfig] = useState<ClassConfig>({
    className: 'ថ្នាក់ទី ៥ អា (Grade 5A)',
    teacherName: 'សេង ចាន់ថា',
    academicYear: '២០២៥ - ២០២៦',
    selectedMonth: 'មីនា', // initialized with proper default monthly string
  });
  
  const [userRole, setUserRole] = useState<'teacher' | 'admin'>('teacher');
  const [activeTab, setActiveTab] = useState<TabView>('scores');

  // PIN authentication state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

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

  const handlePinSubmit = () => {
    if (pinInput === '1234') {
      setUserRole('admin');
      setActiveTab('profiles');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('លេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ! សូមព្យាយាមម្ដងទៀត។');
    }
  };

  const renderClassSettings = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-850 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-700" />
            <span>ការកំណត់ព័ត៌មានទូទៅថ្នាក់រៀន (Class Configuration)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">រៀបចំ និងកែប្រែព័ត៌មានរដ្ឋបាលរបស់ថ្នាក់សិក្សា ដែលបង្ហាញនៅលើសន្លឹកផ្ទៀងផ្ទាត់ និងសៀវភៅតាមដានការសិក្សា។</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Class Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-450 uppercase block">ឈ្មោះថ្នាក់សិក្សា (Class Name)</label>
            <input
              type="text"
              value={config.className}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, className: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 focus:border-blue-500 hover:border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold"
            />
          </div>

          {/* Teacher Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-450 uppercase block">គ្រូទទួលបន្ទុកថ្នាក់ (Teacher Name)</label>
            <input
              type="text"
              value={config.teacherName}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, teacherName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 focus:border-blue-500 hover:border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold"
            />
          </div>

          {/* Academic Year */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-450 uppercase block">ឆ្នាំសិក្សា (Academic Year)</label>
            <input
              type="text"
              value={config.academicYear}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, academicYear: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 focus:border-blue-500 hover:border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono font-bold"
            />
          </div>

          {/* Selected Month */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-450 uppercase block">ខែ / ឆមាសសម្រាប់ការស្រង់ពិន្ទុ (Grading Period)</label>
            <select
              value={config.selectedMonth}
              onChange={(e) => saveState(students, subjects, monthScores, { ...config, selectedMonth: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 focus:border-blue-500 hover:border-slate-300 bg-white rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold cursor-pointer"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderSubjectSettings = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-700" />
            <span>គ្រប់គ្រងមុខវិជ្ជាវិទ្យាសាស្ត្រនិងសិក្សាចម្រុះ (Subject Management)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">កែសម្រួល ឬបន្ថែមមុខវិជ្ជាដែលត្រូវគ្រប់គ្រងសម្រាប់ការស្រង់ពិន្ទុរបស់គ្រូប្រចាំថ្នាក់។</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Part: Admin Add Subject Form */}
          <div className="lg:col-span-1 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">បន្ថែមមុខវិជ្ជាថ្មី</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formEl = e.currentTarget;
              const nameInput = formEl.elements.namedItem('subjName') as HTMLInputElement;
              const maxInput = formEl.elements.namedItem('subjMax') as HTMLInputElement;
              if (!nameInput || !nameInput.value.trim()) return;
              handleAddCustomSubject(nameInput.value.trim(), parseInt(maxInput.value) || 10);
              nameInput.value = '';
              maxInput.value = '10';
              alert('បានបន្ថែមមុខវិជ្ជាថ្មីដោយជោគជ័យ!');
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase block">ឈ្មោះមុខវិជ្ជា (ឧ. គំនូរ)</label>
                <input
                  type="text"
                  name="subjName"
                  required
                  maxLength={30}
                  placeholder="បញ្ចូលឈ្មោះមុខវិជ្ជា..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase block">ពិន្ទុអតិបរមា (Max Score)</label>
                <input
                  type="number"
                  name="subjMax"
                  min={1}
                  max={100}
                  defaultValue={10}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800 font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>បន្ថែមមុខវិជ្ជាថ្មី</span>
              </button>
            </form>
          </div>

          {/* Right Part: Subject List with Delete workflow */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">បញ្ជីមុខវិជ្ជាបច្ចុប្បន្ន ({subjects.length})</h4>
            <div className="border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
              {subjects.map((subj, sIdx) => (
                <div key={subj.id} className="p-4 flex items-center justify-between text-slate-700 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-750 flex items-center justify-center font-bold font-mono text-xs">
                      {sIdx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{subj.name}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">ពិន្ទុអតិបរមា៖ {subj.maxScore} (Max Points)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subj.id)}
                    className="p-2 hover:bg-rose-50 text-rose-650 hover:text-rose-700 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
                    title="លុបមុខវិជ្ជាស្រង់ពិន្ទុនេះ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDatabaseSettings = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-700" />
            <span>ប្រព័ន្ធគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ (System Data & Maintenance)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">បម្រុងទុក ស្ដារ ឬកំណត់ទិន្នន័យពិន្ទុ និងព័ត៌មានលម្អិតផ្សេងៗរបស់សិស្សទូទាំងកម្មវិធីសិក្សា។</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Database Backup & Restore */}
          <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-slate-50/30">
            <h4 className="text-xs uppercase font-extrabold text-slate-455 tracking-wider block">ការរក្សាទុក និងនាំចូលទិន្នន័យបម្រុង</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ទាញយកឯកសារបម្រុងទុក (JSON) ដើម្បីរក្សាទុកពិន្ទុនិងប្រវត្តិរូបសិស្សជាឯកសារនៅក្នុងឧបករណ៍របស់អ្នក ឬនាំចូលមកវិញនៅពេលណាក៏បាន។
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={exportDatabase}
                className="flex items-center gap-2 py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>បម្រុងទុក (Backup JSON)</span>
              </button>

              <label className="flex items-center gap-2 py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                <Upload className="h-4 w-4 text-slate-550" />
                <span>ស្ដារទិន្នន័យ (Restore JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importDatabase}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Demo Score Operations */}
          <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-slate-50/30">
            <h4 className="text-xs uppercase font-extrabold text-amber-750 tracking-wider block">ពិន្ទុសាកល្បង និងឧបករណ៍ជំរុះពិន្ទុ</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              បំពេញពិន្ទុសាកល្បងដោយស្វ័យប្រវត្តសម្រាប់សិស្សទាំងអស់សម្រាប់ការសាកល្បង ឬសម្អាតទិន្នន័យពិន្ទុទាំងអស់ដើម្បីសរសេរថ្មី។
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleAutofillScores();
                  alert('ប្រឡងបំពេញពិន្ទុគំរូសាកល្បង (Demo Scores) ជូនសិស្សគ្រប់គ្នាដោយជោគជ័យ!');
                }}
                className="flex items-center gap-2 py-2 px-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>បញ្ចូលពិន្ទុគំរូ (Demo Auto-Fill)</span>
              </button>

              <button
                onClick={handleClearScores}
                className="flex items-center gap-2 py-2 px-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Trash2 className="h-4 w-4 text-rose-700" />
                <span>សម្អាតពិន្ទុទាំងអស់ (Clear)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dangerous Action Block */}
        <div className="border border-rose-100 bg-rose-50/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <Shield className="h-5 w-5 fill-rose-50 stroke-rose-750" />
            <span className="font-extrabold text-xs uppercase tracking-wider block">ការស្ដារប្រព័ន្ធដំបូងបង្អស់ (System Factory Reset)</span>
          </div>
          <div className="flex items-center justify-between text-xs gap-4 flex-wrap">
            <p className="text-slate-550 max-w-[600px] leading-relaxed">
              ការស្ដារប្រព័ន្ធដំបូងនឹងលុបចោលទិន្នន័យបន្ថែមទាំងអស់ដែលលោកអ្នកបានបញ្ចូល និងទាញយកទិន្នន័យគំរូសិស្ស ២០នាក់លំនាំដើមរបស់កម្មវិធីជាថ្មីឡើងវិញ។
            </p>
            <button
              onClick={() => {
                if (confirm('តើលោកអ្នកពិតជាចង់ស្ដារទិន្នន័យសិស្ស និងពិន្ទុទាំងអស់ទៅកាន់លំនាំដើមប្រព័ន្ធមែនទេ?')) {
                  seedDefaults();
                  alert('ប្រព័ន្ធត្រូវបានកំណត់ស្ដារទៅកាន់លំនាំដើមរោងចក្រដោយជោគជ័យ!');
                }
              }}
              className="flex items-center gap-2 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-all text-xs shadow-xs"
            >
              <RefreshCw className="h-4 w-4 animate-spin-slow" />
              <span>កំណត់ទៅលំនាំដើម (Factory Reset)</span>
            </button>
          </div>
        </div>
      </div>
    );
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

          {/* Quick info buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-blue-105 bg-blue-950/40 border border-blue-805 px-3 py-1.5 rounded-lg">
              🎯 គ្រូទទួលបន្ទុក៖ {config.teacherName || 'មិនទាន់កំណត់'}
            </span>
          </div>
        </div>
      </header>

      {/* Workspace Role switcher (High fidelity) */}
      <section className="bg-white border-b border-slate-200 no-print py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ផ្ទាំងការងារប្រើប្រាស់៖</span>
            <div className="p-0.5 bg-slate-100 rounded-xl flex gap-1 border border-slate-150">
              {/* Teacher switch */}
              <button
                onClick={() => {
                  setUserRole('teacher');
                  setActiveTab('scores');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'teacher'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PencilRuler className="h-3.5 w-3.5" />
                <span>លោកគ្រូអ្នកគ្រូស្រង់ពិន្ទុ</span>
              </button>

              {/* Admin switch */}
              <button
                onClick={() => {
                  if (userRole === 'admin') return;
                  setShowPinModal(true);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>គណៈគ្រប់គ្រង Admin</span>
                {userRole === 'admin' ? (
                  <Unlock className="h-3 w-3 inline-block" />
                ) : (
                  <Lock className="h-3 w-3 inline-block text-slate-450" />
                )}
              </button>
            </div>
          </div>

          {/* Roster fast info stats */}
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-150">
            <span>ចំនួនសិស្សសរុប៖ <strong className="text-blue-900 font-bold">{students.length} នាក់</strong></span>
            <span className="text-slate-350">|</span>
            <span>សិស្សស្រី៖ <strong className="text-pink-600 font-bold">{students.filter(s => s.gender === 'ស្រី').length} នាក់</strong></span>
            <span className="text-slate-355">|</span>
            <span>មុខវិជ្ជាស្រង់៖ <strong className="text-emerald-700 font-bold">{subjects.length} វិទ្យា</strong></span>
          </div>
        </div>
      </section>

      {/* Primary Navigation Rail */}
      <nav className="bg-slate-100 border-b border-slate-200 no-print overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {userRole === 'teacher' ? (
            <>
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
            </>
          ) : (
            <>
              {/* Profiles Manager */}
              <button
                onClick={() => setActiveTab('profiles')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
                  activeTab === 'profiles'
                    ? 'border-blue-700 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <UserSquare2 className="h-4 w-4" />
                <span>គ្រប់គ្រងប្រវត្តិរូបសិស្ស (Student Profiles)</span>
              </button>

              {/* Class configuration */}
              <button
                onClick={() => setActiveTab('class_settings')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
                  activeTab === 'class_settings'
                    ? 'border-blue-700 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>ការកំណត់ថ្នាក់រៀន (Class Settings)</span>
              </button>

              {/* Subjects settings */}
              <button
                onClick={() => setActiveTab('subjects_admin')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
                  activeTab === 'subjects_admin'
                    ? 'border-blue-700 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>គ្រប់គ្រងមុខវិជ្ជា (Study Subjects)</span>
              </button>

              {/* Database Settings */}
              <button
                onClick={() => setActiveTab('database_admin')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 tracking-wide cursor-pointer shrink-0 transition-all ${
                  activeTab === 'database_admin'
                    ? 'border-blue-700 text-blue-700 font-bold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ (Maintenance)</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Active Component Wrapper Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {userRole === 'teacher' ? (
          <>
            {activeTab === 'scores' && (
              <ScoreEntrySheet
                students={students}
                subjects={subjects}
                monthScores={monthScores}
                onUpdateScores={handleUpdateScores}
                onAddCustomSubject={handleAddCustomSubject}
                onRemoveSubject={handleRemoveSubject}
                onAutofillScores={handleAutofillScores}
                onClearScores={handleClearScores}
                isAdmin={false} // Teacher workspace! Hide subject management controls, reset DB, autofill
              />
            )}
            {activeTab === 'ranking' && (
              <MonthlyRanking
                students={students}
                subjects={subjects}
                monthScores={monthScores}
                className={config.className}
                teacherName={config.teacherName}
                academicYear={config.academicYear}
                selectedMonth={config.selectedMonth}
              />
            )}
            {activeTab === 'honor' && (
              <HonorRoll
                students={students}
                subjects={subjects}
                monthScores={monthScores}
                className={config.className}
                teacherName={config.teacherName}
                academicYear={config.academicYear}
                selectedMonth={config.selectedMonth}
              />
            )}
            {activeTab === 'report' && (
              <ReportCard
                students={students}
                subjects={subjects}
                monthScores={monthScores}
                className={config.className}
                teacherName={config.teacherName}
                academicYear={config.academicYear}
                selectedMonth={config.selectedMonth}
                onUpdateScores={handleUpdateScores}
                onUpdateStudent={handleUpdateStudent}
              />
            )}
          </>
        ) : (
          <>
            {activeTab === 'profiles' && (
              <StudentProfileBook
                students={students}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                className={config.className}
                teacherName={config.teacherName}
                academicYear={config.academicYear}
              />
            )}
            {activeTab === 'class_settings' && renderClassSettings()}
            {activeTab === 'subjects_admin' && renderSubjectSettings()}
            {activeTab === 'database_admin' && renderDatabaseSettings()}
          </>
        )}
      </main>

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-slate-150 p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">តម្រូវឲ្យផ្ទៀងផ្ទាត់ លេខកូដសម្ងាត់ Admin</h3>
              <p className="text-xs text-slate-400">សូមបញ្ចូលលេខកូដសម្ងាត់បុគ្គលិកគ្រប់គ្រងដើម្បីចូលទៅកាន់ផ្ទាំងរដ្ឋបាល។</p>
            </div>

            <div className="space-y-3.5">
              <input
                type="password"
                maxLength={6}
                placeholder="បញ្ចូលលេខកូដសម្ងាត់ (ឧ. 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePinSubmit();
                  }
                }}
                className="w-full text-center px-4 py-2.5 text-lg font-bold bg-slate-50 border border-slate-200 focus:border-blue-550 focus:ring-1 focus:ring-blue-500 rounded-xl focus:outline-none tracking-widest text-slate-800"
                autoFocus
              />

              {pinError && (
                <p className="text-xs font-bold text-rose-600 text-center">{pinError}</p>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                  💡 លេខកូដសាកល្បងរបស់សាលាគឺ៖ <span className="font-mono bg-amber-150 px-1.5 py-0.5 rounded text-amber-950 font-bold">1234</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-center"
              >
                បោះបង់
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2 bg-blue-750 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer text-center shadow-xs"
              >
                ចូលទៅកាន់ផ្ទាំង Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Legal footer notes */}
      <footer className="bg-slate-100 border-t border-slate-200 py-4 font-medium text-slate-400 text-center text-[10px] no-print">
        <div className="max-w-7xl mx-auto px-4">
          <p>© ២០២៦ កម្មវិធីស្រង់ពិន្ទុបឋមសិក្សាចម្រុះជាន់ខ្ពស់។ សាកសមឥតខ្ចោះជាមួយគ្រប់សាលាបឋមសិក្សាក្នុងប្រទេសកម្ពុជា។</p>
        </div>
      </footer>
    </div>
  );
}
