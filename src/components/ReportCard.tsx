import React, { useState, useEffect } from 'react';
import { Student, Subject, MonthScore } from '../types';
import { computeMonthlyResults, calculateGrade } from '../utils/calculations';
import { 
  Printer, 
  BookOpen, 
  Star, 
  UserCheck, 
  Shield, 
  ClipboardList, 
  PenTool, 
  Camera, 
  Plus, 
  Minus, 
  X, 
  Save, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  UserPlus
} from 'lucide-react';

interface ReportCardProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
  onUpdateScores: (studentId: string, scores: Record<string, number>, comments?: string) => void;
  onUpdateStudent: (student: Student) => void;
}

// Pre-packaged gorgeous student school portraits to fall back on or choose from
const PRESET_MOCK_AVATARS = [
  { id: 'boy-1', name: 'សិស្សប្រុសទី ១', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=240' },
  { id: 'girl-1', name: 'សិស្សស្រីទី ១', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=240' },
  { id: 'boy-2', name: 'សិស្សប្រុសទី ២', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=240' },
  { id: 'girl-2', name: 'សិស្សស្រីទី ២', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=240' },
  { id: 'boy-3', name: 'សិស្សប្រុសទី ៣', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=240' },
  { id: 'girl-3', name: 'សិស្សស្រីទី ៣', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=240' }
];

// Conversions helpers
function toKhmerDigits(val: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(val).split('').map(char => {
    const idx = parseInt(char);
    return isNaN(idx) ? char : khmerDigits[idx];
  }).join('');
}

// Auto generate authentic lunar date
function getLunarCalendarDate(month: string, academicYearStr: string) {
  const yearNum = parseInt(academicYearStr.replace(/\D/g, '')) || 2026;
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
  const khBe = toKhmerDigits(beYear);

  // Dynamic moon day
  const moonDays = ["១កើត", "៣កើត", "៥កើត", "៨កើត", "១០កើត", "១២កើត", "១៥កើត", "២រោច", "៥រោច", "៨រោច", "១០រោច", "១៣រោច"];
  const dayIndex = (month.charCodeAt(0) + month.charCodeAt(month.length - 1)) % moonDays.length;
  const moonDay = moonDays[dayIndex];

  return `ថ្ងៃពុធ ${moonDay} ${lMonth} ឆ្នាំ${zodiac} ${era} ព.ស.${khBe}`;
}

export default function ReportCard({
  students,
  subjects,
  monthScores,
  className,
  teacherName,
  academicYear,
  selectedMonth,
  onUpdateScores,
  onUpdateStudent,
}: ReportCardProps) {
  // Sort students alphabetically A-Z by nameEn stably
  const sortedStudents = [...students].sort((a, b) => a.nameEn.localeCompare(b.nameEn, 'en', { sensitivity: 'base' }));

  const results = computeMonthlyResults(sortedStudents, subjects, monthScores);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    sortedStudents.length > 0 ? sortedStudents[0].id : ''
  );

  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintMode('single');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const [commentInput, setCommentInput] = useState('');
  const [showPresetPanel, setShowPresetPanel] = useState(false);
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);

  // Administrative customizable inputs according to MoEYS standards
  const [ministryLabel, setMinistryLabel] = useState('ក្រសួងអប់រំ យុវជន និងកីឡា');
  const [provincialLabel, setProvincialLabel] = useState('មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង');
  const [districtLabel, setDistrictLabel] = useState('ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកសង្កែ');
  const [schoolLabel, setSchoolLabel] = useState('សាលាបឋមសិក្សាវត្តចចង');

  // Find active student data
  const activeStudentResult = results.find((res) => res.student.id === selectedStudentId);
  const activeStudent = activeStudentResult?.student;

  const activeScoreEntry = monthScores.find((e) => e.studentId === selectedStudentId);
  const activeScoresMap = activeScoreEntry?.scores || {};

  // Track local changes to active scores for quick direct editing in sidebar
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  
  // Absence states (stored in student's monthly scores map with custom keys '__absence_permit', '__absence_no_permit')
  const absWithPermit = activeScoresMap['__absence_permit'] !== undefined ? activeScoresMap['__absence_permit'] : 0;
  const absNoPermit = activeScoresMap['__absence_no_permit'] !== undefined ? activeScoresMap['__absence_no_permit'] : 0;

  // Pre-written Khmer teacher remarks for quick selection
  const REMARK_PRESETS = [
    "សិស្សមានការខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំ។",
    "សិស្សឆ្លាតវៃ យកចិត្តទុកដាក់ក្នុងថ្នាក់ និងឧស្សាហ៍ព្យាយាមធ្វើកិច្ចការផ្ទះ។",
    "សិស្សរៀនពូកែ និងមានសីលធម៌អត្តចរិតល្អប្រសើររៀបរយណាស់។",
    "ចូលចិត្តជជែកគ្នាលេងក្នុងថ្នាក់រៀនបន្តិចបន្តួច ប៉ុន្តែយកចិត្តទុកដាក់គួរសមពេលគ្រូពន្យល់។",
    "ណែនាំឲ្យសិស្សប្រឹងប្រែងបន្ថែមលើការអាន និងសរសេរអក្សរខ្មែរឲ្យបានស្អាត។",
    "សិស្សមានការរីកចម្រើនជាលំដាប់លើគ្រប់មុខវិជ្ជា និងមានវិន័យល្អ។"
  ];

  // Sync state if student changes
  useEffect(() => {
    if (sortedStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(sortedStudents[0].id);
    }
  }, [sortedStudents, selectedStudentId]);

  useEffect(() => {
    if (activeScoreEntry) {
      setCommentInput(activeScoreEntry.comments || 'សិស្សមានការខិតខំរៀនសូត្រ វិន័យល្អ និងសីលធម៌រៀបរយ។');
    } else {
      setCommentInput('សិស្សមានការខិតខំរៀនសូត្រ វិន័យល្អ និងសីលធម៌រៀបរយ។');
    }
    
    // Sync local scores editing values
    const initialLocal: Record<string, number> = {};
    subjects.forEach(subj => {
      initialLocal[subj.id] = activeScoresMap[subj.id] !== undefined ? activeScoresMap[subj.id] : 0;
    });
    setLocalScores(initialLocal);
  }, [selectedStudentId, activeScoreEntry, subjects]);

  const handleUpdateLocalScore = (subjectId: string, valStr: string) => {
    // Validate score ranges
    const maxVal = subjects.find(s => s.id === subjectId)?.maxScore || 10;
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > maxVal) val = maxVal;

    const updated = {
      ...localScores,
      [subjectId]: val
    };
    setLocalScores(updated);

    // Save automatically
    const scoresToPersist = {
      ...activeScoresMap,
      ...updated
    };
    onUpdateScores(selectedStudentId, scoresToPersist, commentInput);
  };

  const handleAbsenceChange = (type: 'permit' | 'no-permit', delta: number) => {
    const key = type === 'permit' ? '__absence_permit' : '__absence_no_permit';
    const currentVal = activeScoresMap[key] !== undefined ? activeScoresMap[key] : 0;
    let newVal = currentVal + delta;
    if (newVal < 0) newVal = 0;

    const scoresToPersist = {
      ...activeScoresMap,
      [key]: newVal
    };
    onUpdateScores(selectedStudentId, scoresToPersist, commentInput);
  };

  const handleSaveComment = (text: string) => {
    setCommentInput(text);
    onUpdateScores(selectedStudentId, activeScoresMap, text);
  };

  // Base64 student passport photo uploading
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size limit: keep base64 memory reasonable
    if (file.size > 2 * 1024 * 1024) {
      alert("ទំហំរូបភាពធំពេក! សូមជ្រើសរើសរូបភាពក្រោម ២MB។");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      if (activeStudent) {
        onUpdateStudent({
          ...activeStudent,
          avatar: dataUri
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetPresetAvatar = (url: string) => {
    if (activeStudent) {
      onUpdateStudent({
        ...activeStudent,
        avatar: url
      });
    }
    setShowAvatarChooser(false);
  };

  const handleRemovePhoto = () => {
    if (activeStudent) {
      onUpdateStudent({
        ...activeStudent,
        avatar: ''
      });
    }
  };

  const printReportCard = () => {
    setPrintMode('single');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const printAllReportCards = () => {
    setPrintMode('all');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const exportActiveStudentToExcel = () => {
    if (!activeStudentResult) return;
    const { student, total, average, rank } = activeStudentResult;

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>សៀវភៅតាមដាន_${student.nameKh}</x:Name>
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
          .header { text-align: center; font-size: 12px; margin-bottom: 20px; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1e3a8a; }
          .info-table { border: none; margin-bottom: 15px; font-size: 12px; }
          table.score-table { border-collapse: collapse; width: 100%; font-size: 11px; }
          table.score-table th { background-color: #f1f5f9; font-weight: bold; padding: 6px; border: 1px solid #475569; }
          table.score-table td { padding: 6px; border: 1px solid #475569; text-align: center; }
          table.score-table td.subject-name { text-align: left; font-weight: bold; }
          .highlight { background-color: #eff6ff; font-weight: bold; }
          .summary-box { border: 1px solid #475569; margin-top: 15px; padding: 8px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <b>${ministryLabel}</b><br>
          ${provincialLabel}<br>
          ${districtLabel}<br>
          សាលា៖ ${schoolLabel}
        </div>
        
        <div class="title">សៀវភៅតាមដានការសិក្សា និងស្រង់ពិន្ទុប្រចាំខែ${selectedMonth}</div>
        <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
          <b>ថ្នាក់៖</b> ${className} | <b>ឆ្នាំសិក្សា៖</b> ${academicYear}
        </div>

        <table class="info-table">
          <tr>
            <td><b>ឈ្មោះសិស្ស៖</b> ${student.nameKh}</td>
            <td><b>ឡាតាំង៖</b> ${student.nameEn}</td>
            <td><b>ភេទ៖</b> ${student.gender}</td>
            <td><b>ថ្ងៃខែឆ្នាំកំណើត៖</b> ${student.dob || ''}</td>
          </tr>
        </table>

        <table class="score-table">
          <thead>
            <tr>
              <th>ល.រ</th>
              <th style="text-align: left;">មុខវិជ្ជាសម្រាប់ការស្រង់ពិន្ទុ</th>
              <th>ពិន្ទុទទួលបាន</th>
              <th>និទ្ទេស</th>
              <th>ពិន្ទុអតិបរមា</th>
              <th>អវត្តមានមានច្បាប់</th>
              <th>អវត្តមានអត់ច្បាប់</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map((subj, idx) => {
              const scoreVal = activeScoresMap[subj.id];
              const val = typeof scoreVal === 'number' ? scoreVal : 0;
              const gradeLetter = val >= 9 ? 'A' : val >= 8 ? 'B' : val >= 7 ? 'C' : val >= 6 ? 'D' : val >= 5 ? 'E' : 'F';
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="subject-name">${subj.name}</td>
                  <td style="font-weight: bold; ${val < 5 ? 'color: red;' : ''}">${scoreVal !== undefined ? scoreVal : '-'}</td>
                  <td style="font-weight: bold;">${scoreVal !== undefined ? gradeLetter : '-'}</td>
                  <td>${subj.maxScore}</td>
                  <td>${idx === 0 && absWithPermit > 0 ? absWithPermit : '០'}</td>
                  <td>${idx === 0 && absNoPermit > 0 ? absNoPermit : '០'}</td>
                </tr>
              `;
            }).join('')}
            <tr class="highlight">
              <td colspan="2" style="text-align: left;">សរុបពិន្ទុនៃការប្រឡង</td>
              <td>${total}</td>
              <td colspan="4"></td>
            </tr>
            <tr class="highlight">
              <td colspan="2" style="text-align: left;">មធ្យមភាគសិក្សាជាមធ្យម</td>
              <td>${average}</td>
              <td colspan="4"></td>
            </tr>
            <tr class="highlight" style="color: red;">
              <td colspan="2" style="text-align: left;">ចំណាត់ថ្នាក់ក្នុងថ្នាក់ (Rank)</td>
              <td>${toKhmerDigits(rank)}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <div class="summary-box">
          <b>មតិវាយតម្លៃរបស់គ្រូ៖</b> ${commentInput || 'ខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំខ្លាំង។'}<br><br>
          <b>គ្រូបន្ទុកថ្នាក់៖</b> ${teacherName}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `សៀវភៅតាមដាន_${student.nameKh}_ខែ_${selectedMonth}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportActiveStudentToWord = () => {
    if (!activeStudentResult) return;
    const { student, total, average, rank } = activeStudentResult;

    const contentHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>សៀវភៅតាមដានការសិក្សា - ${student.nameKh}</title>
        <style>
          @page {
            size: A4;
            margin: 0.8in;
          }
          body {
            font-family: 'Khmer OS Battambang', 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            font-size: 11pt;
            color: #333333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .ministry {
            font-family: 'Khmer OS Muol Light', serif;
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 2px;
            text-align: left;
            width: 50%;
            float: left;
          }
          .country {
            font-family: 'Khmer OS Muol Light', serif;
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 2px;
            text-align: right;
            width: 50%;
            float: right;
          }
          .school {
            font-size: 10pt;
            margin-top: 5px;
            text-align: left;
            width: 50%;
            float: left;
          }
          .motto {
            font-size: 10pt;
            margin-top: 5px;
            text-align: right;
            width: 50%;
            float: right;
          }
          .title {
            font-family: 'Khmer OS Muol Light', serif;
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #1e3a8a;
          }
          .info-block {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .info-block td {
            border: none;
            padding: 4px;
            font-size: 10.5pt;
          }
          table.score-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          table.score-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            padding: 6px;
            border: 1px solid #475569;
            font-size: 9.5pt;
            text-align: center;
          }
          table.score-table td {
            padding: 6.5px;
            border: 1px solid #475569;
            font-size: 9.5pt;
            text-align: center;
          }
          table.score-table td.subject-name {
            text-align: left;
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          .highlight {
            font-weight: bold;
            background-color: #f8fafc;
          }
          .comment-section {
            margin-top: 15px;
            border: 1px solid #cbd5e1;
            padding: 10px;
            border-radius: 6px;
            background-color: #fafafa;
          }
          .signature-section {
            margin-top: 30px;
            width: 100%;
          }
          .sig-box {
            float: right;
            text-align: center;
            width: 250px;
          }
        </style>
      </head>
      <body>
        <table style="width: 100%; border: none; margin-bottom: 20px;">
          <tr>
            <td style="width: 38%; border: none; text-align: left; vertical-align: top; padding: 0;">
              <span style="font-family: 'Khmer OS Muol Light'; font-size: 9.5pt; color: #1e293b; font-weight: bold;">${ministryLabel}</span><br>
              <span style="font-family: 'Khmer OS Muol Light'; font-size: 8.5pt; color: #334155; font-weight: bold;">${provincialLabel}</span><br>
              <span style="font-size: 9pt; font-weight: bold; color: #475569;">${districtLabel}</span><br>
              <span style="font-size: 9pt; font-weight: bold; color: #1e293b;">សាលា៖ <u>${schoolLabel}</u></span>
            </td>
            <td style="width: 34%; border: none; text-align: center; vertical-align: top; padding: 0;">
              <span style="font-family: 'Khmer OS Muol Light'; font-size: 11pt; color: #0f172a; font-weight: bold;">ព្រះរាជាណាចក្រកម្ពុជា</span><br>
              <span style="font-family: 'Khmer OS Muol Light'; font-size: 9.5pt; color: #1e293b; font-weight: bold; letter-spacing: 1px;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span><br>
              <div style="font-size: 8pt; color: #b45309; text-align: center; margin-top: 3px;">~ ~ ~ * ~ ~ ~</div>
            </td>
            <td style="width: 28%; border: none; text-align: right; vertical-align: top; padding: 0;"></td>
          </tr>
        </table>
        
        <div style="clear: both; height: 15px;"></div>

        <div class="title">សៀវភៅតាមដានការសិក្សា និងស្រង់ពិន្ទុ</div>
        <div style="text-align: center; font-size: 11pt; font-weight: bold; margin-bottom: 20px;">
          ការប្រឡងប្រចាំខែ៖ <span style="color: #1e3a8a;">${selectedMonth}</span> &nbsp;&nbsp;&nbsp;&nbsp; ថ្នាក់៖ ${className} &nbsp;&nbsp;&nbsp;&nbsp; ឆ្នាំសិក្សា៖ ${academicYear}
        </div>

        <table class="info-block">
          <tr>
            <td><b>គោត្តនាម-នាមសិស្ស៖</b> <span style="font-size: 11pt; color: #1e3a8a;">${student.nameKh}</span></td>
            <td><b>ឡាតាំង៖</b> <span style="text-transform: uppercase;">${student.nameEn}</span></td>
            <td><b>ភេទ៖</b> ${student.gender}</td>
            <td><b>ថ្ងៃខែឆ្នាំកំណើត៖</b> ${student.dob || ''}</td>
          </tr>
        </table>

        <table class="score-table">
          <thead>
            <tr>
              <th style="width: 8%;">ល.រ</th>
              <th style="text-align: left; width: 35%;">មុខវិជ្ជាសម្រាប់ការស្រង់ពិន្ទុ</th>
              <th style="width: 13%;">ពិន្ទុ</th>
              <th style="width: 11%;">និទ្ទេស</th>
              <th style="width: 13%;">ពិន្ទុអតិបរមា</th>
              <th style="width: 10%;">ច្បាប់</th>
              <th style="width: 10%;">អត់ច្បាប់</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map((subj, idx) => {
              const scoreVal = activeScoresMap[subj.id];
              const val = typeof scoreVal === 'number' ? scoreVal : 0;
              const gradeLetter = val >= 9 ? 'A' : val >= 8 ? 'B' : val >= 7 ? 'C' : val >= 6 ? 'D' : val >= 5 ? 'E' : 'F';
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="subject-name">${subj.name}</td>
                  <td style="font-weight: bold; ${val < 5 ? 'color: red;' : ''}">${scoreVal !== undefined ? scoreVal : '-'}</td>
                  <td style="font-weight: bold;">${scoreVal !== undefined ? gradeLetter : '-'}</td>
                  <td>${subj.maxScore}</td>
                  <td>${idx === 0 && absWithPermit > 0 ? absWithPermit : '០'}</td>
                  <td>${idx === 0 && absNoPermit > 0 ? absNoPermit : '០'}</td>
                </tr>
              `;
            }).join('')}
            <tr class="highlight">
              <td colspan="2" style="text-align: left;"><b>សរុបពិន្ទុរួម</b></td>
              <td><b>${total}</b></td>
              <td colspan="4"></td>
            </tr>
            <tr class="highlight">
              <td colspan="2" style="text-align: left;"><b>មធ្យមភាគប្រឡង</b></td>
              <td style="color: #1e3a8a;"><b>${average}</b></td>
              <td colspan="4"></td>
            </tr>
            <tr class="highlight">
              <td colspan="2" style="text-align: left;"><b>ចំណាត់ថ្នាក់ក្នុងថ្នាក់ (Rank)</b></td>
              <td style="color: red;"><b>${toKhmerDigits(rank)}</b></td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <div class="comment-section">
          <b>មតិវាយតម្លៃរបស់គ្រូប្រចាំខែ៖</b><br>
          <span style="font-style: italic; color: #1e3a8a;">"${commentInput || 'ខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំខ្លាំង។'}"</span>
        </div>

        <div class="signature-section">
          <table style="width: 100%; border: none;">
            <tr style="border: none;">
              <td style="border: none; width: 50%; text-align: left;">
                <p>បានឃើញ និងឯកភាព</p>
                <p style="font-family: 'Khmer OS Muol Light'; font-size: 9.5pt; margin-top: 5px; font-weight: bold;">នាយក/នាយិកា</p>
                <div style="height: 60px;"></div>
                <p>................................................</p>
              </td>
              <td style="border: none; width: 50%; text-align: center;">
                <p>${getLunarCalendarDate(selectedMonth, academicYear)}</p>
                <p>ធ្វើនៅ ${schoolLabel}, ថ្ងៃទី ${toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ ${selectedMonth} ឆ្នាំ ${toKhmerDigits(new Date().getFullYear())}</p>
                <p style="font-family: 'Khmer OS Muol Light'; font-size: 9.5pt; margin-top: 5px; font-weight: bold;">គ្រូបន្ទុកថ្នាក់</p>
                <div style="height: 50px;"></div>
                <p><b>${teacherName || '................................'}</b></p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([contentHtml], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `សៀវភៅតាមដាន_${student.nameKh}_ខែ_${selectedMonth}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGirlsInClass = students.filter(s => s.gender === 'ស្រី').length;

  return (
    <div className="space-y-6">
      {/* Top Config bar (No-print) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-2xl shadow-xs border border-slate-200 gap-4 no-print border-slate-150">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <span>ផ្ទាំងគ្រប់គ្រងសៀវភៅតាមដានការសិក្សាប្រចាំខែ</span>
          </h3>
          <p className="text-xs text-slate-400">
            កែសម្រួលពិន្ទុ អវត្តមាន និងរូបថតរបស់សិស្សម្នាក់ៗ រួចបោះពុម្ពសន្លឹកសៀវភៅតាមដានប្រចាំខែផ្លូវការ។
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">ជ្រើសរើសសិស្ស៖</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[180px]"
            >
              {sortedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameKh} ({s.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={printReportCard}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>បោះពុម្ពសៀវភៅតាមដាន (Print A4)</span>
          </button>

          <button
            onClick={printAllReportCards}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
            title="បោះពុម្ពសៀវភៅតាមដានរបស់សិស្សទាំងអស់ក្នុងថ្នាក់រៀបតាមលំដាប់អក្ខរក្រម"
          >
            <Printer className="h-4 w-4" />
            <span>បោះពុម្ពទាំងអស់ (Print All)</span>
          </button>

          <button
            onClick={exportActiveStudentToExcel}
            disabled={!activeStudentResult}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            title="ទាញយកសន្លឹកតាមដានការសិក្សារបស់សិស្សម្នាក់នេះជាឯកសារ Excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>នាំចេញជា Excel</span>
          </button>

          <button
            onClick={exportActiveStudentToWord}
            disabled={!activeStudentResult}
            className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            title="ទាញយកសន្លឹកតាមដានការសិក្សារបស់សិស្សម្នាក់នេះជាឯកសារ Word"
          >
            <FileText className="h-4 w-4" />
            <span>នាំចេញជា Word</span>
          </button>
        </div>
      </div>

      {/* Customizable school metadata header inputs (no-print) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-slate-150">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ក្រសួងសាមី</label>
          <input
            type="text"
            value={ministryLabel}
            onChange={(e) => setMinistryLabel(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">មន្ទីរអប់រំខេត្ត/រាជធានី</label>
          <input
            type="text"
            value={provincialLabel}
            onChange={(e) => setProvincialLabel(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ការិយាល័យអប់រំស្រុក/ខណ្ឌ</label>
          <input
            type="text"
            value={districtLabel}
            onChange={(e) => setDistrictLabel(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">ឈ្មោះសាលារៀន</label>
          <input
            type="text"
            value={schoolLabel}
            onChange={(e) => setSchoolLabel(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 text-slate-400 font-semibold">
          មិនទាន់មានសិស្សចុះឈ្មោះក្នុងប្រព័ន្ធឡើយ។ សូមចុះឈ្មោះសិស្សឡើងវិញ។
        </div>
      ) : activeStudentResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ==================== LEFT COLUMN SIDEBAR: INPUT CONTROLS (NO-PRINT) ==================== */}
          <div className="lg:col-span-1 space-y-5 no-print">
            
            {/* Student Passport Photo Upload/Select box */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2.5">
                រូបថតផ្លូវការរបស់សិស្ស (Student Photo)
              </span>

              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  {activeStudent?.avatar ? (
                    <img
                      src={activeStudent.avatar}
                      alt="Student"
                      className="h-20 w-16 object-cover rounded-md border border-slate-200 shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-20 w-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-400">
                      <Camera className="h-5 w-5" />
                      <span className="text-[8px] font-bold mt-1">គ្មានរូបថត</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {/* Browse file */}
                    <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors block">
                      <span>បញ្ចូលរូបថត</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Predefined mock faces selection */}
                    <button
                      onClick={() => setShowAvatarChooser(!showAvatarChooser)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      ជ្រើសរើសគំរូ
                    </button>

                    {/* Delete Current Photo */}
                    {activeStudent?.avatar && (
                      <button
                        onClick={handleRemovePhoto}
                        className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold cursor-pointer"
                        title="លុបរូបថតចេញ"
                      >
                        លុប
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    បញ្ចូលរូបភាពទម្រង់ ៤x៦ (passport size) សម្រាប់បង្ហាញនៅជ្រុងស្តាំលើនៃសៀវភៅតាមដាន។
                  </p>
                </div>
              </div>

              {/* Collapsible avatar chooser */}
              {showAvatarChooser && (
                <div className="mt-3.5 p-3 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 block">ជ្រើសរើសរូបភាពគំរូសិស្សល្បឿនលឿន៖</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_MOCK_AVATARS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSetPresetAvatar(preset.url)}
                        className="border border-slate-200 hover:border-blue-500 rounded-md overflow-hidden aspect-[4/5]"
                        title={preset.name}
                      >
                        <img src={preset.url} alt="preset" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance (Absences) controller card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Shield className="h-4 w-4 text-amber-550" />
                <span>គ្រប់គ្រងវត្តមានប្រចាំខែ (Absences)</span>
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Permitted Absence */}
                <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-xl border border-slate-150 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">មានច្បាប់</span>
                  <div className="flex items-center justify-between mt-2 max-w-[120px] mx-auto">
                    <button
                      onClick={() => handleAbsenceChange('permit', -1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-bold font-mono text-slate-800">{absWithPermit}</span>
                    <button
                      onClick={() => handleAbsenceChange('permit', 1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Non-Permitted Absence */}
                <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-xl border border-slate-150 text-center">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">អត់ច្បាប់</span>
                  <div className="flex items-center justify-between mt-2 max-w-[120px] mx-auto">
                    <button
                      onClick={() => handleAbsenceChange('no-permit', -1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-bold font-mono text-slate-800">{absNoPermit}</span>
                    <button
                      onClick={() => handleAbsenceChange('no-permit', 1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Score update widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <ClipboardList className="h-4 w-4 text-blue-650" />
                <span>កែសម្រួលពិន្ទុវិទ្យាសាស្ត្រ និងសាខាមុខវិជ្ជា</span>
              </h4>
              <p className="text-[9px] text-slate-400 leading-normal">
                កែប្រែពិន្ទុរបស់ <strong className="text-slate-700 font-bold">{activeStudent?.nameKh}</strong> នៅក្នុងប្រអប់ចំហៀងបានភ្លាមៗដោយពុំបាច់ប្តូរផ្ទាំង៖
              </p>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {subjects.map((subj) => {
                  const scoreVal = localScores[subj.id] !== undefined ? localScores[subj.id] : 0;
                  return (
                    <div key={subj.id} className="flex justify-between items-center text-xs gap-2 py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-600 truncate max-w-[130px]" title={subj.name}>
                        {subj.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={subj.maxScore}
                          value={scoreVal === 0 ? '' : scoreVal}
                          placeholder="0"
                          onChange={(e) => handleUpdateLocalScore(subj.id, e.target.value)}
                          className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">/{subj.maxScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Remarks / Comment Controller */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h5 className="font-bold text-slate-850 text-xs flex items-center gap-1.5">
                  <PenTool className="h-4 w-4 text-violet-700 shrink-0" />
                  <span>មតិវាយតម្លៃរបស់គ្រូប្រចាំខែ</span>
                </h5>
                <button
                  type="button"
                  onClick={() => setShowPresetPanel(!showPresetPanel)}
                  className="text-[9px] px-2 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-md font-bold cursor-pointer"
                >
                  {showPresetPanel ? 'បិទគំរូមតិ' : 'ជ្រើសរើសគំរូមតិ'}
                </button>
              </div>

              {showPresetPanel && (
                <div className="p-2 border border-slate-100 bg-slate-50 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 block mb-1">ចុចជ្រើសរើសឃ្លាណាមួយដើម្បីបំពេញ៖</span>
                  {REMARK_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSaveComment(preset)}
                      className="w-full text-left p-1.5 text-[10px] leading-relaxed select-none hover:bg-white border hover:border-violet-300 rounded text-slate-700 font-medium transition-all"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                rows={3}
                placeholder="សរសេរការសង្កេត និងមតិដំបូន្មានរបស់លោកគ្រូ/អ្នកគ្រូ..."
                value={commentInput}
                onChange={(e) => handleSaveComment(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 leading-relaxed font-semibold"
              />
              <button
                onClick={() => handleSaveComment(commentInput)}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>រក្សាទុកមតិវាយតម្លៃ</span>
              </button>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN: printable standard A4 workbook page ==================== */}
          <div className="lg:col-span-2">
            <div className={`bg-white border-2 border-slate-350 p-6 md:p-8 shadow-md rounded-2xl print-area font-sans relative ${printMode === 'all' ? 'no-print' : ''}`}>
              
              {/* Report Header Logo & Title (Ministry Standard Double Box) */}
              <div className="grid grid-cols-3 items-start pb-2 border-b border-double border-slate-400 mb-4">
                <div className="text-left space-y-1">
                  <h3 className="font-moul text-[10px] text-slate-800 leading-normal">{ministryLabel}</h3>
                  <h4 className="font-moul text-[8.5px] text-slate-700 leading-normal pl-1.5">{provincialLabel}</h4>
                  <p className="text-[9.5px] font-semibold text-slate-700 pl-3 leading-normal">
                    {districtLabel}
                  </p>
                  <p className="text-[10.5px] font-bold text-slate-900 pl-4 leading-normal">
                    សាលា៖ <span className="underline decoration-dotted stroke-slate-400 underline-offset-4 font-bold text-[11px]">{schoolLabel}</span>
                  </p>
                </div>
                
                <div className="text-center space-y-0.5 col-span-1">
                  <h2 className="font-moul text-[11.5px] text-slate-900 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h2>
                  <h3 className="font-moul text-[9.5px] text-slate-850 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
                  <div className="flex justify-center py-0.5">
                    {/* Decorative signature ornament */}
                    <svg width="40" height="8" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 block">
                      <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="text-right"></div>
              </div>

              {/* Title Section (ប្រឡងប្រចាំខែ...) with student photo in top right */}
              <div className="flex justify-between items-start pt-1.5 pb-4 border-b border-dashed border-slate-200">
                <div className="flex-1 text-center pl-16">
                  <h2 className="font-moul text-base md:text-lg text-blue-900 tracking-wide uppercase">ប្រឡងប្រចាំខែ{selectedMonth}</h2>
                  <div className="mt-1 flex items-center justify-center gap-6 text-[10.5px] text-slate-600 font-bold">
                    <span>ថ្នាក់៖ <strong className="text-slate-900 font-mono text-xs underline decoration-dotted decoration-slate-400">{className}</strong></span>
                    <span>ឆ្នាំសិក្សា៖ <strong className="text-slate-900 font-mono text-xs underline decoration-dotted decoration-slate-400">{academicYear}</strong></span>
                  </div>
                </div>

                {/* Passport Portrait photo block */}
                <div className="shrink-0 w-[80px] h-[100px] border border-slate-400 flex flex-col items-center justify-center bg-slate-50 rounded select-none relative group overflow-hidden">
                  {activeStudent?.avatar ? (
                    <img
                      src={activeStudent.avatar}
                      alt="Student Portrait"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-1 space-y-1 text-center flex flex-col items-center">
                      <Camera className="h-4 w-4 text-slate-350" />
                      <span className="text-[7.5px] font-bold text-slate-400 leading-normal block">រូបថត ៤x៦</span>
                      <span className="text-[6.5px] text-slate-350 block">គ្មានរូប</span>
                    </div>
                  )}

                  {/* Tiny edit button in corner */}
                  <label className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[7.5px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer no-print">
                    <span>ប្តូររូបថត</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Identity line details section */}
              <div className="mt-4 grid grid-cols-12 gap-y-1.5 items-center text-[11px] text-slate-800 leading-normal pb-3.5 pt-0.5">
                <div className="col-span-6 flex gap-1">
                  <span className="font-moul text-[9px] text-slate-600">គោត្តនាម-នាមសិស្ស៖</span>
                  <span className="font-bold text-slate-900 border-b border-dashed border-slate-350 pl-1 expand-underline uppercase">
                    {activeStudent?.nameKh}
                  </span>
                </div>
                
                <div className="col-span-4 flex gap-1">
                  <span className="font-moul text-[9px] text-slate-600">ឡាតាំង En៖</span>
                  <span className="font-mono font-bold text-slate-700 border-b border-dashed border-slate-350 pl-1 expand-underline uppercase">
                    {activeStudent?.nameEn}
                  </span>
                </div>

                <div className="col-span-2 flex gap-1">
                  <span className="font-moul text-[9px] text-slate-600">ភេទ៖</span>
                  <span className="font-bold text-slate-900 border-b border-dashed border-slate-330 pl-1 expand-underline">
                    {activeStudent?.gender === 'ស្រី' ? 'ស' : 'ប'}
                  </span>
                </div>
              </div>

              {/* Major 12 subjects Tabular block */}
              <div className="grid grid-cols-12 gap-0 relative border-l border-t border-b border-slate-400">
                {/* Score columns list */}
                <div className="col-span-9">
                  <table className="w-full text-center border-collapse text-[10.5px] text-slate-800 table-fixed">
                    <thead>
                      <tr className="bg-slate-50 font-semibold h-[28px] border-b border-r border-slate-400 text-[10px]">
                        <th className="border-r border-slate-400 w-[40px]">ល.រ</th>
                        <th className="border-r border-slate-400 text-left pl-2.5">មុខវិជ្ជា</th>
                        <th className="border-r border-slate-400 w-[120px]" colSpan={2}>លទ្ធផលសិក្សា</th>
                        <th className="w-[120px]" colSpan={2}>អវត្តមាន</th>
                      </tr>
                      {/* Secondary subheader row */}
                      <tr className="bg-slate-50/50 font-semibold h-[24px] border-b border-r border-slate-400 text-[9px] text-slate-500 uppercase tracking-wide">
                        <th className="border-r border-slate-400"></th>
                        <th className="border-r border-slate-400"></th>
                        <th className="border-r border-slate-400 w-[60px] text-slate-800 font-bold">ពិន្ទុ</th>
                        <th className="border-r border-slate-400 w-[60px]">និទ្ទេស</th>
                        <th className="border-r border-slate-400 w-[60px]">មានច្បាប់</th>
                        <th className="w-[60px]">អត់ច្បាប់</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {subjects.map((subj, idx) => {
                        const scoreVal = activeScoresMap[subj.id];
                        const val = typeof scoreVal === 'number' ? scoreVal : 0;
                        const gradeLetter = val >= 9 ? 'A' : val >= 8 ? 'B' : val >= 7 ? 'C' : val >= 6 ? 'D' : val >= 5 ? 'E' : 'F';
                        const isZero = activeStudentResult?.average === 0;

                        return (
                          <tr key={subj.id} className="h-[25px] border-r border-slate-400">
                            {/* index */}
                            <td className="border-r border-slate-350 font-bold font-mono text-slate-650">
                              {idx + 1}
                            </td>
                            {/* subject name */}
                            <td className="border-r border-slate-350 text-left pl-2.5 font-semibold text-slate-800 truncate">
                              {subj.name.split(' (')[0]}
                            </td>
                            {/* raw score value */}
                            <td className={`border-r border-slate-350 font-bold font-mono text-xs ${val < 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {isZero ? '-' : scoreVal !== undefined ? scoreVal : '-'}
                            </td>
                            {/* Individual Subject Letter Grade */}
                            <td className="border-r border-slate-350 font-extrabold text-slate-700">
                              {isZero ? '-' : scoreVal !== undefined ? gradeLetter : '-'}
                            </td>
                            {/* absence with permit (show on row-1 only of table, or spread) */}
                            <td className="border-r border-slate-300 font-mono text-slate-500">
                              {idx === 0 && absWithPermit > 0 ? toKhmerDigits(absWithPermit) : '០'}
                            </td>
                            <td className="font-mono text-slate-500">
                              {idx === 0 && absNoPermit > 0 ? toKhmerDigits(absNoPermit) : '០'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* "មូលវិចាររបស់គ្រូ" column on the right side - Beautiful large merged cell matching workbook template */}
                <div className="col-span-3 border-l border-slate-400 relative">
                  <div className="absolute inset-0 flex flex-col">
                    {/* Header bar */}
                    <div className="bg-slate-50 text-center py-2 border-b border-slate-400 font-moul text-[8.5px] leading-normal h-[52px] flex items-center justify-center">
                      មូលវិចារគ្រូ
                    </div>
                    {/* Content area */}
                    <div className="flex-1 p-3.5 bg-stone-50/15 leading-relaxed overflow-hidden flex flex-col justify-center text-center">
                      <p className="text-[10px] text-slate-900 font-semibold italic select-none">
                        " {commentInput || 'ខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំខ្លាំង។' } "
                      </p>
                      
                      {/* Dotted lines illustration at bottom of column */}
                      <div className="mt-4 border-t border-dashed border-slate-300 pt-3 space-y-1 text-left hidden print:block">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">កំណត់បន្ថែមភារកិច្ច៖</span>
                        <div className="border-b border-dotted border-slate-300 h-2.5"></div>
                        <div className="border-b border-dotted border-slate-300 h-2.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Important Summary Rows right underneath the main blocks */}
              <div className="mt-2 text-center text-xs">
                <div className="grid grid-cols-3 border border-slate-400 overflow-hidden rounded-lg font-bold text-slate-800 bg-slate-50/25">
                  <div className="p-2 border-r border-slate-400">
                    <span className="text-[9.5px] font-moul text-slate-500 block uppercase mb-0.5">សរុបពិន្ទុ</span>
                    <span className="text-sm font-extrabold font-mono text-slate-800">
                      {activeStudentResult?.total || 0}
                    </span>
                  </div>
                  <div className="p-2 border-r border-slate-400 bg-blue-50/10">
                    <span className="text-[9.5px] font-moul text-blue-800 block uppercase mb-0.5">មធ្យមភាគ</span>
                    <span className="text-sm font-extrabold font-mono text-blue-900">
                      {activeStudentResult?.average || 0}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[9.5px] font-moul text-red-650 block uppercase mb-0.5">ចំណាត់ថ្នាក់</span>
                    <span className="text-sm font-extrabold text-red-650">
                      {activeStudentResult?.average === 0 ? '-' : toKhmerDigits(activeStudentResult?.rank || 1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom statistics & parent signature cards */}
              <div className="mt-4 grid grid-cols-2 gap-4 items-start pt-1 font-semibold text-slate-700">
                
                {/* LEFT BLOCK: Parent signature and hand remarks draft */}
                <div className="space-y-2 border border-slate-205 p-3.5 rounded-xl bg-slate-50/10 select-none">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    សិស្សសរុបមានចំនួន៖ <strong className="text-slate-800 font-mono text-xs">{students.length}</strong> នាក់, ស្រី៖ <strong className="text-slate-800 font-mono text-xs">{totalGirlsInClass}</strong> នាក់
                  </p>
                  
                  <div className="space-y-1 text-[10.5px]">
                    <span className="text-[9px] font-moul text-slate-600 block uppercase">មតិមាតាបិតា / អ្នកអាណាព្យាបាល៖</span>
                    <p className="text-[9px] text-slate-400 italic font-semibold leading-relaxed">
                      (មាតាបិតាអាចសរសេរមតិ យោបល់ ឬសេចក្តីសង្កេតពីផ្ទះចូលត្រង់ចន្លោះនេះ)
                    </p>
                    {/* Visual dotted lines for hand-written parents remarks */}
                    <div className="pt-2.5 space-y-3.5">
                      <div className="border-b border-dotted border-slate-350 h-1"></div>
                      <div className="border-b border-dotted border-slate-350 h-1"></div>
                      <div className="border-b border-dotted border-slate-350 h-1"></div>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center text-center">
                    <p className="text-[9px] font-semibold text-slate-500 leading-none">បានឃើញ និងឯកភាព</p>
                    <p className="font-moul text-[8.5px] pt-1 leading-normal text-slate-800">នាយក/នាយិកា</p>
                    <div className="h-16"></div>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">................................................</p>
                  </div>
                </div>

                {/* RIGHT BLOCK: Lunar calendar, solar date & homeroom signature */}
                <div className="flex flex-col items-end text-right pr-2 space-y-1">
                  {/* Lunar Date calculation in soft styling */}
                  <p className="text-[10px] text-amber-900 font-semibold leading-relaxed tracking-tight py-0.5">
                    {getLunarCalendarDate(selectedMonth, academicYear)}
                  </p>
                  
                  {/* Solar Date based on system parameters */}
                  <p className="text-[10px] font-bold text-slate-800 leading-relaxed">
                    ធ្វើនៅ វត្តតាមិម, ថ្ងៃទី {toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ {selectedMonth} ឆ្នាំ {toKhmerDigits(new Date().getFullYear())}
                  </p>

                  <div className="pt-8 flex flex-col items-center text-center w-full max-w-[200px] mt-2">
                    <p className="font-moul text-[8.5px] leading-normal text-slate-800">គ្រូបន្ទុកថ្នាក់</p>
                    <div className="h-20 flex items-center justify-center relative select-none">
                      {/* Decorative stamp element behind */}
                      <div className="absolute border border-dotted border-rose-500/10 rounded-full h-11 w-11 flex items-center justify-center rotate-12 -z-10 no-print">
                        <span className="text-[7px] text-rose-500/15 font-bold uppercase truncate">GRADED</span>
                      </div>
                    </div>
                    {/* Center aligned teacher's name */}
                    <p className="font-bold text-slate-850 text-xs border-b border-dashed border-slate-300 pb-0.5 min-w-[130px] font-mono tracking-wide">
                      {teacherName || '................................'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      ) : null}

      {/* Printable Area for ALL students when printMode === 'all' */}
      {printMode === 'all' && (
        <div className="hidden print:block">
          {sortedStudents.map((stud, sNewIdx) => {
            const studentResult = results.find((res) => res.student.id === stud.id);
            if (!studentResult) return null;

            const { student, total, average, rank } = studentResult;
            const scoreEntry = monthScores.find((e) => e.studentId === student.id);
            const scoresMap = scoreEntry?.scores || {};
            const sCommentInput = scoreEntry?.comments || 'សិស្សមានការខិតខំរៀនសូត្រ វិន័យល្អ និងសីលធម៌រៀបរយ។';
            const sAbsWithPermit = scoresMap['__absence_permit'] !== undefined ? scoresMap['__absence_permit'] : 0;
            const sAbsNoPermit = scoresMap['__absence_no_permit'] !== undefined ? scoresMap['__absence_no_permit'] : 0;
            const isZero = average === 0;

            return (
              <div 
                key={student.id} 
                className="print-page bg-white p-8 font-sans relative"
                style={{ pageBreakBefore: sNewIdx > 0 ? 'always' : 'avoid' }}
              >
                {/* Report Header Logo & Title */}
                <div className="grid grid-cols-3 items-start pb-2 border-b border-double border-slate-400 mb-4 animate-none">
                  <div className="text-left space-y-1">
                    <h3 className="font-moul text-[10px] text-slate-800 leading-normal">{ministryLabel}</h3>
                    <h4 className="font-moul text-[8.5px] text-slate-700 leading-normal pl-1.5">{provincialLabel}</h4>
                    <p className="text-[9.5px] font-semibold text-slate-700 pl-3 leading-normal">
                      {districtLabel}
                    </p>
                    <p className="text-[10.5px] font-bold text-slate-900 pl-4 leading-normal">
                      សាលា៖ <span className="underline decoration-dotted stroke-slate-400 underline-offset-4 font-bold text-[11px]">{schoolLabel}</span>
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

                {/* Title Section with student photo */}
                <div className="flex justify-between items-start pt-1.5 pb-4 border-b border-dashed border-slate-200">
                  <div className="flex-1 text-center pl-16">
                    <h2 className="font-moul text-base md:text-lg text-blue-900 tracking-wide uppercase">ប្រឡងប្រចាំខែ{selectedMonth}</h2>
                    <div className="mt-1 flex items-center justify-center gap-6 text-[10.5px] text-slate-600 font-bold">
                      <span>ថ្នាក់៖ <strong className="text-slate-900 font-mono text-xs underline decoration-dotted decoration-slate-400">{className}</strong></span>
                      <span>ឆ្នាំសិក្សា៖ <strong className="text-slate-900 font-mono text-xs underline decoration-dotted decoration-slate-400">{academicYear}</strong></span>
                    </div>
                  </div>

                  {/* Passport Portrait photo block */}
                  <div className="shrink-0 w-[80px] h-[100px] border border-slate-400 flex flex-col items-center justify-center bg-slate-50 rounded select-none relative overflow-hidden">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt="Student Portrait"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-1 space-y-1 text-center flex flex-col items-center">
                        <Camera className="h-4 w-4 text-slate-350" />
                        <span className="text-[7.5px] font-bold text-slate-400 leading-normal block">រូបថត ៤x៦</span>
                        <span className="text-[6.5px] text-slate-350 block">គ្មានរូប</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity line details section */}
                <div className="mt-4 grid grid-cols-12 gap-y-1.5 items-center text-[11px] text-slate-800 leading-normal pb-3.5 pt-0.5">
                  <div className="col-span-6 flex gap-1">
                    <span className="font-moul text-[9px] text-slate-600">គោត្តនាម-នាមសិស្ស៖</span>
                    <span className="font-bold text-slate-900 border-b border-dashed border-slate-350 pl-1 expand-underline uppercase">
                      {student.nameKh}
                    </span>
                  </div>
                  
                  <div className="col-span-4 flex gap-1">
                    <span className="font-moul text-[9px] text-slate-600">ឡាតាំង En៖</span>
                    <span className="font-mono font-bold text-slate-700 border-b border-dashed border-slate-350 pl-1 expand-underline uppercase">
                      {student.nameEn}
                    </span>
                  </div>

                  <div className="col-span-2 flex gap-1">
                    <span className="font-moul text-[9px] text-slate-600">ភេទ៖</span>
                    <span className="font-bold text-slate-900 border-b border-dashed border-slate-330 pl-1 expand-underline">
                      {student.gender === 'ស្រី' ? 'ស' : 'ប'}
                    </span>
                  </div>
                </div>

                {/* Major subjects Tabular block */}
                <div className="grid grid-cols-12 gap-0 relative border-l border-t border-b border-slate-400">
                  {/* Score columns list */}
                  <div className="col-span-9">
                    <table className="w-full text-center border-collapse text-[10.5px] text-slate-800 table-fixed">
                      <thead>
                        <tr className="bg-slate-50 font-semibold h-[28px] border-b border-r border-slate-400 text-[10px]">
                          <th className="border-r border-slate-400 w-[40px]">ល.រ</th>
                          <th className="border-r border-slate-400 text-left pl-2.5">មុខវិជ្ជា</th>
                          <th className="border-r border-slate-400 w-[120px]" colSpan={2}>លទ្ធផលសិក្សា</th>
                          <th className="w-[120px]" colSpan={2}>អវត្តមាន</th>
                        </tr>
                        {/* Secondary subheader row */}
                        <tr className="bg-slate-50/50 font-semibold h-[24px] border-b border-r border-slate-400 text-[9px] text-slate-500 uppercase tracking-wide">
                          <th className="border-r border-slate-400"></th>
                          <th className="border-r border-slate-400"></th>
                          <th className="border-r border-slate-400 w-[60px] text-slate-800 font-bold">ពិន្ទុ</th>
                          <th className="border-r border-slate-400 w-[60px]">និទ្ទេស</th>
                          <th className="border-r border-slate-400 w-[60px]">មានច្បាប់</th>
                          <th className="w-[60px]">អត់ច្បាប់</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {subjects.map((subj, idx) => {
                          const scoreVal = scoresMap[subj.id];
                          const val = typeof scoreVal === 'number' ? scoreVal : 0;
                          const gradeLetter = val >= 9 ? 'A' : val >= 8 ? 'B' : val >= 7 ? 'C' : val >= 6 ? 'D' : val >= 5 ? 'E' : 'F';

                          return (
                            <tr key={subj.id} className="h-[25px] border-r border-slate-400">
                              <td className="border-r border-slate-350 font-bold font-mono text-slate-650">
                                {idx + 1}
                              </td>
                              <td className="border-r border-slate-350 text-left pl-2.5 font-semibold text-slate-800 truncate">
                                {subj.name.split(' (')[0]}
                              </td>
                              <td className={`border-r border-slate-350 font-bold font-mono text-xs ${val < 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                                {isZero ? '-' : scoreVal !== undefined ? scoreVal : '-'}
                              </td>
                              <td className="border-r border-slate-350 font-extrabold text-slate-700">
                                {isZero ? '-' : scoreVal !== undefined ? gradeLetter : '-'}
                              </td>
                              <td className="border-r border-slate-300 font-mono text-slate-500">
                                {idx === 0 && sAbsWithPermit > 0 ? toKhmerDigits(sAbsWithPermit) : '០'}
                              </td>
                              <td className="font-mono text-slate-500">
                                {idx === 0 && sAbsNoPermit > 0 ? toKhmerDigits(sAbsNoPermit) : '០'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Comment column */}
                  <div className="col-span-3 border-l border-slate-400 relative">
                    <div className="absolute inset-0 flex flex-col">
                      <div className="bg-slate-50 text-center py-2 border-b border-slate-400 font-moul text-[8.5px] leading-normal h-[52px] flex items-center justify-center">
                        មូលវិចារគ្រូ
                      </div>
                      <div className="flex-1 p-3.5 bg-stone-50/15 leading-relaxed overflow-hidden flex flex-col justify-center text-center">
                        <p className="text-[10px] text-slate-900 font-semibold italic select-none">
                          " {sCommentInput || 'ខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំខ្លាំង។' } "
                        </p>
                        
                        <div className="mt-4 border-t border-dashed border-slate-300 pt-3 space-y-1 text-left hidden print:block">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">កំណត់បន្ថែមភារកិច្ច៖</span>
                          <div className="border-b border-dotted border-slate-300 h-2.5"></div>
                          <div className="border-b border-dotted border-slate-300 h-2.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary boxes */}
                <div className="mt-2 text-center text-xs">
                  <div className="grid grid-cols-3 border border-slate-400 overflow-hidden rounded-lg font-bold text-slate-800 bg-slate-50/25">
                    <div className="p-2 border-r border-slate-400">
                      <span className="text-[9.5px] font-moul text-slate-500 block uppercase mb-0.5">សរុបពិន្ទុ</span>
                      <span className="text-sm font-extrabold font-mono text-slate-800">
                        {total}
                      </span>
                    </div>
                    <div className="p-2 border-r border-slate-400 bg-blue-50/10">
                      <span className="text-[9.5px] font-moul text-blue-800 block uppercase mb-0.5">មធ្យមភាគ</span>
                      <span className="text-sm font-extrabold font-mono text-blue-900">
                        {average}
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9.5px] font-moul text-red-650 block uppercase mb-0.5">ចំណាត់ថ្នាក់</span>
                      <span className="text-sm font-extrabold text-red-650">
                        {average === 0 ? '-' : toKhmerDigits(rank)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parents sign and signature */}
                <div className="mt-4 grid grid-cols-2 gap-4 items-start pt-1 font-semibold text-slate-700">
                  <div className="space-y-2 border border-slate-205 p-3.5 rounded-xl bg-slate-50/10 select-none">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      សិស្សសរុបមានចំនួន៖ <strong className="text-slate-800 font-mono text-xs">{sortedStudents.length}</strong> នាក់, ស្រី៖ <strong className="text-slate-800 font-mono text-xs">{totalGirlsInClass}</strong> នាក់
                    </p>
                    
                    <div className="space-y-1 text-[10.5px]">
                      <span className="text-[9px] font-moul text-slate-600 block uppercase">មតិមាតាបិតា / អ្នកអាណាព្យាបាល៖</span>
                      <div className="pt-2.5 space-y-3.5">
                        <div className="border-b border-dotted border-slate-350 h-1"></div>
                        <div className="border-b border-dotted border-slate-350 h-1"></div>
                        <div className="border-b border-dotted border-slate-350 h-1"></div>
                      </div>
                    </div>

                    <div className="pt-10 flex flex-col items-center text-center">
                      <p className="text-[9px] font-semibold text-slate-500 leading-none">បានឃើញ និងឯកភាព</p>
                      <p className="font-moul text-[8.5px] pt-1 leading-normal text-slate-800">នាយក/នាយិកា</p>
                      <div className="h-16"></div>
                      <p className="text-[10px] text-slate-400 font-medium leading-none">................................................</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right pr-2 space-y-1">
                    <p className="text-[10px] text-amber-900 font-semibold leading-relaxed tracking-tight py-0.5">
                      {getLunarCalendarDate(selectedMonth, academicYear)}
                    </p>
                    
                    <p className="text-[10px] font-bold text-slate-800 leading-relaxed">
                      ធ្វើនៅ វត្តតាមិម, ថ្ងៃទី {toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ {selectedMonth} ឆ្នាំ {toKhmerDigits(new Date().getFullYear())}
                    </p>

                    <div className="pt-8 flex flex-col items-center text-center w-full max-w-[200px] mt-2">
                      <p className="font-moul text-[8.5px] leading-normal text-slate-800">គ្រូបន្ទុកថ្នាក់</p>
                      <div className="h-20 flex items-center justify-center relative select-none">
                        <div className="absolute border border-dotted border-rose-500/10 rounded-full h-11 w-11 flex items-center justify-center rotate-12 -z-10 no-print">
                          <span className="text-[7px] text-rose-500/15 font-bold uppercase truncate">GRADED</span>
                        </div>
                      </div>
                      <p className="font-bold text-slate-850 text-xs border-b border-dashed border-slate-300 pb-0.5 min-w-[130px] font-mono tracking-wide">
                        {teacherName || '................................'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
