import React, { useState } from 'react';
import { Student, Subject, MonthScore, Gender } from '../types';
import { computeMonthlyResults } from '../utils/calculations';
import { Trophy, Award, Stars, Printer, FileSpreadsheet, Users, Sparkles, Home, MapPin, School } from 'lucide-react';

interface HonorRollProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
}

const khmerRanks = ['', '១', '២', '៣', '៤', '៥'];

// Student portrait SVG component for fallback visuals
function StudentPortrait({ gender, nameKh }: { gender: Gender; nameKh: string }) {
  const isGirl = gender === 'ស្រី';
  
  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-sky-100 border border-slate-300">
      {isGirl ? (
        <svg className="w-full h-full object-cover" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <radialGradient id="girlBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>
          <rect width="100" height="120" fill="url(#girlBg)" />
          
          {/* Hair back */}
          <path d="M 28 52 C 25 78 30 105 30 105 L 70 105 C 70 105 75 78 72 52 Z" fill="#1e1b4b" />

          {/* White school collar shirt */}
          <path d="M 12 120 C 18 92 35 90 50 90 C 65 90 82 92 88 120 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Red neck ribbon badge */}
          <path d="M 45 93 L 50 102 L 55 93 L 50 89 Z" fill="#be123c" />
          {/* Left collar */}
          <path d="M 32 86 L 47 92 L 46 83 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
          {/* Right collar */}
          <path d="M 68 86 L 53 92 L 54 83 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

          {/* Neck */}
          <path d="M 40 70 Q 50 84 60 70 L 60 84 Q 50 84 40 84 Z" fill="#ffedd5" />
          
          {/* Ears */}
          <circle cx="33" cy="57" r="4.5" fill="#fed7aa" />
          <circle cx="67" cy="57" r="4.5" fill="#fed7aa" />
          
          {/* Face */}
          <path d="M 35 47 Q 50 24 65 47 Q 65 72 50 74 Q 35 72 35 47 Z" fill="#fed7aa" />
          
          {/* Hair front / Bangs */}
          <path d="M 31 47 C 30 35 37 19 50 19 C 63 19 70 35 69 47 C 65 44 63 44 50 42 C 37 44 35 44 31 47 Z" fill="#1e1b4b" />
          
          {/* Red ribbon hair clips */}
          <ellipse cx="37" cy="33" rx="2.5" ry="1.5" fill="#f43f5e" />
          <ellipse cx="63" cy="33" rx="2.5" ry="1.5" fill="#f43f5e" />

          {/* Eyes */}
          <circle cx="43" cy="50" r="2.2" fill="#0f172a" />
          <circle cx="57" cy="50" r="2.2" fill="#0f172a" />
          
          {/* Eyebrows */}
          <path d="M 39 45 Q 43 43 46 45.5" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M 61 45 Q 57 43 54 45.5" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />
          
          {/* Smile */}
          <path d="M 44 62 Q 50 67 56 62" stroke="#9a3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-full h-full object-cover" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
          <radialGradient id="boyBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>
          <rect width="100" height="120" fill="url(#boyBg)" />
          
          {/* White shirt shoulders */}
          <path d="M 12 120 C 18 92 35 90 50 90 C 65 90 82 92 88 120 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Blue details */}
          <line x1="50" y1="92" x2="50" y2="120" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
          
          {/* Left collar */}
          <path d="M 32 86 L 47 92 L 46 83 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
          {/* Right collar */}
          <path d="M 68 86 L 53 92 L 54 83 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

          {/* Neck */}
          <path d="M 40 70 Q 50 84 60 70 L 60 84 Q 50 84 40 84 Z" fill="#ffedd5" />
          
          {/* Ears */}
          <circle cx="33" cy="57" r="5" fill="#fed7aa" />
          <circle cx="67" cy="57" r="5" fill="#fed7aa" />
          
          {/* Face */}
          <path d="M 35 47 Q 50 24 65 47 Q 65 72 50 74 Q 35 72 35 47 Z" fill="#fed7aa" />
          
          {/* Hair */}
          <path d="M 31 47 C 28 35 36 17 50 17 C 64 17 72 35 69 47 C 65 43 63 43 60 41 C 55 44 45 44 40 41 C 37 43 35 43 31 47 Z" fill="#1c1917" />
          
          {/* Eyes */}
          <circle cx="43" cy="50" r="2.2" fill="#0f172a" />
          <circle cx="57" cy="50" r="2.2" fill="#0f172a" />
          
          {/* Eyebrows */}
          <path d="M 39 45 Q 43 43 46 45.5" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M 61 45 Q 57 43 54 45.5" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />
          
          {/* Smile */}
          <path d="M 44 62 Q 50 67 56 62" stroke="#9a3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// School emblem logo SVG replica from template image
function SchoolEmblemSVG() {
  return (
    <svg className="w-11 h-11 pointer-events-none drop-shadow-xs shrink-0" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 2 C 45 2 52 8 52 24 C 52 44 30 58 30 58 C 30 58 8 44 8 24 C 8 8 15 2 30 2 Z" fill="#A13333" stroke="#D4AF37" strokeWidth="2.5" />
      <path d="M 30 5 C 42 5 49 10 49 24 C 49 41 30 54 30 54 C 30 54 11 41 11 24 C 11 10 18 5 30 5 Z" fill="#1E3A8A" />
      <polygon points="30,12 32.5,17 38,17 33.5,20 35,25 30,21.5 25,25 26.5,20 22,17 27.5,17" fill="#D4AF37" />
      <text x="30" y="36" fill="#ffffff" fontSize="10.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">USA</text>
      <text x="30" y="44" fill="#FACC15" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">PRIMARY SCHOOL</text>
    </svg>
  );
}

// Laurel wreaths decorations wrapping around portraits
function LaurelWreathSVG() {
  return (
    <svg className="absolute -inset-x-7 -inset-y-5 w-[calc(100%+56px)] h-[calc(100%+40px)] pointer-events-none text-amber-500 z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor">
      {/* Left laurel branch */}
      <path d="M 22,82 C 10,65 14,35 38,18" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"/>
      <path d="M 21,73 C 17,70 16,64 20,61 C 24,58 26,63 24,69 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 18,60 C 14,57 13,51 17,48 C 21,45 23,50 21,56 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 17,46 C 13,43 13,37 17,34 C 21,31 23,36 21,42 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 20,32 C 16,29 17,23 21,20 C 25,17 27,22 25,28 Z" fill="currentColor" opacity="0.9"/>
      
      {/* Right laurel branch */}
      <path d="M 78,82 C 90,65 86,35 62,18" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"/>
      <path d="M 79,73 C 83,70 84,64 80,61 C 76,58 74,63 76,69 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 82,60 C 86,57 87,51 83,48 C 79,45 77,50 79,56 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 83,46 C 87,43 87,37 83,34 C 79,31 77,36 79,42 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 80,32 C 84,29 83,23 79,20 C 75,17 73,22 75,28 Z" fill="currentColor" opacity="0.9"/>
    </svg>
  );
}

// Generate dynamic authentic Cambodian lunar calendar dates based on solar month & year
function getKhmerLunarCalendarDate(month: string, yearStr: string) {
  const yearNum = parseInt(yearStr.replace(/\D/g, '')) || 2026;
  const beYear = yearNum + 543 + (month === 'មករា' || month === 'កុម្ភៈ' || month === 'មីនា' || month === 'មេសា' ? 0 : 1);
  
  const zodiacs = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមី", "មមែ", "វក", "រកា", "ច", "កុរ"];
  const zodiacIndex = (yearNum - 4) % 12;
  const zodiac = zodiacs[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12];

  const eras = ["ឯកស័ក", "ទោស័ក", "ត្រីស័ក", "ចត្វាស័ក", "បញ្ចស័ក", "ឆស័ក", "សប្តស័ក", "អដ្ឋស័ក", "នព្វស័ក", "សំរឹទ្ធិស័ក"];
  const eraIndex = (yearNum - 2024 + 10) % 10;
  const era = eras[(eraIndex + 6) % 10];
  
  const lunarMonths: Record<string, string> = {
    'មករា': 'ខែបុស្ស',
    'កុម្ភៈ': 'ខែម៉ាឃ',
    'មីនា': 'ខែផល្គុន',
    'មេសា': 'ខែចេត្រ',
    'ឧសភា': 'ខែពិសាខ',
    'មិថុនា': 'ខែជេស្ឋ',
    'កក្កដា': 'ខែអាសាឍ',
    'សីហា': 'ខែស្រាពណ៍',
    'កញ្ញា': 'ខែភទ្របទ',
    'តុលា': 'ខែអស្សុជ',
    'វិច្ឆិកា': 'ខែកត្តិក',
    'ធ្នូ': 'ខែមិគសិរ'
  };
  
  const lMonth = lunarMonths[month] || 'ខែមិគសិរ';
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  
  const toKhmerDigits = (val: number | string) => {
    return String(val).split('').map(char => {
      const idx = parseInt(char);
      return isNaN(idx) ? char : khmerDigits[idx];
    }).join('');
  };

  return `ថ្ងៃសុក្រ ៧កើត ${lMonth} ឆ្នាំ${zodiac} ${era} ព.ស.${toKhmerDigits(beYear)}`;
}

export default function HonorRoll({
  students,
  subjects,
  monthScores,
  className,
  teacherName,
  academicYear,
  selectedMonth,
}: HonorRollProps) {
  const results = computeMonthlyResults(students, subjects, monthScores);
  const top5 = results.slice(0, 5);

  // States according to MoEYS standards
  const [activeCertIndex, setActiveCertIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'poster' | 'certificates'>('poster');
  const [customMinistryName, setCustomMinistryName] = useState('ក្រសួងអប់រំ យុវជន និងកីឡា');
  const [customProvinceName, setCustomProvinceName] = useState('មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង');
  const [customDistrictName, setCustomDistrictName] = useState('ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកសង្កែ');
  const [customSchoolName, setCustomSchoolName] = useState('សាលាបឋមសិក្សាវត្តចចង');
  const [customBranchName, setCustomBranchName] = useState('សាខា វត្តចចង');

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export functions
  const exportHonorRoll = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    const headers = ["លំដាប់ថ្នាក់សិស្សពូកែ", "ឈ្មោះភាសាខ្មែរ", "ឈ្មោះឡាតាំង", "ភេទ", "មធ្យមភាគ", "និទ្ទេស"];
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    top5.forEach((res, index) => {
      const row = [index + 1, res.student.nameKh, res.student.nameEn, res.student.gender, res.average, res.gradeLetter];
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\r\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `បញ្ជីឈ្មោះសិស្សពូកែទាំង៥_ខែ_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudentsList = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    const headers = [
      "អត្តលេខ",
      "ឈ្មោះភាសាខ្មែរ",
      "ឈ្មោះឡាតាំង",
      "ភេទ",
      "ថ្ងៃខែឆ្នាំកំណើត",
      "ទីកន្លែងកំណើត",
      "ឈ្មោះឪពុក",
      "ឈ្មោះម្តាយ",
      "លេខទូរស័ព្ទ",
      "អាសយដ្ឋានបច្ចុប្បន្ន",
      "សីលធម៌"
    ];
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    students.forEach((student, index) => {
      const row = [
        index + 1,
        student.nameKh,
        student.nameEn,
        student.gender,
        student.dob || '',
        student.birthPlace || '',
        student.fatherName || '',
        student.motherName || '',
        student.phone || '',
        student.address || '',
        student.conduct
      ];
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\r\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `បញ្ជីឈ្មោះសិស្ស_សរុប_បឋមសិក្សា.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className}>
      {/* Top action controls panel (No-Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: View Mode Switches */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-250">
          <button
            onClick={() => setViewMode('poster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'poster'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>តារាងកិត្តិយស (Poster)</span>
          </button>
          <button
            onClick={() => setViewMode('certificates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'certificates'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            <span>សន្លឹកប័ណ្ណសរសើរ (Individual)</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportHonorRoll}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-50 border border-blue-200 text-blue-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs"
            title="នាំចេញគំនូសបំពេញពិន្ទុសិស្សពូកែទាំង៥ទៅកាន់ CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>នាំចេញសិស្សពូកែទាំង៥</span>
          </button>

          <button
            onClick={exportStudentsList}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs"
            title="នាំចេញប្រវត្តិរូបសិស្សទាំងអស់ទៅជាឯកសារ CSV/Excel"
          >
            <Users className="h-3.5 w-3.5" />
            <span>នាំចេញបញ្ជីសិស្ស</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>បោះពុម្ព (Print)</span>
          </button>
        </div>
      </div>

      {/* Customizable school metadata entry area */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 border-slate-150 mb-6 font-sans">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ក្រសួងសាមី</label>
          <input
            type="text"
            value={customMinistryName}
            onChange={(e) => setCustomMinistryName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">មន្ទីរអប់រំខេត្ត/រាជធានី</label>
          <input
            type="text"
            value={customProvinceName}
            onChange={(e) => setCustomProvinceName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ការិយាល័យអប់រំស្រុក/ខណ្ឌ</label>
          <input
            type="text"
            value={customDistrictName}
            onChange={(e) => setCustomDistrictName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ឈ្មោះសាលារៀន</label>
          <input
            type="text"
            value={customSchoolName}
            onChange={(e) => setCustomSchoolName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ព័ត៌មានទីតាំង / សាខា</label>
          <input
            type="text"
            value={customBranchName}
            onChange={(e) => setCustomBranchName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main layouts switcher container */}
      {viewMode === 'poster' ? (
        /* ==================== POSTER VIEW ==================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 overflow-x-auto">
          {top5.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              មិនទាន់មានសិស្សនៅក្នុងតារាងកិត្តិយសនៅឡើយទេ។ សូមបំពេញពិន្ទុជាមុន។
            </div>
          ) : (
            <div 
              className="min-w-[700px] max-w-[210mm] mx-auto p-8 rounded-xl border border-slate-300 relative print-area select-none"
              style={{
                background: `linear-gradient(rgba(240, 246, 252, 0.95), rgba(240, 246, 252, 0.98)), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147, 197, 253, 0.15) 2px, rgba(147, 197, 253, 0.15) 4px)`,
              }}
            >
              {/* Outer decorative dashed border */}
              <div className="absolute inset-2.5 border-2 border-dashed border-slate-400 pointers-events-none rounded-lg"></div>

              {/* National and School Banner Header */}
              <div className="relative mt-2 grid grid-cols-3 items-start pb-4 z-10 px-4">
                {/* Left side: School metadata */}
                <div className="flex items-center gap-2.5">
                  <SchoolEmblemSVG />
                  <div className="space-y-0.5">
                    <h4 className="font-moul text-[10px] text-slate-800 leading-normal">{customSchoolName}</h4>
                    <p className="text-[10px] text-slate-600 font-semibold">{customBranchName}</p>
                  </div>
                </div>

                {/* Middle: National Title */}
                <div className="text-center space-y-1">
                  <h3 className="font-moul text-[11px] text-slate-800 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                  <h4 className="font-moul text-[9px] text-slate-700 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                  <div className="flex justify-center py-1">
                    <svg width="45" height="10" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500 block">
                      <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Right side: Academic details */}
                <div className="text-right space-y-0.5 text-xs text-slate-600 font-semibold">
                  <p>ឆ្នាំសិក្សា៖ <span className="text-slate-850 font-bold font-mono text-[11px]">{academicYear}</span></p>
                  <p>ថ្នាក់ទី៖ <span className="text-slate-850 font-bold text-[11px]">{className}</span></p>
                </div>
              </div>

              {/* Poster Main Title */}
              <div className="relative text-center py-4 z-10 mt-2">
                <h1 className="font-moul text-3xl text-red-650 tracking-wider inline-block leading-normal" style={{ textShadow: '2px 2.5px 0px rgba(212,175,55,0.45)' }}>
                  តារាងកិត្តិយស
                </h1>
                <div className="mt-2.5">
                  <span className="inline-block px-7 py-1.5 bg-blue-800 text-yellow-300 font-moul text-sm tracking-wider rounded-full shadow-sm">
                    ប្រចាំខែ{selectedMonth}
                  </span>
                </div>
              </div>

              {/* Podium & Portraits Layout */}
              <div className="relative z-10 my-10 max-w-5xl mx-auto px-4 space-y-10">
                {/* 1st Place (Center-top block) */}
                <div className="flex justify-center">
                  {top5[0] && (
                    <div className="text-center w-[180px]">
                      <div className="relative w-28 h-36 mx-auto">
                        <LaurelWreathSVG />
                        
                        {/* Avatar backdrop */}
                        <div className="relative w-full h-full z-10 rounded-lg overflow-hidden ring-4 ring-amber-400 shadow-md">
                          <StudentPortrait gender={top5[0].student.gender} nameKh={top5[0].student.nameKh} />
                        </div>

                        {/* Rank 1 Crown Medal badge */}
                        <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
                          <div className="h-9 w-9 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 font-moul text-lg font-bold shadow-md transform hover:scale-110 transition-transform">
                            {khmerRanks[1]}
                          </div>
                        </div>
                      </div>

                      {/* Name Plate */}
                      <div className="relative mt-4 mx-auto max-w-[170px]">
                        <div className="relative px-3 py-1.5 rounded-lg border-2 border-amber-400 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-amber-200 shadow-lg text-center">
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-amber-400 text-[10px] select-none">⚜️</div>
                          <span className="block font-moul text-[11px] text-yellow-300 tracking-wide font-normal truncate px-1.5 leading-relaxed">
                            {top5[0].student.nameKh}
                          </span>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-amber-400 text-[10px] select-none">⚜️</div>
                        </div>
                        <div className="text-[10px] text-blue-900 font-bold mt-1.5 leading-snug">
                          <p>មធ្យមភាគ៖ <span className="font-mono text-sm">{top5[0].average}</span></p>
                          <p className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block border border-emerald-100 text-[9px] mt-0.5 uppercase">
                            និទ្ទេស៖ {top5[0].gradeLetter}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2nd & 3rd Places (Middle row) */}
                <div className="grid grid-cols-2 gap-x-20 justify-items-center max-w-2xl mx-auto pt-2">
                  {/* Rank 2 (Left side) */}
                  <div className="text-center w-[160px]">
                    {top5[1] ? (
                      <div>
                        <div className="relative w-24 h-32 mx-auto">
                          <LaurelWreathSVG />
                          
                          <div className="relative w-full h-full z-10 rounded-lg overflow-hidden ring-4 ring-amber-400 shadow-md">
                            <StudentPortrait gender={top5[1].student.gender} nameKh={top5[1].student.nameKh} />
                          </div>

                          <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
                            <div className="h-8.5 w-8.5 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 font-moul text-base font-bold shadow-md">
                              {khmerRanks[2]}
                            </div>
                          </div>
                        </div>

                        {/* Name plate */}
                        <div className="relative mt-4 mx-auto">
                          <div className="relative px-2 py-1 rounded-lg border-[1.5px] border-amber-400 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-amber-200 shadow-md text-center">
                            <span className="block font-moul text-[10px] text-yellow-300 tracking-wide font-normal truncate leading-relaxed">
                              {top5[1].student.nameKh}
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-900 font-bold mt-1.5 leading-snug">
                            <p>មធ្យមភាគ៖ <span className="font-mono">{top5[1].average}</span></p>
                            <p className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-110 text-[8.5px] mt-0.5 uppercase">
                              និទ្ទេស៖ {top5[1].gradeLetter}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-350 bg-slate-100/50 rounded-lg p-6 text-slate-400 text-[10px] italic">
                        ទំនេរ
                      </div>
                    )}
                  </div>

                  {/* Rank 3 (Right side) */}
                  <div className="text-center w-[160px]">
                    {top5[2] ? (
                      <div>
                        <div className="relative w-24 h-32 mx-auto">
                          <LaurelWreathSVG />
                          
                          <div className="relative w-full h-full z-10 rounded-lg overflow-hidden ring-4 ring-amber-400 shadow-md">
                            <StudentPortrait gender={top5[2].student.gender} nameKh={top5[2].student.nameKh} />
                          </div>

                          <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
                            <div className="h-8.5 w-8.5 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 font-moul text-base font-bold shadow-md">
                              {khmerRanks[3]}
                            </div>
                          </div>
                        </div>

                        {/* Name plate */}
                        <div className="relative mt-4 mx-auto">
                          <div className="relative px-2 py-1 rounded-lg border-[1.5px] border-amber-400 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-amber-200 shadow-md text-center">
                            <span className="block font-moul text-[10px] text-yellow-300 tracking-wide font-normal truncate leading-relaxed">
                              {top5[2].student.nameKh}
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-900 font-bold mt-1.5 leading-snug">
                            <p>មធ្យមភាគ៖ <span className="font-mono">{top5[2].average}</span></p>
                            <p className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-110 text-[8.5px] mt-0.5 uppercase">
                              និទ្ទេស៖ {top5[2].gradeLetter}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-350 bg-slate-100/50 rounded-lg p-6 text-slate-400 text-[10px] italic">
                        ទំនេរ
                      </div>
                    )}
                  </div>
                </div>

                {/* 4th & 5th Places (Lower row) */}
                <div className="grid grid-cols-2 gap-x-20 justify-items-center max-w-2xl mx-auto pt-4">
                  {/* Rank 4 (Left) */}
                  <div className="text-center w-[160px]">
                    {top5[3] ? (
                      <div>
                        <div className="relative w-24 h-32 mx-auto">
                          <LaurelWreathSVG />
                          
                          <div className="relative w-full h-full z-10 rounded-lg overflow-hidden ring-4 ring-amber-400 shadow-md">
                            <StudentPortrait gender={top5[3].student.gender} nameKh={top5[3].student.nameKh} />
                          </div>

                          <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
                            <div className="h-8.5 w-8.5 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 font-moul text-base font-bold shadow-md">
                              {khmerRanks[4]}
                            </div>
                          </div>
                        </div>

                        {/* Name plate */}
                        <div className="relative mt-4 mx-auto">
                          <div className="relative px-2 py-1 rounded-lg border-[1.5px] border-amber-400 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-amber-200 shadow-md text-center">
                            <span className="block font-moul text-[10px] text-yellow-300 tracking-wide font-normal truncate leading-relaxed">
                              {top5[3].student.nameKh}
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-900 font-bold mt-1.5 leading-snug">
                            <p>មធ្យមភាគ៖ <span className="font-mono">{top5[3].average}</span></p>
                            <p className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-110 text-[8.5px] mt-0.5 uppercase">
                              និទ្ទេស៖ {top5[3].gradeLetter}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-350 bg-slate-100/50 rounded-lg p-6 text-slate-400 text-[10px] italic">
                        ទំនេរ
                      </div>
                    )}
                  </div>

                  {/* Rank 5 (Right) */}
                  <div className="text-center w-[160px]">
                    {top5[4] ? (
                      <div>
                        <div className="relative w-24 h-32 mx-auto">
                          <LaurelWreathSVG />
                          
                          <div className="relative w-full h-full z-10 rounded-lg overflow-hidden ring-4 ring-amber-400 shadow-md">
                            <StudentPortrait gender={top5[4].student.gender} nameKh={top5[4].student.nameKh} />
                          </div>

                          <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
                            <div className="h-8.5 w-8.5 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-amber-300 font-moul text-base font-bold shadow-md">
                              {khmerRanks[5]}
                            </div>
                          </div>
                        </div>

                        {/* Name plate */}
                        <div className="relative mt-4 mx-auto">
                          <div className="relative px-2 py-1 rounded-lg border-[1.5px] border-amber-400 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-amber-200 shadow-md text-center">
                            <span className="block font-moul text-[10px] text-yellow-300 tracking-wide font-normal truncate leading-relaxed">
                              {top5[4].student.nameKh}
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-900 font-bold mt-1.5 leading-snug">
                            <p>មធ្យមភាគ៖ <span className="font-mono">{top5[4].average}</span></p>
                            <p className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-110 text-[8.5px] mt-0.5 uppercase">
                              និទ្ទេស៖ {top5[4].gradeLetter}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-350 bg-slate-100/50 rounded-lg p-6 text-slate-400 text-[10px] italic">
                        ទំនេរ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Printable approval blocks / signatures at poster bottom */}
              <div className="relative mt-12 grid grid-cols-2 text-center text-[11px] text-slate-700 z-10 px-6 pt-6">
                <div>
                  <p>បានឃើញ និងឯកភាព</p>
                  <p className="font-moul text-[9px] pt-1 leading-relaxed">នាយិកាសាលា</p>
                  <div className="h-20"></div>
                  <p>................................................</p>
                </div>
                <div>
                  <p className="italic text-slate-600 font-bold text-[10.5px]">
                    {getKhmerLunarCalendarDate(selectedMonth, academicYear)}
                  </p>
                  <p className="font-moul text-[9px] pt-1.5 leading-relaxed">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-900 text-sm">{teacherName || '................................'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== CERTIFICATES VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left index roster selection: List of Top 5 students in Podium with gold/silver accents */}
          <div className="lg:col-span-4 space-y-4 no-print">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider block px-1 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>ជ្រើសរើសសិស្សពូកែ</span>
            </h4>

            {top5.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                មិនទាន់មានសិស្សនៅក្នុងតារាងកិត្តិយសនៅឡើយទេ។ សូមបំពេញពិន្ទុជាមុន។
              </div>
            ) : (
              <div className="space-y-2">
                {top5.map((res, index) => {
                  const rank = index + 1;
                  const isActive = activeCertIndex === index;
                  
                  const rankColors = 
                    rank === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    rank === 2 ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    rank === 3 ? 'bg-amber-50 text-amber-900 border-amber-150' :
                    'bg-blue-50 text-blue-700 border-blue-100';

                  const rankText = 
                    rank === 1 ? 'ជើងឯកផ្នែកសិក្សា (លំដាប់ទី១)' :
                    rank === 2 ? 'លំដាប់ទី២ (🥈)' :
                    rank === 3 ? 'លំដាប់ទី៣ (🥉)' :
                    `លំដាប់ទី${rank}`;

                  return (
                    <div
                      key={res.student.id}
                      onClick={() => setActiveCertIndex(index)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-white ${
                        isActive 
                          ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs border shadow-xs ${rankColors}`}>
                          {rank}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-[14px]">{res.student.nameKh}</h5>
                          <p className="text-[9px] text-slate-400 font-mono tracking-wide uppercase">{res.student.nameEn}</p>
                          <span className="text-[10px] text-slate-500 block">{rankText}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-semibold">មធ្យមភាគ</span>
                        <span className="text-sm font-bold font-mono text-blue-800">{res.average}</span>
                        <span className="block text-[8.5px] text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-50 rounded mt-0.5 border border-emerald-100 uppercase">
                          {res.gradeLetter}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right workspace element printable landscape certificate view */}
          <div className="lg:col-span-8">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider block px-1 flex items-center gap-1.5 no-print mb-4">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>រូបភាពវិញ្ញាបនបត្រ / ប័ណ្ណសរសើរ</span>
            </h4>

            {top5.length > 0 && top5[activeCertIndex] ? (
              (() => {
                const currentHonoree = top5[activeCertIndex];
                const student = currentHonoree.student;
                const khmerRankChar = khmerRanks[currentHonoree.rank] || toKhmerDigits(currentHonoree.rank);

                function toKhmerDigits(val: number | string) {
                  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
                  return String(val).split('').map(char => {
                    const idx = parseInt(char);
                    return isNaN(idx) ? char : khmerDigits[idx];
                  }).join('');
                }

                return (
                  <div 
                    className="bg-stone-50 border-[10px] border-brand-gold-dark/80 p-8 shadow-md rounded-lg max-w-[297mm] mx-auto print-area relative overflow-hidden"
                    style={{
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      aspectRatio: '1.414/1'
                    }}
                  >
                    {/* Borders and floral caps */}
                    <div className="absolute inset-2 border-2 border-brand-gold/60 pointer-events-none rounded-sm"></div>
                    
                    <div className="absolute top-4 left-4 h-8 w-8 border-t-4 border-l-4 border-brand-red pointer-events-none"></div>
                    <div className="absolute top-4 right-4 h-8 w-8 border-t-4 border-r-4 border-brand-red pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-brand-red pointer-events-none"></div>
                    <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-brand-red pointer-events-none"></div>

                    <div className="text-center space-y-3 h-full flex flex-col justify-between py-2">
                      {/* Header Ministry Banner */}
                      <div className="grid grid-cols-3 items-start pb-3 border-b border-dashed border-slate-200 px-6">
                        <div className="text-left space-y-1">
                          <h4 className="font-moul text-[10px] text-slate-800 leading-normal">{customMinistryName}</h4>
                          <p className="text-[10px] font-bold text-slate-700">{customProvinceName}</p>
                          <p className="text-[9px] text-slate-500 italic mt-0.5">{customDistrictName}</p>
                        </div>
                        
                        <div className="text-center space-y-1 col-span-1">
                          <h3 className="font-moul text-[11px] text-slate-900 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                          <h4 className="font-moul text-[9px] text-slate-850 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                          <div className="flex justify-center py-0.5 mt-0.5">
                            <svg width="40" height="8" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 block">
                              <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>

                        <div className="text-right"></div>
                      </div>

                      {/* Header core banners */}
                      <div className="space-y-2 mt-4">
                        <span className="inline-block px-4 py-1.5 bg-brand-red text-white uppercase text-xs font-bold rounded-md tracking-wider shadow-xs font-moul leading-normal">
                          ប័ណ្ណសរសើរ (Honor Certificate)
                        </span>
                        <p className="text-slate-600 font-semibold text-xs py-1">
                          នាយកសាលាបឋមសិក្សារួមជាមួយលោកគ្រូ/អ្នកគ្រូប្រចាំថ្នាក់ សហការសម្រេចប្រគល់ជូន
                        </p>
                      </div>

                      {/* Identity profiles block */}
                      <div className="space-y-1.5">
                        <h2 className="font-moul text-xl text-brand-blue tracking-wide py-1">
                          សិស្ស៖ {student.nameKh}
                        </h2>
                        <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                          STUDENT NAME: {student.nameEn}
                        </p>
                        <p className="text-xs text-slate-600 font-medium pt-1">
                          ភេទ៖ <strong>{student.gender}</strong> &nbsp;•&nbsp; 
                          ថ្ងៃកំណើត៖ <strong>{student.dob || '................'}</strong> &nbsp;•&nbsp; 
                          ថ្នាក់៖ <strong className="text-slate-800 font-bold">{className}</strong>
                        </p>
                      </div>

                      {/* Statement text */}
                      <div className="max-w-xl mx-auto px-4 mt-1">
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          ដែលទទួលបានលទ្ធផលសិក្សាល្អប្រសើរ លេចធ្លោ មានវិន័យស្អាតស្អំ សីលធម៌សមរម្យ 
                          និងដណ្តើមបានលំដាប់ថ្នាក់ <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-xs shrink-0 border border-amber-200">ចំណាត់ថ្នាក់គឺ៖ លេខ {khmerRankChar}</span> 
                          ក្នុងខែ <strong>{selectedMonth}</strong> នៃឆ្នាំសិក្សា <strong>{academicYear}</strong> 
                          ដោយទទួលបានមធ្យមភាគពិន្ទុ <strong className="font-mono text-blue-800 text-sm font-bold">{currentHonoree.average}</strong> និងសញ្ញានិទ្ទេសលេចធ្លោ <strong className="text-emerald-700 font-bold uppercase">"{currentHonoree.gradeLetter}" ({currentHonoree.grade.split(' ')[0]})</strong>។
                        </p>
                      </div>

                      {/* Decorative elements */}
                      <div className="flex justify-center gap-1.5 text-brand-gold py-1">
                        <Stars className="h-5 w-5 animate-pulse" />
                        <Stars className="h-5 w-5 animate-pulse" />
                        <Stars className="h-5 w-5 animate-pulse" />
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-2 text-[11px] text-slate-600 pt-6 border-slate-200/40">
                        <div>
                          <p className="font-moul text-[9px] leading-relaxed">បានឃើញ និងឯកភាព</p>
                          <p className="text-slate-500 py-1 font-semibold">នាយកសាលាបឋមសិក្សា</p>
                          <div className="h-10"></div>
                          <p className="font-bold text-slate-700">................................................</p>
                        </div>
                        <div>
                          <p className="italic">{getKhmerLunarCalendarDate(selectedMonth, academicYear)}</p>
                          <p className="font-moul text-[9px] pt-1 leading-relaxed">គ្រូបន្ទុកថ្នាក់</p>
                          <div className="h-10"></div>
                          <p className="font-bold text-slate-800">{teacherName || '................................'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                មិនទាន់មានទិន្នន័យដើម្បីបោះពុម្ពប័ណ្ណសរសើរឡើយ។
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
