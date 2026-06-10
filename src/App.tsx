import React, { useState, useEffect } from 'react';
import { Student, Subject, MonthScore, ClassConfig } from './types';
import { DEFAULT_STUDENTS, MONTH_NAMES } from './data/defaultStudents';
import { DEFAULT_SUBJECTS } from './data/defaultSubjects';
import { SEED_SCORES } from './data/seedScores';

// Supabase integration helpers
import {
  getSupabaseKeys,
  getSupabaseClient,
  mapStudentToDB,
  mapStudentFromDB,
  mapSubjectToDB,
  mapSubjectFromDB,
  mapMonthScoreToDB,
  mapMonthScoreFromDB,
  mapConfigToDB,
  mapConfigFromDB,
  fetchPaginatedRows,
  SUPABASE_SQL_CREATION
} from './utils/supabaseClient';

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
  Sparkles,
  Cloud,
  Server,
  Check,
  AlertCircle,
  Copy,
  CheckCircle2
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

  // Supabase Sync states
  const [dbSyncing, setDbSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('');
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<'not_configured' | 'success' | 'error'>('not_configured');

  // Load from local storage or seed
  useEffect(() => {
    // Load Supabase keys
    const keys = getSupabaseKeys();
    setSbUrl(keys.url);
    setSbKey(keys.key);

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

  // --- Supabase Actions & Integrations ---
  const saveSupabaseCredentials = (url: string, key: string) => {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
    setSbUrl(url);
    setSbKey(key);
    setSupabaseConnected('not_configured');
  };

  const handleTestConnection = async () => {
    const keys = getSupabaseKeys();
    const activeUrl = keys.url;
    const activeKey = keys.key;

    if (!activeUrl || !activeKey) {
      alert('សូមបំពេញ URL និង Anon Key របស់ Supabase ជាមុនសិន!');
      return;
    }
    setDbSyncing(true);
    setDbStatus('កំពុងផ្ទៀងផ្ទាត់ការតភ្ជាប់ទៅកាន់ Supabase...');
    const client = getSupabaseClient();
    if (!client) {
      setDbStatus('កំហុស៖ មិនអាចបង្កើតដំណភ្ជាប់បានទេ។ សូមពិនិត្យ URL ឡើយវិញ!');
      setSupabaseConnected('error');
      setDbSyncing(false);
      return;
    }

    try {
      const { data, error } = await client.from('class_config').select('id').limit(1);
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setDbStatus('តភ្ជាប់ទៅកាន់ API ជោគជ័យ! ប៉ុន្តែមិនទាន់មានតារាងក្នុង Supabase ឡើយ។');
          setSupabaseConnected('success');
          alert('តភ្ជាប់បានជោគជ័យ! ប៉ុន្តែតារាង (Tables) មិនទាន់ត្រូវបានបង្កើតឡើងក្នុង Supabase API ឡើយ។ សូមចម្លងកូដ SQL ខាងក្រោមទៅដំណើរការក្នុង Supabase SQL Editor។');
          return;
        }
        throw error;
      }
      setDbStatus('ការភ្ជាប់ទៅកាន់ Supabase សកម្ម និងដំណើរការបានល្អប្រសើរ!');
      setSupabaseConnected('success');
      alert('ផ្ទៀងផ្ទាត់ការតភ្ជាប់៖ ជោគជ័យពេញលេញ! (Connected Successfully)');
    } catch (err: any) {
      console.error(err);
      setDbStatus(`បរាជ័យ៖ ${err.message || err}`);
      setSupabaseConnected('error');
      alert(`កំហុសក្នុងការតភ្ជាប់៖ ${err.message || err}`);
    } finally {
      setDbSyncing(false);
    }
  };

  const handlePushToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('សូមរៀបចំការតភ្ជាប់ Supabase ឱ្យបានរួចរាល់សិន!');
      return;
    }

    if (!confirm('តើអ្នកពិតជាចង់រុញ (Sync Push) ទិន្នន័យបច្ចុប្បន្នទៅកាន់ Supabase មែនទេ? វានឹងដំណើរការរុញ និងធ្វើបច្ចុប្បន្នភាពទិន្នន័យលើ Cloud និងលុប/ជំនួសទិន្នន័យចាស់ដែលមាន ID ដូចគ្នា។')) {
      return;
    }

    setDbSyncing(true);
    setDbStatus('កំពុងចាប់ផ្ដើមការបញ្ជូនទិន្នន័យ...');

    try {
      // 1. Convert and push students
      setDbStatus('កំពុងសម្រង់ និងផ្ញើទិន្នន័យសិស្ស...');
      const dbStudents = students.map(mapStudentToDB);
      if (dbStudents.length > 0) {
        const { error: err1 } = await client.from('students').upsert(dbStudents);
        if (err1) throw new Error('កំហុសតារាងសិស្ស (students)៖ ' + err1.message);
      }

      // 2. Convert and push subjects
      setDbStatus('កំពុងសម្រង់ និងផ្ញើទិន្នន័យមុខវិជ្ជា...');
      const dbSubjects = subjects.map(mapSubjectToDB);
      if (dbSubjects.length > 0) {
        const { error: err2 } = await client.from('subjects').upsert(dbSubjects);
        if (err2) throw new Error('កំហុសតារាងមុខវិជ្ជា (subjects)៖ ' + err2.message);
      }

      // 3. Convert and push scores
      setDbStatus('កំពុងសម្រង់ និងផ្ញើទិន្នន័យពិន្ទុ...');
      const dbScores = monthScores.map(mapMonthScoreToDB);
      if (dbScores.length > 0) {
        const { error: err3 } = await client.from('month_scores').upsert(dbScores);
        if (err3) throw new Error('កំហុសតារាងពិន្ទុ (month_scores)៖ ' + err3.message);
      }

      // 4. Convert and push config
      setDbStatus('កំពុងសម្រង់ និងផ្ញើព័ត៌មានការកំណត់ថ្នាក់...');
      const dbConfig = mapConfigToDB(config);
      const { error: err4 } = await client.from('class_config').upsert([dbConfig]);
      if (err4) throw new Error('កំហុសសរសេរការកំណត់ថ្នាក់ (class_config)៖ ' + err4.message);

      setDbStatus('សមកាលកម្មទិន្នន័យទៅកាន់ Supabase បានជោគជ័យទាំងស្រុង!');
      alert('បានសមកាលកម្មទិន្នន័យ (Sync Push) ទៅកាន់ Cloud Supabase ជាស្ថាពរ!');
    } catch (err: any) {
      console.error(err);
      setDbStatus(`បរាជ័យ៖ ${err.message || err}`);
      alert(`កំហុសក្នុងការសរសេរទិន្នន័យ៖ ${err.message || err}`);
    } finally {
      setDbSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('សូមរៀបចំការតភ្ជាប់ Supabase ឱ្យបានរួចរាល់សិន!');
      return;
    }

    if (!confirm('តើលោកអ្នកពិតជាចង់ទាញយកទិន្នន័យ (Sync Pull) ពី Supabase មែនទេ? វានឹងជំនួសទិន្នន័យបច្ចុប្បន្ននៅក្នុងឧបករណ៍នេះ។')) {
      return;
    }

    setDbSyncing(true);
    setDbStatus('កំពុងចាប់ផ្ដើមទាញយកទិន្នន័យ...');

    try {
      // 1. Fetch students utilizing chunk-iterator for >1000 records
      setDbStatus('កំពុងទាញយកទិន្នន័យសិស្ស (Chunk-Pagination > 1000 ច្រើនជួរ...)');
      const studentsRaw = await fetchPaginatedRows(client, 'students');
      const loadedStudents = studentsRaw.map(mapStudentFromDB);

      // 2. Fetch subjects
      setDbStatus('កំពុងទាញយកទិន្នន័យមុខវិជ្ជា...');
      const subjectsRaw = await fetchPaginatedRows(client, 'subjects');
      const loadedSubjects = subjectsRaw.map(mapSubjectFromDB);

      // 3. Fetch scores
      setDbStatus('កំពុងទាញយកព័ត៌មានទិន្នន័យពិន្ទុ...');
      const scoresRaw = await fetchPaginatedRows(client, 'month_scores');
      const loadedScores = scoresRaw.map(mapMonthScoreFromDB);

      // 4. Fetch config
      setDbStatus('កំពុងទាញយកការកំណត់ថ្នាក់...');
      const { data: configRaw, error: configErr } = await client
        .from('class_config')
        .select('*')
        .eq('id', 'current_config')
        .maybeSingle();

      if (configErr) throw new Error('កំហុសអានព័ត៌មានថ្នាក់៖ ' + configErr.message);

      let loadedConfig = config;
      if (configRaw) {
        loadedConfig = mapConfigFromDB(configRaw);
      }

      const totalPulled = loadedStudents.length + loadedSubjects.length + loadedScores.length;
      setDbStatus(`បានទាញទិន្នន័យបានជោគជ័យ! ចំនួនសរុប៖ ${totalPulled} ជួរ (សិស្ស: ${loadedStudents.length}, មុខវិជ្ជា: ${loadedSubjects.length}, ពិន្ទុ: ${loadedScores.length})`);
      
      saveState(loadedStudents, loadedSubjects, loadedScores, loadedConfig);
      alert(`ទាញយកទិន្នន័យជោគជ័យ! បញ្ចូលបាន៖ សិស្ស ${loadedStudents.length} នាក់, មុខវិជ្ជា ${loadedSubjects.length} និង ពិន្ទុ ${loadedScores.length} ជួរ។ (លក្ខខណ្ឌ pagination > ១០០០ ជួរដំណើរការល្អប្រសើរ!)`);
    } catch (err: any) {
      console.error(err);
      setDbStatus(`បរាជ័យទាញយក៖ ${err.message || err}`);
      alert(`កំហុសក្នុងការទាញយក៖ ${err.message || err}`);
    } finally {
      setDbSyncing(false);
    }
  };

  const renderDatabaseSettings = () => {
    const keys = getSupabaseKeys();

    return (
      <div className="space-y-6">
        {/* Core Maintenance Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-750" />
              <span>ប្រព័ន្ធគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ (System Data & Maintenance)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">បម្រុងទុក ស្ដារ ឬកំណត់ទិន្នន័យពិន្ទុ និងព័ត៌មានលម្អិតផ្សេងៗរបស់សិស្សទូទាំងកម្មវិធីសិក្សាដោយផ្ទាល់។</p>
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
                  className="flex items-center gap-2 py-2 px-3.5 bg-blue-750 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
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
        </div>

        {/* Supabase Dynamic Cloud Persistence Area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-indigo-650" />
                <span>ការតភ្ជាប់មូលដ្ឋានទិន្នន័យពពក Supabase (Supabase Integration)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">រៀបចំ និងផ្ទុករក្សាទុកទិន្នន័យគ្រប់ជ្រុងជ្រោយរបស់សាលារបស់លោកអ្នកដោយសុវត្ថិភាពខ្ពស់បំផុតនៅលើ Cloud។</p>
            </div>
            
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">ស្ថានភាព៖</span>
              {keys.isFromEnv ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-150">
                  <Check className="h-3 w-3" />
                  <span>.env / Vercel (ភ្ជាប់ស្រាប់)</span>
                </span>
              ) : keys.hasConfig ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-150">
                  <Server className="h-3 w-3" />
                  <span>Configured (ការកំណត់ក្នុងកុំព្យូទ័រ)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-150">
                  <AlertCircle className="h-3 w-3" />
                  <span>មិនទាន់កំណត់</span>
                </span>
              )}
            </div>
          </div>

          {/* Sync Operations Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Supabase configuration settings input */}
            <div className="lg:col-span-1 bg-slate-50/70 p-5 rounded-2xl border border-slate-180 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-slate-500" />
                <span>ការកំណត់ការភ្ជាប់</span>
              </h4>
              <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
                បញ្ចូលព័ត៌មានសម្ងាត់ API របស់ Supabase ដើម្បីរក្សាទុកទិន្នន័យពិន្ទុ។ គម្រោងឥតគិតថ្លៃ (Free Tier) ប្រឈមនឹងការកំណត់ល្បឿន ដូច្នេះប្រព័ន្ធត្រូវបានរៀបចំលក្ខខណ្ឌពិសេសដើម្បីទាញយកទិន្នន័យលើសពី ១០០០ ជួរដោយសុវត្ថិភាព!
              </p>

              <div className="space-y-4 pt-2">
                {/* Product URL Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Supabase Project URL</label>
                  <input
                    type="text"
                    disabled={keys.isFromEnv}
                    placeholder="https://your-project.supabase.co"
                    value={sbUrl}
                    onChange={(e) => {
                      setSbUrl(e.target.value);
                      saveSupabaseCredentials(e.target.value.trim(), sbKey);
                    }}
                    className={`w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-150 font-mono text-slate-700 ${
                      keys.isFromEnv ? 'bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                </div>

                {/* API Anon Key Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Supabase Anon Key</label>
                  <input
                    type="password"
                    disabled={keys.isFromEnv}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={sbKey}
                    onChange={(e) => {
                      setSbKey(e.target.value);
                      saveSupabaseCredentials(sbUrl, e.target.value.trim());
                    }}
                    className={`w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-150 font-mono text-slate-700 ${
                      keys.isFromEnv ? 'bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed' : 'bg-white'
                    }`}
                  />
                </div>

                {keys.isFromEnv && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <p className="text-[10px] font-bold text-indigo-855 leading-normal">
                      🔒 បានចាក់សោស្វ័យប្រវត្តពីព្រោះព័ត៌មានសម្ងាត់ត្រូវបានតម្លើងរួចជាស្រេចនៅក្នុងឯកសារសុវត្ថិភាព .env ឬ Vercel Dashboard ។
                    </p>
                  </div>
                )}
                
                {dbStatus && (
                  <div className="p-2.5 rounded-lg text-[11px] font-semibold bg-blue-50 border border-blue-150 text-blue-800 animate-pulse">
                    <span>📢 ស្ថានភាព៖ {dbStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sync actions operations and dashboard control */}
            <div className="lg:col-span-2 space-y-5">
              <div className="border border-slate-200 rounded-2xl bg-slate-50/30 p-5 space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-slate-705 tracking-wider block">ការសមកាលកម្មទិន្នន័យ (Cloud Synchronization Controls)</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  លោកអ្នកអាចរុញ (Push) ទិន្នន័យបច្ចុប្បន្នដែលនៅក្នុងឧបករណ៍មូលដ្ឋាននេះទៅក្នុង Cloud ដើម្បីបម្រុងទុក ឬទាញយកទិន្នន័យមកវិញ (Pull) នៅលើឧបករណ៍ថ្មីបានគ្រប់ពេលវេលា។
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Test Connection Button */}
                  <button
                    onClick={handleTestConnection}
                    disabled={dbSyncing}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-755 border border-slate-250 rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:scale-[1.01] shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 text-slate-600 ${dbSyncing ? 'animate-spin' : ''}`} />
                    <span>ផ្ទៀងផ្ទាត់ការតភ្ជាប់</span>
                  </button>

                  {/* Sync Pull Button */}
                  <button
                    onClick={handlePullFromSupabase}
                    disabled={dbSyncing || !keys.hasConfig}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:scale-[1.01] shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="ទាញទិន្នន័យពី Supabase (Pagination > 1000 ច្រើនជួរសកម្ម)"
                  >
                    <Download className="h-4 w-4" />
                    <span>ទាញទិន្នន័យមកវិញ (Pull)</span>
                  </button>

                  {/* Sync Push Button */}
                  <button
                    onClick={handlePushToSupabase}
                    disabled={dbSyncing || !keys.hasConfig}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 bg-indigo-750 hover:bg-indigo-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:scale-[1.01] shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    <span>សមកាលកម្មទៅ Cloud (Push)</span>
                  </button>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-900 leading-relaxed">
                  💡 <strong>ចំណុចពិសេសសម្រាប់ការទាញទិន្នន័យលើសពី ១០០០ ជួរ ( ফ্রি Tier bypass)៖</strong> ដោយហេតុតែទំហំ API Response របស់ Supabase Fee ត្រូវបានលីមីតត្រឹម ១០០០ ជួរក្នុងមួយសំណើ យើងបានបន្ថែមលក្ខខណ្ឌ <strong>Cursor-Pagination Loop</strong> ជួយបំបែកសំណើទាញយកទិន្នន័យជាកញ្ចប់ៗម្ដង ១០០០ រហូតដល់អស់ រួចផ្គុំបញ្ចូលគ្នាវិញ ទោះជាទិន្នន័យរបស់អ្នកមានដល់ ១០,០០០ ជួរក៏គ្មានបញ្ហា!
                </div>
              </div>

              {/* Vercel Environment variables setup guide */}
              <div className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-indigo-800">
                  <Building className="h-4 w-4 text-indigo-700" />
                  <span className="font-bold text-xs uppercase tracking-wider block">សេចក្ដីណែនាំអំពីការកំណត់ព័ត៌មាន API ក្នុង Vercel (Vercel Setup Guide)</span>
                </div>
                
                <p className="text-slate-600 text-xs leading-relaxed">
                  ដើម្បីឱ្យការតភ្ជាប់ Supabase របស់លោកអ្នកមានស្ថិរភាព និងរក្សាបាននូវសុវត្ថិភាពគោកមិនបាត់បង់ពេល Deploy ទៅកាន់ <strong>Vercel</strong> នោះ សូមអនុវត្តជំហានខាងក្រោម៖
                </p>

                <ol className="text-xs text-slate-550 list-decimal pl-4.5 space-y-1.5 leading-relaxed">
                  <li>ចូលទៅកាន់គណនី <strong>Vercel Desktop Dashboard</strong> របស់អ្នក រួចជ្រើសរើសយកគម្រោងកម្មវិធីនេះ។</li>
                  <li>ចុចលើផ្ទាំង <strong>Settings</strong> រួចជ្រើសរើសយកម៉ឺនុយ <strong>Environment Variables</strong> ពីខាងឆ្វេង។</li>
                  <li>បន្ថែមអថេរថ្មីទី១៖ ដាក់ <code>VITE_SUPABASE_URL</code> ជា <strong>Key</strong> និងចម្លងយក URL របស់ Supabase មករៀបចំដាក់ក្នុងប្រអប់ <strong>Value</strong> ។</li>
                  <li>បន្ថែមអថេរថ្មីទី២៖ ដាក់ <code>VITE_SUPABASE_ANON_KEY</code> ជា <strong>Key</strong> និងចម្លងយក Anon Key របស់ Supabase មករៀបចំដាក់ក្នុងប្រអប់ <strong>Value</strong> ។</li>
                  <li>ចុចប៊ូតុង <strong>Save</strong> រួចហើយចុចពាក្យ <strong>Redeploy</strong> Project របស់លោកអ្នកនៅក្នុង Vercel ជាការស្រេច!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Collapsible Supabase SQL Script area for copy-ready schema creation */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">សំណេរកូដបង្កើតតារាង SQL (Database Setup SQL Script)</h4>
                <p className="text-[11px] text-slate-450 mt-0.5">ចម្លងកូដរៀបចំរចនាសម្ព័ន្ធនេះ យកទៅដំណើរការក្នុង Supabase SQL Editor ដើម្បីដំណើរការប្រព័ន្ធបានជោគជ័យទាំងស្រុង។</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_CREATION);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shrink-0 ${
                  copiedSql 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-250 shadow-inner'
                }`}
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>បានចម្លងជោគជ័យ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-550" />
                    <span>ចម្លងកូដ SQL (Copy Code)</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-[180px] border border-slate-800 leading-relaxed shadow-inner">
              {SUPABASE_SQL_CREATION}
            </pre>
          </div>
        </div>

        {/* Factory Reset Area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
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
                className={config.className}
                teacherName={config.teacherName}
                academicYear={config.academicYear}
                selectedMonth={config.selectedMonth}
                onAddStudent={handleAddStudent}
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
