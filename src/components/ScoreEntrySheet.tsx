import React, { useState } from 'react';
import { Student, Subject, MonthScore } from '../types';
import { Pencil, Sparkles, BookOpen, ChevronRight, Settings, Plus, Trash2, CheckCircle2, FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface ScoreEntrySheetProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  onUpdateScores: (studentId: string, scores: Record<string, number>, comments?: string) => void;
  onAddCustomSubject: (name: string, maxScore: number) => void;
  onRemoveSubject: (subjectId: string) => void;
  onAutofillScores: () => void;
  onClearScores: () => void;
  isAdmin?: boolean;
  className?: string;
  teacherName?: string;
  academicYear?: string;
  selectedMonth?: string;
}

export default function ScoreEntrySheet({
  students,
  subjects,
  monthScores,
  onUpdateScores,
  onAddCustomSubject,
  onRemoveSubject,
  onAutofillScores,
  onClearScores,
  isAdmin = true,
  className = '',
  teacherName = '',
  academicYear = '',
  selectedMonth = '',
}: ScoreEntrySheetProps) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formScores, setFormScores] = useState<Record<string, string>>({});
  const [formComment, setFormComment] = useState('');
  
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjMax, setNewSubjMax] = useState(10);

  // Khmer official heading labels
  const [ministryLabel, setMinistryLabel] = useState(() => localStorage.getItem('label_ministry') || 'ក្រសួងអប់រំ យុវជន និងកីឡា');
  const [provincialLabel, setProvincialLabel] = useState(() => localStorage.getItem('label_provincial') || 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង');
  const [districtLabel, setDistrictLabel] = useState(() => localStorage.getItem('label_district') || 'ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកសង្កែ');
  const [schoolLabel, setSchoolLabel] = useState(() => localStorage.getItem('label_school') || 'សាលាបឋមសិក្សាវត្តចចង');
  const [isHeaderSettingsOpen, setIsHeaderSettingsOpen] = useState(false);

  const toKhmerDigits = (val: number | string) => {
    return String(val).replace(/[0-9]/g, (w) => '០១២៣៤៥៦៧៨៩'[+w]);
  };

  const handleMinistryChange = (val: string) => {
    setMinistryLabel(val);
    localStorage.setItem('label_ministry', val);
  };
  const handleProvincialChange = (val: string) => {
    setProvincialLabel(val);
    localStorage.setItem('label_provincial', val);
  };
  const handleDistrictChange = (val: string) => {
    setDistrictLabel(val);
    localStorage.setItem('label_district', val);
  };
  const handleSchoolChange = (val: string) => {
    setSchoolLabel(val);
    localStorage.setItem('label_school', val);
  };

  const exportToExcel = () => {
    const clsName = className || 'ថ្នាក់រៀន';
    const acYear = academicYear || '២០២៥-២០២៦';
    const month = selectedMonth || 'សន្លឹកពិន្ទុ';
    const teachName = teacherName || 'គ្រូបង្រៀន';

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>រង្វាយតម្លៃពិន្ទុ</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="utf-8">
        <style>
          body { font-family: 'Khmer OS Battambang', 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; text-align: center; }
          td { padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          .gender-female { color: #db2777; text-align: center; }
          .gender-male { color: #1d4ed8; text-align: center; }
          .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #1e3a8a; }
          .meta-info { margin-bottom: 15px; font-size: 13px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">តារាងស្រង់ពិន្ទុសិស្សប្រចាំខែ${month}</div>
        <div class="meta-info">
          <strong>ថ្នាក់សិក្សា៖</strong> ${clsName} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>ឆ្នាំសិក្សា៖</strong> ${acYear} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>គ្រូទទួលបន្ទុក៖</strong> ${teachName}
        </div>
        <table>
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>ឈ្មោះសិស្ស</th>
              <th>ភេទ</th>
              ${subjects.map(subj => `<th>${subj.name} (/${subj.maxScore})</th>`).join('')}
              <th>មតិយោបល់</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const studentScore = monthScores.find((e) => e.studentId === student.id);
              const scoresMap = studentScore?.scores || {};
              const comment = studentScore?.comments || '';
              return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td><b>${student.nameKh}</b></td>
                  <td class="${student.gender === 'ស្រី' ? 'gender-female' : 'gender-male'}">${student.gender}</td>
                  ${subjects.map(subj => {
                    const val = scoresMap[subj.id];
                    return `<td style="text-align: center; font-weight: bold;">${val !== undefined ? val : '-'}</td>`;
                  }).join('')}
                  <td>${comment}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `តារាងស្រង់ពិន្ទុសិស្ស_ខែ_${month.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const clsName = className || 'ថ្នាក់រៀន';
    const acYear = academicYear || '២០២៥-២០២៦';
    const month = selectedMonth || 'សន្លឹកពិន្ទុ';
    const teachName = teacherName || 'គ្រូបង្រៀន';

    const contentHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>តារាងស្រង់ពិន្ទុសិស្ស</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          body {
            font-family: 'Khmer OS Battambang', 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            font-size: 10pt;
            color: #333333;
          }
          .title {
            font-family: 'Khmer OS Muol Light', serif;
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin-top: 15px;
            margin-bottom: 10px;
            color: #1e3a8a;
          }
          .meta-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 11px;
            font-weight: bold;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-size: 9.5pt;
            font-weight: bold;
            padding: 6px 4px;
            border: 1px solid #94a3b8;
            text-align: center;
          }
          td {
            padding: 6px 4px;
            border: 1px solid #94a3b8;
            font-size: 9.5pt;
          }
          .footer-section {
            margin-top: 30px;
            width: 100%;
          }
          .font-moul {
            font-family: 'Khmer OS Muol Light', serif;
          }
        </style>
      </head>
      <body>
        <table style="width: 100%; border: none; margin-bottom: 15px;">
          <tr>
            <td style="width: 38%; border: none; text-align: left; vertical-align: top; padding: 0;">
              <span class="font-moul" style="font-size: 10pt; color: #1e293b;">${ministryLabel}</span><br>
              <span class="font-moul" style="font-size: 8.5pt; color: #334155;">${provincialLabel}</span><br>
              <span style="font-size: 9pt; font-weight: bold; color: #475569;">${districtLabel}</span><br>
              <span style="font-size: 9pt; font-weight: bold; color: #1e293b;">សាលា៖ <u>${schoolLabel}</u></span>
            </td>
            <td style="width: 34%; border: none; text-align: center; vertical-align: top; padding: 0;">
              <span class="font-moul" style="font-size: 11pt; color: #0f172a;">ព្រះរាជាណាចក្រកម្ពុជា</span><br>
              <span class="font-moul" style="font-size: 9pt; color: #1e293b; letter-spacing: 1px;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span><br>
              <div style="font-size: 8pt; color: #b45309; text-align: center; margin-top: 3px;">~ ~ ~ * ~ ~ ~</div>
            </td>
            <td style="width: 28%; border: none; text-align: right; vertical-align: top; padding: 0;"></td>
          </tr>
        </table>

        <div class="title">តារាងស្រង់ពិន្ទុសិស្សប្រចាំខែ${month}</div>
        <div class="meta-info">
          ថ្នាក់សិក្សា៖ ${clsName} &nbsp;&nbsp;|&nbsp;&nbsp; 
          ឆ្នាំសិក្សា៖ ${acYear} &nbsp;&nbsp;|&nbsp;&nbsp; 
          គ្រូទទួលបន្ទុក៖ ${teachName}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">ល.រ</th>
              <th>ឈ្មោះសិស្ស</th>
              <th style="width: 50px;">ភេទ</th>
              ${subjects.map(subj => `<th>${subj.name}<br><span style="font-size: 8pt; font-weight: normal; color: #475569;">/${subj.maxScore}</span></th>`).join('')}
              <th>កំណត់ហេតុ/មតិយោបល់</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const studentScore = monthScores.find((e) => e.studentId === student.id);
              const scoresMap = studentScore?.scores || {};
              const comment = studentScore?.comments || '';
              return `
                <tr>
                  <td style="text-align: center; font-family: Arial, sans-serif;">${idx + 1}</td>
                  <td><b>${student.nameKh}</b></td>
                  <td style="text-align: center; font-weight: bold;">${student.gender}</td>
                  ${subjects.map(subj => {
                    const score = scoresMap[subj.id];
                    const isLow = score !== undefined && score < 5;
                    return `<td style="text-align: center; font-family: Arial, sans-serif; font-weight: bold; ${isLow ? 'color: #ef4444;' : ''}">${score !== undefined ? score : '-'}</td>`;
                  }).join('')}
                  <td style="font-size: 8.5pt; font-style: italic; color: #4b5563;">${comment}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <table class="footer-section" style="border: none;">
          <tr>
            <td style="width: 50%; text-align: center; border: none; vertical-align: top; padding: 0;">
              <p style="font-weight: bold; color: #64748b; margin-bottom: 2px;">បានឃើញ និងឯកភាព</p>
              <p class="font-moul" style="font-size: 8.5pt; color: #1e293b; margin-top: 1px;">នាយក/នាយិកា</p>
              <div style="height: 50px;"></div>
              <p style="color: #94a3b8;">................................................</p>
            </td>
            <td style="width: 50%; text-align: center; border: none; vertical-align: top; padding: 0;">
              <p style="font-style: italic; font-weight: bold; font-size: 9.5pt; color: #78350f; margin-bottom: 2px;">
                ថ្ងៃសុក្រ ៧កើត ខែមិគសិរ ឆ្នាំជូត ឯកស័ក ២០២៦
              </p>
              <p style="font-size: 9.5pt; font-weight: bold; color: #1e293b; margin-top: 1px; margin-bottom: 3px;">
                ធ្វើនៅ ${schoolLabel || 'សាលា'}, ថ្ងៃទី ${toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ ${["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][new Date().getMonth()]} ឆ្នាំ ${toKhmerDigits(new Date().getFullYear())}
              </p>
              <p class="font-moul" style="font-size: 8.5pt; color: #1e293b; margin-top: 1px;">គ្រូបន្ទុកថ្នាក់</p>
              <div style="height: 50px;"></div>
              <p style="font-weight: bold; color: #0f172a; font-size: 11pt;">${teacherName || '................................'}</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([contentHtml], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `តារាងស្រង់ពិន្ទុសិស្ស_ខែ_${month}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Opens student score editor
  const startEditing = (student: Student) => {
    setEditingStudent(student);
    const existing = monthScores.find((e) => e.studentId === student.id);
    const initialScores: Record<string, string> = {};
    
    subjects.forEach((subj) => {
      const val = existing?.scores[subj.id];
      initialScores[subj.id] = val !== undefined ? String(val) : '';
    });
    
    setFormScores(initialScores);
    setFormComment(existing?.comments || '');
  };

  const handleScoreChange = (subjId: string, value: string) => {
    // Basic filter: only allow numbers & decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormScores((prev) => ({ ...prev, [subjId]: value }));
    }
  };

  const saveStudentScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const parsedScores: Record<string, number> = {};
    for (const subj of subjects) {
      const rawVal = formScores[subj.id];
      if (rawVal !== '') {
        const num = parseFloat(rawVal);
        if (isNaN(num)) {
          alert(`ពិន្ទុសម្រាប់មុខវិជ្ជា "${subj.name}" មិនត្រឹមត្រូវឡើយ!`);
          return;
        }
        if (num < 0 || num > subj.maxScore) {
          alert(`ពិន្ទុមុខវិជ្ជា "${subj.name}" ត្រូវចន្លោះពី 0 ទៅ ${subj.maxScore}!`);
          return;
        }
        parsedScores[subj.id] = num;
      } else {
        parsedScores[subj.id] = 0; // Default to 0 if empty
      }
    }

    onUpdateScores(editingStudent.id, parsedScores, formComment);
    setEditingStudent(null);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    onAddCustomSubject(newSubjName.trim(), newSubjMax);
    setNewSubjName('');
    setNewSubjMax(10);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-xl shadow-xs border border-slate-100 gap-4 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រងពិន្ទុរបស់សិស្ស</h3>
          <p className="text-xs text-slate-400 mt-1">
            សូមកំណត់ពិន្ទុរបស់សិស្សម្នាក់ៗ។ ពិន្ទុរៀបចំទម្រង់ស្រង់ប្រចាំខែដោយស្វ័យប្រវត្ត។
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Always visible action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              title="ទាញយកជាឯកសារ Excel"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>ទាញយក Excel</span>
            </button>

            <button
              onClick={exportToWord}
              className="flex items-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              title="ទាញយកជាឯកសារ Word"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              <span>ទាញយក Word</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              title="បោះពុម្ភតារាង ឬរក្សាទុកជា PDF"
            >
              <Printer className="h-4 w-4 text-indigo-600" />
              <span>បោះពុម្ភ/PDF</span>
            </button>

            <button
              onClick={() => setIsHeaderSettingsOpen(!isHeaderSettingsOpen)}
              className={`flex items-center gap-1.5 py-2 px-3 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isHeaderSettingsOpen 
                  ? 'bg-slate-100 border-slate-350 text-slate-800' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title="កំណត់ក្បាលទំព័ររបាយការណ៍បោះពុម្ភ"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>កំណត់ក្បាលទំព័រ</span>
            </button>
          </div>

          {/* Admin actions list */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
              <button
                onClick={() => setIsSubjectManagerOpen(true)}
                className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>គ្រប់គ្រងមុខវិជ្ជា ({subjects.length})</span>
              </button>
              <button
                onClick={onAutofillScores}
                className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>បន្ថែមពិន្ទុគំរូ</span>
              </button>
              <button
                onClick={onClearScores}
                className="flex items-center gap-1.5 py-2 px-3 bg-rose-50 border border-rose-100 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <Trash2 className="h-4 w-4 text-rose-700" />
                <span>សម្អាតពិន្ទុ</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header custom settings - Collapsible panel */}
      {isHeaderSettingsOpen && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in no-print font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">កំណត់ព័ត៌មានក្បាលទំព័ររបាយការណ៍ (បោះពុម្ភ Word/PDF)</h4>
            <button 
              onClick={() => setIsHeaderSettingsOpen(false)}
              className="text-slate-400 hover:text-slate-650 font-bold text-lg"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">ក្រសួងសាមី៖</label>
              <input
                type="text"
                value={ministryLabel}
                onChange={(e) => handleMinistryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">មន្ទីរអប់រំខេត្ត៖</label>
              <input
                type="text"
                value={provincialLabel}
                onChange={(e) => handleProvincialChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">ការិយាល័យអប់រំស្រុក៖</label>
              <input
                type="text"
                value={districtLabel}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">ឈ្មោះសាលារៀន៖</label>
              <input
                type="text"
                value={schoolLabel}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Spreadsheet representation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                <th className="py-3 px-4 font-bold sticky left-0 bg-slate-50 border-r border-slate-150 w-[45px] text-center z-10">ល.រ</th>
                <th className="py-3 px-4 font-bold sticky left-[45px] bg-slate-50 border-r border-slate-150 w-[160px] z-10">ឈ្មោះសិស្ស</th>
                <th className="py-3 px-3 font-semibold text-center w-[60px] border-r border-slate-150">ភេទ</th>
                
                {/* Subjects headers list */}
                {subjects.map((subj) => (
                  <th key={subj.id} className="py-3 px-2 font-semibold text-center text-[11px] min-w-[70px] border-r border-slate-150">
                    <span className="block truncate max-w-[90px] mx-auto text-slate-800 font-medium" title={subj.name}>
                      {subj.name}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-normal mt-0.5">/{subj.maxScore}</span>
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold text-blue-800 z-10">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 4} className="py-12 text-center text-slate-400">
                    សូមចុះឈ្មោះសិស្សនៅក្នុង "សៀវភៅសិក្ខាគារិក" ជាមុនសិន។
                  </td>
                </tr>
              ) : (
                students.map((student, index) => {
                  const studentScore = monthScores.find((e) => e.studentId === student.id);
                  const scoresMap = studentScore?.scores || {};
                  
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Left anchored ID */}
                      <td className="py-3 px-2 text-center text-slate-400 text-xs font-mono border-r border-slate-150 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                        {index + 1}
                      </td>
                      
                      {/* Left anchored Khmer Name */}
                      <td className="py-3 px-4 font-semibold text-slate-800 sticky left-[45px] bg-white group-hover:bg-slate-50 border-r border-slate-150 z-10">
                        <div className="truncate" title={student.nameEn}>
                          {student.nameKh}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-3 text-center border-r border-slate-150">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          student.gender === 'ប្រុស' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                        }`}>
                          {student.gender}
                        </span>
                      </td>

                      {/* Display cells for scores */}
                      {subjects.map((subj) => {
                        const scoreVal = scoresMap[subj.id];
                        const isEntered = scoreVal !== undefined;
                        return (
                          <td
                            key={subj.id}
                            onClick={() => startEditing(student)}
                            className="py-3 px-2 text-center border-r border-slate-100 cursor-pointer hover:bg-blue-50/50 hover:text-blue-700 font-mono text-xs transition-colors"
                          >
                            {isEntered ? (
                              <span className={`font-semibold ${scoreVal < 5 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                                {scoreVal}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Right Action Trigger */}
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={() => startEditing(student)}
                          className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>កែពិន្ទុ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Score Form slide-over / details modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-slate-150 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">ស្រង់ពិន្ទុសិស្ស</span>
                <h3 className="text-lg font-bold text-slate-800">{editingStudent.nameKh} ({editingStudent.gender})</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:bg-slate-150 p-1.5 rounded-full transition-all"
              >
                &times;
              </button>
            </div>

            <form onSubmit={saveStudentScores} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {subjects.map((subj) => (
                  <div key={subj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-slate-700 truncate" title={subj.name}>
                        {subj.name}
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-0.5">ពិន្ទុអតិបរមា: {subj.maxScore}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="0"
                      value={formScores[subj.id] || ''}
                      onChange={(e) => handleScoreChange(subj.id, e.target.value)}
                      className="w-16 px-2.5 py-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <label className="block text-xs font-semibold text-slate-500">កំណត់ហេតុ/មតិយោបល់គ្រូបង្រៀនលើសិស្សប្រចាំខែ</label>
                <textarea
                  rows={2}
                  placeholder="ឧ. ខិតខំរៀនសូត្រជាងមុន ឬ បញ្ចេញមតិបានល្អក្នុងថ្នាក់..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                />
              </div>

              {/* Sticky Action Footer inside modal */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3.5 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 pb-2 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>រក្សាទុកព័ត៌មាន</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Manager Modal */}
      {isSubjectManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">ស្វែងរក ឬគ្រប់គ្រងមុខវិជ្ជានៃការស្រង់</h3>
              <button
                onClick={() => setIsSubjectManagerOpen(false)}
                className="text-slate-400 hover:bg-slate-150 p-1 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Add Custom Subject Form */}
              <form onSubmit={handleAddSubjectSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">បន្ថែមមុខវិជ្ជាថ្មី</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="ឈ្មោះមុខវិជ្ជា (ឧ. គំនូរ)"
                    value={newSubjName}
                    onChange={(e) => setNewSubjName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newSubjMax}
                    onChange={(e) => setNewSubjMax(parseInt(e.target.value) || 10)}
                    className="w-16 px-2.5 py-1.5 text-center font-mono text-xs bg-white border border-slate-300 rounded-lg focus:outline-none text-slate-700"
                    title="ពិន្ទុអតិបរមា"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>បន្ថែម</span>
                  </button>
                </div>
              </form>

              {/* Existing Subject Listings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">បញ្ជីមុខវិជ្ជាបច្ចុប្បន្ន</h4>
                <div className="divide-y divide-slate-100 max-h-[40vh] overflow-y-auto border border-slate-150 rounded-xl bg-white">
                  {subjects.map((subj) => (
                    <div key={subj.id} className="p-3 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-50/50">
                      <div>
                        <span className="font-semibold text-slate-800">{subj.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">ពិន្ទុអតិបរមា៖ {subj.maxScore}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveSubject(subj.id)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        title="លុបមុខវិជ្ជា"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSubjectManagerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                បិទសម្រេច
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable template - HIDDEN ON SCREEN, SHOWN ON PRINT */}
      <div className="hidden print:block print-area">
        {/* Khmer Government Style Header */}
        <div className="grid grid-cols-3 items-start pb-4 border-b border-double border-slate-400 mb-6 font-sans">
          <div className="text-left space-y-1">
            <h3 className="font-moul text-[10px] text-slate-800 leading-normal">{ministryLabel}</h3>
            <h4 className="font-moul text-[8.5px] text-slate-700 leading-normal pl-1.5">{provincialLabel}</h4>
            <p className="text-[9px] font-bold text-slate-650 leading-relaxed pl-1.5">
              {districtLabel}
            </p>
            <p className="text-[9px] font-bold text-slate-700 pl-1.5">
              សាលា៖ <span className="underline decoration-dotted stroke-slate-400 underline-offset-4 font-bold text-[10px]">{schoolLabel}</span>
            </p>
          </div>
          
          <div className="text-center space-y-0.5 col-span-1">
            <h2 className="font-moul text-[11.5px] text-slate-900 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h2>
            <h3 className="font-moul text-[9.5px] text-slate-850 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
            <div className="flex justify-center py-0.5">
              <svg width="40" height="8" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 block">
                <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="text-right"></div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="font-moul text-base text-blue-900 leading-normal">តារាងស្រង់ពិន្ទុសិស្សប្រចាំខែ{selectedMonth || '...........'}</h2>
          <div className="flex justify-center items-center gap-6 text-xs text-slate-700 font-bold">
            <span>ថ្នាក់៖ <span className="text-slate-900 font-sans">{className || '...........'}</span></span>
            <span>ឆ្នាំសិក្សា៖ <span className="text-slate-900 font-sans">{academicYear || '...........'}</span></span>
          </div>
        </div>

        {/* Content Table */}
        <table className="w-full text-[11px] border-collapse border border-slate-350">
          <thead>
            <tr className="bg-slate-50 text-slate-850 font-bold">
              <th className="border border-slate-350 py-2 px-1 text-center w-[40px]">ល.រ</th>
              <th className="border border-slate-350 py-2 px-3 text-left">ឈ្មោះសិស្ស</th>
              <th className="border border-slate-350 py-2 px-1 text-center w-[50px]">ភេទ</th>
              {subjects.map((subj) => (
                <th key={subj.id} className="border border-slate-350 py-2 px-1 text-center min-w-[65px]">
                  <div>{subj.name}</div>
                  <div className="text-[9px] text-slate-500 font-normal">/{subj.maxScore}</div>
                </th>
              ))}
              <th className="border border-slate-350 py-2 px-2 text-left">កំណត់ហេតុ/មតិយោបល់</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={subjects.length + 4} className="border border-slate-350 py-6 text-center text-slate-400">
                  មិនមានព័ត៌មានសិស្សឡើយ
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const studentScore = monthScores.find((e) => e.studentId === student.id);
                const scoresMap = studentScore?.scores || {};
                const comment = studentScore?.comments || '';
                return (
                  <tr key={student.id} className="text-slate-800">
                    <td className="border border-slate-350 py-1.5 px-1 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-350 py-1.5 px-3 font-bold">{student.nameKh}</td>
                    <td className="border border-slate-350 py-1.5 px-1 text-center font-bold">{student.gender}</td>
                    {subjects.map((subj) => {
                      const score = scoresMap[subj.id];
                      return (
                        <td key={subj.id} className="border border-slate-350 py-1.5 px-1 text-center font-mono font-bold">
                          {score !== undefined ? (
                            <span className={score < 5 ? 'text-rose-600 font-bold' : ''}>{score}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-slate-350 py-1.5 px-2 text-[10px] italic text-slate-600">{comment || ''}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="mt-10 grid grid-cols-2 text-center text-xs text-slate-700 pt-4">
          <div>
            <p className="font-semibold text-slate-500">បានឃើញ និងឯកភាព</p>
            <p className="font-moul text-[8.5px] pt-1 leading-normal text-slate-800">នាយក/នាយិកា</p>
            <div className="h-16"></div>
            <p className="text-slate-400">................................................</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="italic font-bold text-[9.5px] text-amber-900 leading-normal">
              ថ្ងៃសុក្រ ៧កើត ខែមិគសិរ ឆ្នាំជូត ឯកស័ក {academicYear ? toKhmerDigits(academicYear) : '២០២៦'}
            </p>
            <p className="text-[9.5px] font-bold text-slate-850 leading-normal">
              ធ្វើនៅ {schoolLabel || 'សាលា'}, ថ្ងៃទី {toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ {["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][new Date().getMonth()]} ឆ្នាំ {toKhmerDigits(new Date().getFullYear())}
            </p>
            <p className="font-moul text-[8.5px] pt-1.5 leading-normal text-slate-800">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 text-sm border-b border-dashed border-slate-300 pb-0.5 min-w-[130px] font-mono tracking-wide">{teacherName || '................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
