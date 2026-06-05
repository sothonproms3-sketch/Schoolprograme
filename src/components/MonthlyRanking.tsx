import React, { useState } from 'react';
import { Student, Subject, MonthScore, Gender } from '../types';
import { computeMonthlyResults, calculateGrade } from '../utils/calculations';
import { Printer, Trophy, Award, TrendingUp, Users, CheckCircle2, AlertCircle, FileSpreadsheet, FileDown, FileText, School, MapPin, LayoutGrid, List } from 'lucide-react';

interface MonthlyRankingProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
}

// Helper to determine ordinal rank suffixes standard in Cambodia (French influence)
// 1 => 1ᵉʳ (male), 1ᵉʳᵉ (female)
// 2 => 2ᵉ
function getOrdinalRank(rank: number, gender: Gender): string {
  if (rank === 1) {
    return gender === 'ស្រី' ? '1ᵉʳᵉ' : '1ᵉʳ';
  }
  return `${rank}ᵉ`;
}

// Convert input digits to Khmer digits
function toKhmerDigits(val: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(val).split('').map(char => {
    const idx = parseInt(char);
    return isNaN(idx) ? char : khmerDigits[idx];
  }).join('');
}

// Generate dynamic authentic Cambodian lunar calendar dates based on solar month & academic year
function getKhmerLunarCalendarDate(month: string, academicYearStr: string) {
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

  return `ថ្ងៃពុធ ៩កើត ${lMonth} ឆ្នាំ${zodiac} ${era} ព.ស.${khBe}`;
}

export default function MonthlyRanking({
  students,
  subjects,
  monthScores,
  className,
  teacherName,
  academicYear,
  selectedMonth,
}: MonthlyRankingProps) {
  // Compute results
  const results = computeMonthlyResults(students, subjects, monthScores);

  // States for custom metadata editing according to MoEYS standards
  const [ministryName, setMinistryName] = useState(() => localStorage.getItem('label_ministry') || 'ក្រសួងអប់រំ យុវជន និងកីឡា');
  const [provinceName, setProvinceName] = useState(() => localStorage.getItem('label_provincial') || 'មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង');
  const [districtCommune, setDistrictCommune] = useState(() => localStorage.getItem('label_district') || 'ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកសង្កែ');
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('label_school') || 'សាលាបឋមសិក្សាវត្តចចង');
  const [madeInLoc, setMadeInLoc] = useState(() => localStorage.getItem('label_madein') || 'វត្តចចង');
  const [layoutMode, setLayoutMode] = useState<'double' | 'single'>('double');

  // Compute Class Stats
  const totalStudents = students.length;
  const femaleStudentsCount = students.filter(s => s.gender === 'ស្រី').length;
  
  const classAverage = totalStudents > 0 
    ? Number((results.reduce((sum, res) => sum + res.average, 0) / totalStudents).toFixed(2))
    : 0;
     
  const highestAverage = results.length > 0 ? results[0].average : 0;
  const lowestAverage = results.length > 0 ? results[results.length - 1].average : 0;
  
  const passedStudents = results.filter(res => res.average >= 5.0);
  const passRate = totalStudents > 0 ? Number(((passedStudents.length / totalStudents) * 100).toFixed(1)) : 0;

  // Detailed Stats Calculation for the Bottom Boxes
  const passedCount = passedStudents.length;
  const passedPct = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const passedGirlsCount = passedStudents.filter(r => r.student.gender === 'ស្រី').length;
  const passedGirlsPct = femaleStudentsCount > 0 ? Math.round((passedGirlsCount / femaleStudentsCount) * 100) : 0;

  const failedStudents = results.filter(res => res.average < 5.0);
  const failedCount = failedStudents.length;
  const failedPct = totalStudents > 0 ? Math.round((failedCount / totalStudents) * 100) : 0;
  const failedGirlsCount = failedStudents.filter(r => r.student.gender === 'ស្រី').length;
  const failedGirlsPct = femaleStudentsCount > 0 ? Math.round((failedGirlsCount / femaleStudentsCount) * 100) : 0;

  // Grade lists dynamic helper calculations
  const calculateGradeStat = (gradeLetter: string) => {
    const totalG = results.filter(r => r.gradeLetter === gradeLetter);
    const count = totalG.length;
    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
    const girlsCount = totalG.filter(r => r.student.gender === 'ស្រី').length;
    const girlsPct = femaleStudentsCount > 0 ? Math.round((girlsCount / femaleStudentsCount) * 100) : 0;
    return { count, pct, girlsCount, girlsPct };
  };

  const statA = calculateGradeStat('A');
  const statB = calculateGradeStat('B');
  const statC = calculateGradeStat('C');
  const statD = calculateGradeStat('D');
  const statE = calculateGradeStat('E');
  const statF = calculateGradeStat('F');

  // Custom metadata signatures name
  const lastHonoredName = results.length > 0 ? results[results.length - 1].student.nameKh : '...............';

  // Calculate Average by Subject
  const subjectStats = subjects.map((subj) => {
    let sum = 0;
    let count = 0;
    monthScores.forEach((e) => {
      const val = e.scores[subj.id];
      if (val !== undefined) {
        sum += val;
        count++;
      }
    });
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    return {
      subject: subj,
      average: avg
    };
  });

  const triggerPrint = () => {
    window.print();
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

  const exportToCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    const headers = ["ចំណាត់ថ្នាក់", "ឈ្មោះសិស្ស (ខ្មែរ)", "ឈ្មោះសិស្ស (ឡាតាំង)", "ភេទ"];
    subjects.forEach(subj => {
      headers.push(`${subj.name} (ពិន្ទុអតិបរមា ${subj.maxScore})`);
    });
    headers.push("ពិន្ទុសរុប", "មធ្យមភាគ", "និទ្ទេស");
    
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    results.forEach(res => {
      const row = [
        res.rank,
        res.student.nameKh,
        res.student.nameEn,
        res.student.gender
      ];
      subjects.forEach(subj => {
        const score = res.scores[subj.id];
        row.push(score !== undefined ? score : "-");
      });
      row.push(res.total, res.average, `${res.gradeLetter} (${res.grade.split(' ')[0]})`);
      
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\r\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `តារាងចំណាត់ថ្នាក់_ខែ_${selectedMonth}_ថ្នាក់_${className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const title = `តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ${selectedMonth}`;
    const subTitle = `ថ្នាក់៖ ${className} | ឆ្នាំសិក្សា៖ ${academicYear} | គ្រូបង្រៀន៖ ${teacherName}`;
    
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8"/>
      <style>
        table { border-collapse: collapse; font-family: 'Kantomruy Pro', 'Segoe UI', Arial, sans-serif; }
        td, th { border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center; }
        th { background-color: #1e3a8a; color: white; font-weight: bold; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; color: #1e3a8a; }
        .subtitle { font-size: 11pt; text-align: center; color: #475569; padding-bottom: 20px; }
        .top3 { background-color: #fef3c7; font-weight: bold; }
        .failed { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${subjects.length + 7}" class="title">${title}</td></tr>
        <tr><td colspan="${subjects.length + 7}" class="subtitle">${subTitle}</td></tr>
        <tr>
          <th>ចំណាត់ថ្នាក់</th>
          <th>ឈ្មោះសិស្ស</th>
          <th>Student Name</th>
          <th>ភេទ</th>
          ${subjects.map(subj => `<th>${subj.name}</th>`).join('')}
          <th>ពិន្ទុសរុប</th>
          <th>មធ្យមភាគ</th>
          <th>និទ្ទេស (Grade)</th>
        </tr>
    `;
    
    results.forEach(res => {
      const isTop3 = res.rank <= 3;
      const isFailed = res.average < 5.0;
      const rowClass = isTop3 ? 'class="top3"' : '';
      
      html += `
        <tr ${rowClass}>
          <td>${res.rank}</td>
          <td style="text-align: left; font-weight: bold;">${res.student.nameKh}</td>
          <td style="text-align: left;">${res.student.nameEn}</td>
          <td>${res.student.gender}</td>
          ${subjects.map(subj => {
            const score = res.scores[subj.id];
            const scoreStr = score !== undefined ? score : '-';
            const scoreStyle = score !== undefined && score < 5 ? 'style="color: red; font-weight: bold;"' : '';
            return `<td ${scoreStyle}>${scoreStr}</td>`;
          }).join('')}
          <td style="font-weight: bold;">${res.total}</td>
          <td ${isFailed ? 'class="failed"' : 'style="font-weight: bold; color: #1e40af;"'}>${res.average}</td>
          <td>${res.gradeLetter} (${res.grade.split(' ')[0]})</td>
        </tr>
      `;
    });
    
    html += `
      </table>
    </body>
    </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `តារាងចំណាត់ថ្នាក់_ខែ_${selectedMonth}_ថ្នាក់_${className.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const title = `តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ${selectedMonth}`;
    
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8"/>
      <style>
        @page { size: A4 landscape; margin: 0.5in; }
        body { font-family: 'Kantomruy Pro', 'Segoe UI', Arial, sans-serif; color: #334155; }
        .moul-font { font-family: sans-serif; font-weight: bold; font-size: 11pt; text-align: center; }
        h1 { font-size: 14pt; color: #1e3a8a; text-align: center; margin-top: 15px; font-weight: bold; }
        .info-table { width: 100%; border: none; margin-bottom: 15px; }
        .info-table td { border: none; padding: 4px; font-size: 10pt; }
        .main-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .main-table th { border: 1px solid #94a3b8; background-color: #f1f5f9; padding: 6px; font-size: 8pt; font-weight: bold; text-align: center; }
        .main-table td { border: 1px solid #cbd5e1; padding: 6px; font-size: 8pt; text-align: center; }
        .signature-section { width: 100%; border: none; margin-top: 30px; }
        .signature-section td { border: none; padding: 8px; text-align: center; font-size: 10pt; }
      </style>
    </head>
    <body>
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="width: 38%; border: none; text-align: left; vertical-align: top; padding: 0;">
            <span style="font-family: sans-serif; font-size: 10pt; font-weight: bold; color: #1e293b;">${ministryName}</span><br>
            <span style="font-family: sans-serif; font-size: 8.5pt; font-weight: bold; color: #334155;">${provinceName}</span><br>
            <span style="font-size: 9pt; font-weight: bold; color: #475569;">${districtCommune}</span><br>
            <span style="font-size: 9pt; font-weight: bold; color: #1e293b;">សាលា៖ <u>${schoolName}</u></span>
          </td>
          <td style="width: 34%; border: none; text-align: center; vertical-align: top; padding: 0;">
            <span style="font-family: sans-serif; font-size: 11pt; font-weight: bold; color: #0f172a;">ព្រះរាជាណាចក្រកម្ពុជា</span><br>
            <span style="font-family: sans-serif; font-size: 9.5pt; font-weight: bold; color: #1e293b; letter-spacing: 1px;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span><br>
            <div style="font-size: 8pt; color: #b45309; text-align: center; margin-top: 3px;">~ ~ ~ * ~ ~ ~</div>
          </td>
          <td style="width: 28%; border: none; text-align: right; vertical-align: top; padding: 0;"></td>
        </tr>
      </table>
      
      <h1>${title}</h1>
      
      <table class="info-table">
        <tr>
          <td><strong>ថ្នាក់៖</strong> ${className}</td>
          <td style="text-align: center;"><strong>ឆ្នាំសិក្សា៖</strong> ${academicYear}</td>
          <td style="text-align: right;"><strong>គ្រូបង្រៀន៖</strong> ${teacherName}</td>
        </tr>
      </table>
      
      <table class="main-table">
        <thead>
          <tr>
            <th>ចំណាត់ថ្នាក់</th>
            <th>ឈ្មោះសិស្ស</th>
            <th>Lat. Name</th>
            <th>ភេទ</th>
            ${subjects.map(subj => `<th>${subj.name.split(' ')[0]}</th>`).join('')}
            <th>ពិន្ទុសរុប</th>
            <th>មធ្យមភាគ</th>
            <th>និទ្ទេស</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    results.forEach(res => {
      html += `
        <tr>
          <td style="font-weight: bold;">${res.rank}</td>
          <td style="text-align: left; font-weight: bold;">${res.student.nameKh}</td>
          <td style="text-align: left; font-size: 8pt; text-transform: uppercase;">${res.student.nameEn}</td>
          <td>${res.student.gender}</td>
          ${subjects.map(subj => {
            const score = res.scores[subj.id];
            return `<td>${score !== undefined ? score : '-'}</td>`;
          }).join('')}
          <td style="font-weight: bold;">${res.total}</td>
          <td style="font-weight: bold; background-color: #f8fafc;">${res.average}</td>
          <td>${res.gradeLetter}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
      
      <table class="signature-section">
        <tr>
          <td style="width: 50%;">
            <p style="margin: 0;">បានឃើញ និងឯកភាព</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 10pt;">នាយក/នាយិកា</p>
            <br/><br/><br/>
          </td>
          <td style="width: 50%;">
            <p style="margin: 0; font-style: italic;">ថ្ងៃទី ........ ខែ ................ ឆ្នាំ ២០២...</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 10pt;">គ្រូបន្ទុកថ្នាក់</p>
            <br/><br/><br/>
            <p style="margin: 0; font-weight: bold;">${teacherName || '................................'}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `តារាងចំណាត់ថ្នាក់_ខែ_${selectedMonth}_ថ្នាក់_${className.replace(/\s+/g, '_')}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logic to split the data for Double Columns side-by-side
  const halfCount = Math.ceil(results.length / 2);
  const leftColumnResults = results.slice(0, halfCount);
  const rightColumnResults = results.slice(halfCount);

  // Maximum rows between the left and right side to ensure consistent design row-height
  const maxRows = Math.max(leftColumnResults.length, rightColumnResults.length);

  return (
    <div className="space-y-6">
      {/* Action Header bar with Print & Export options */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-2xl shadow-xs border border-slate-200 gap-4 no-print border-slate-150">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រងការបោះពុម្ព និងនាំចេញតារាងចំណាត់ថ្នាក់</h3>
          <p className="text-xs text-slate-400">
            កំណត់រចនាសម្ព័ន្ធប្លង់តារាងចំណាត់ថ្នាក់ប្រចាំខែទៅតាមស្តង់ដារលិខិតផ្លូវការរបស់ក្រសួង។
          </p>
        </div>
        
        {/* Layout Selective Switch & Export Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout switches */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setLayoutMode('double')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'double'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="ប្លង់តារាង ២ ជួរក្បែរគ្នា បោះពុម្ពសន្សំក្រដាស (សាលារដ្ឋ)"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-amber-500" />
              <span>ប្លង់ ២ ជួរ (ស្ទួន)</span>
            </button>
            <button
              onClick={() => setLayoutMode('single')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'single'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="ប្លង់តារាង ១ ជួរវែងធម្មតា បង្ហាញព័ត៌មានលម្អិតទាំងអស់"
            >
              <List className="h-3.5 w-3.5 text-blue-500" />
              <span>ប្លង់ ១ ជួរវែង</span>
            </button>
          </div>

          <button
            onClick={triggerPrint}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs h-[38px]"
          >
            <Printer className="h-4 w-4" />
            <span>បោះពុម្ព (Print A4)</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs h-[38px]"
            title="ទាញយកជាឯកសារ Excel (.xls) ដែលមានទម្រង់ស្អាតស្រាប់"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>នាំចេញជា Excel</span>
          </button>

          <button
            onClick={exportToWord}
            className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs h-[38px]"
          >
            <FileText className="h-4 w-4" />
            <span>នាំចេញ Word</span>
          </button>

          <button
            onClick={exportStudentsList}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs h-[38px]"
            title="ទាញយកបញ្ជីប្រវត្តិរូបសិស្សទាំងអស់ទៅជាឯកសារ CSV/Excel"
          >
            <Users className="h-4 w-4" />
            <span>នាំចេញបញ្ជីសិស្ស</span>
          </button>
        </div>
      </div>

      {/* Editable school information configuration (no-print) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 border-slate-150">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-blue-650" />
            <span>ក្រសួងសាមី</span>
          </label>
          <input
            type="text"
            value={ministryName}
            onChange={(e) => {
              setMinistryName(e.target.value);
              localStorage.setItem('label_ministry', e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-indigo-650" />
            <span>មន្ទីរអប់រំខេត្ត/រាជធានី</span>
          </label>
          <input
            type="text"
            value={provinceName}
            onChange={(e) => {
              setProvinceName(e.target.value);
              localStorage.setItem('label_provincial', e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-teal-650" />
            <span>ការិយាល័យអប់រំស្រុក/ខណ្ឌ</span>
          </label>
          <input
            type="text"
            value={districtCommune}
            onChange={(e) => {
              setDistrictCommune(e.target.value);
              localStorage.setItem('label_district', e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-sky-650" />
            <span>ឈ្មោះសាលារៀន</span>
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => {
              setSchoolName(e.target.value);
              localStorage.setItem('label_school', e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-rose-550" />
            <span>សរសេរធ្វើនៅទីតាំង</span>
          </label>
          <input
            type="text"
            value={madeInLoc}
            onChange={(e) => {
              setMadeInLoc(e.target.value);
              localStorage.setItem('label_madein', e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dashboard Analytics summary figures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">សិស្សសរុប</span>
            <span className="text-sm font-bold text-slate-800">{totalStudents} នាក់ (ស្រី {femaleStudentsCount})</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-150 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">មធ្យមភាគថ្នាក់</span>
            <span className="text-sm font-bold text-emerald-700">{classAverage} / 10</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-150 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ពិន្ទុខ្ពស់បំផុត</span>
            <span className="text-sm font-bold text-amber-700">{highestAverage} / 10</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-150 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">អត្រាជាប់មធ្យម</span>
            <span className="text-sm font-bold text-indigo-700">{passRate}% (&gt;= ៥.០)</span>
          </div>
        </div>
      </div>

      {/* Printed Template Outer Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 md:p-8 print-area">
        {/* Ministry Official Header (Dual block with double-border layout under) */}
        <div className="grid grid-cols-3 items-start pb-4 border-b border-double border-slate-400 mb-4">
          <div className="text-left space-y-1">
            <h3 className="font-moul text-[10px] text-slate-900 leading-normal">{ministryName}</h3>
            <h4 className="font-moul text-[8.5px] text-slate-700 leading-normal pl-1">{provinceName}</h4>
            <p className="text-[9.5px] font-semibold text-slate-700 pl-2 leading-normal">
              {districtCommune}
            </p>
            <p className="text-[10.5px] font-bold text-slate-900 pl-4 leading-normal">
              សាលា៖ <span className="underline decoration-dotted underline-offset-4 font-bold text-[11px]">{schoolName}</span>
            </p>
          </div>
          
          <div className="text-center space-y-0.5 col-span-1">
            <h2 className="font-moul text-[11px] text-slate-900 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h2>
            <h3 className="font-moul text-[9px] text-slate-850 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
            <div className="flex justify-center py-1">
              {/* Decorative signature ornament */}
              <svg width="40" height="8" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 block">
                <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="text-right"></div>
        </div>

        {/* Main Banner Title */}
        <div className="text-center pb-5 pt-2 relative">
          <h1 className="font-moul text-xl md:text-2xl text-blue-900 tracking-wider">ចំណាត់ថ្នាក់ប្រចាំខែ</h1>
          <div className="mt-1.5">
            <span className="font-moul text-sm md:text-base text-red-650 px-3 py-1 border border-dashed border-red-300 rounded bg-red-50/20 inline-block">
              ខែ{selectedMonth}
            </span>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10.5px] text-slate-600 font-bold mt-2">
            <span>ថ្នាក់៖ <strong className="text-slate-900 font-mono text-xs">{className}</strong></span>
            <span>ឆ្នាំសិក្សា៖ <strong className="text-slate-900 font-mono text-xs">{academicYear}</strong></span>
          </div>
        </div>

        {/* Dynamic Layout selection depending on user choices */}
        {layoutMode === 'double' ? (
          /* ==================== DOUBLE COLUMNS SIDE-BY-SIDE ==================== */
          <div className="grid grid-cols-2 gap-4 relative">
            {/* Split line separator */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-slate-350 transform -translate-x-1/2"></div>
            
            {/* LEFT TABLE CHANNEL */}
            <div>
              <table className="w-full text-center border-collapse border border-slate-400 text-[10.5px] text-slate-800">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-400 font-semibold h-[28px] text-[10px]">
                    <th className="border-r border-slate-400 w-[35px]">ល.រ</th>
                    <th className="border-r border-slate-400 text-left pl-2 min-w-[100px]">ឈ្មោះសិស្ស</th>
                    <th className="border-r border-slate-400 w-[28px]">ភេទ</th>
                    <th className="border-r border-slate-400 w-[55px]">ពិន្ទុសរុប</th>
                    <th className="border-r border-slate-400 w-[48px]">មធ្យមភាគ</th>
                    <th className="border-r border-slate-400 w-[48px]">ចំណាត់ថ្នាក់</th>
                    <th className="border-r border-slate-400 w-[35px]">និទ្ទេស</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {Array.from({ length: maxRows }).map((_, i) => {
                    const row = leftColumnResults[i];
                    if (!row) {
                      // Empty placeholder row to maintain symmetrical height matching mock image
                      return (
                        <tr key={`empty-left-${i}`} className="h-[26px]">
                          <td className="border-r border-slate-300 font-mono text-slate-300">{i + 1}</td>
                          <td className="border-r border-slate-300 text-left pl-2 text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                          <td className="border-r border-slate-300 font-mono text-slate-300">-</td>
                          <td className="border-r border-slate-300 font-mono text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                        </tr>
                      );
                    }

                    const isTop3 = row.rank <= 3;
                    const displayGenderSymbol = row.student.gender === 'ស្រី' ? 'ស' : 'ប';
                    
                    return (
                      <tr key={row.student.id} className={`h-[26px] ${isTop3 ? 'bg-amber-50/15' : ''}`}>
                        {/* Index */}
                        <td className="border-r border-slate-350 font-bold font-mono text-slate-800">
                          {i + 1}
                        </td>
                        
                        {/* Khmer Name */}
                        <td className="border-r border-slate-350 text-left pl-2 font-bold text-slate-900 truncate max-w-[120px]">
                          {row.student.nameKh}
                        </td>
                        
                        {/* Simplified Khmer Gender tag: ស for ស្រី, ប for ប្រុស */}
                        <td className="border-r border-slate-350 font-semibold">
                          {displayGenderSymbol}
                        </td>
                        
                        {/* Total point */}
                        <td className="border-r border-slate-350 font-semibold font-mono text-slate-700">
                          {row.total}
                        </td>
                        
                        {/* Average */}
                        <td className="border-r border-slate-350 font-bold font-mono text-blue-900">
                          {row.average}
                        </td>
                        
                        {/* Khmer Standard superscript rank value ordinal */}
                        <td className={`border-r border-slate-350 font-bold ${isTop3 ? 'text-red-600' : 'text-slate-700'}`}>
                          <sup>{getOrdinalRank(row.rank, row.student.gender).match(/^\d+/) || ''}</sup>
                          <span className="text-[8px]">{getOrdinalRank(row.rank, row.student.gender).replace(/^\d+/, '')}</span>
                        </td>
                        
                        {/* Letter Grade */}
                        <td className="border-r border-slate-350 font-bold text-slate-800">
                          {row.gradeLetter}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RIGHT TABLE CHANNEL */}
            <div>
              <table className="w-full text-center border-collapse border border-slate-400 text-[10.5px] text-slate-800">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-400 font-semibold h-[28px] text-[10px]">
                    <th className="border-r border-slate-400 w-[35px]">ល.រ</th>
                    <th className="border-r border-slate-400 text-left pl-2 min-w-[100px]">ឈ្មោះសិស្ស</th>
                    <th className="border-r border-slate-400 w-[28px]">ភេទ</th>
                    <th className="border-r border-slate-400 w-[55px]">ពិន្ទុសរុប</th>
                    <th className="border-r border-slate-400 w-[48px]">មធ្យមភាគ</th>
                    <th className="border-r border-slate-400 w-[48px]">ចំណាត់ថ្នាក់</th>
                    <th className="border-r border-slate-400 w-[35px]">និទ្ទេស</th>
                    <th className="border-r border-slate-400 w-[55px]">ផ្សេងៗ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {Array.from({ length: maxRows }).map((_, i) => {
                    const row = rightColumnResults[i];
                    const seqNum = halfCount + i + 1;
                    if (!row) {
                      return (
                        <tr key={`empty-right-${i}`} className="h-[26px]">
                          <td className="border-r border-slate-300 font-mono text-slate-300">{seqNum}</td>
                          <td className="border-r border-slate-300 text-left pl-2 text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                          <td className="border-r border-slate-300 font-mono text-slate-300">-</td>
                          <td className="border-r border-slate-300 font-mono text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                          <td className="border-r border-slate-300 text-slate-300">-</td>
                        </tr>
                      );
                    }

                    const displayGenderSymbol = row.student.gender === 'ស្រី' ? 'ស' : 'ប';
                    const isZero = row.average === 0;

                    return (
                      <tr key={row.student.id} className="h-[26px]">
                        {/* Index */}
                        <td className="border-r border-slate-350 font-bold font-mono text-slate-800">
                          {seqNum}
                        </td>
                        
                        {/* Khmer Name */}
                        <td className="border-r border-slate-350 text-left pl-2 font-bold text-slate-900 truncate max-w-[120px]">
                          {row.student.nameKh}
                        </td>
                        
                        {/* Simple Gender mark */}
                        <td className="border-r border-slate-350 font-semibold">
                          {displayGenderSymbol}
                        </td>
                        
                        {/* Total point */}
                        <td className="border-r border-slate-350 font-semibold font-mono text-slate-700">
                          {row.total}
                        </td>
                        
                        {/* Average */}
                        <td className="border-r border-slate-350 font-bold font-mono text-blue-900">
                          {row.average}
                        </td>
                        
                        {/* Ordinal Rank with French styled superscripts */}
                        <td className="border-r border-slate-350 font-bold text-slate-700">
                          {isZero ? (
                            <span className="text-slate-400 font-normal">-</span>
                          ) : (
                            <>
                              <sup>{getOrdinalRank(row.rank, row.student.gender).match(/^\d+/) || ''}</sup>
                              <span className="text-[8px]">{getOrdinalRank(row.rank, row.student.gender).replace(/^\d+/, '')}</span>
                            </>
                          )}
                        </td>
                        
                        {/* Grade Letter */}
                        <td className="border-r border-slate-350 font-bold text-slate-800">
                          {row.gradeLetter}
                        </td>
                        
                        {/* Special remarks if average is 0 or low */}
                        <td className="border-r border-slate-350 text-[9px] text-red-650 leading-relaxed truncate max-w-[60px]" title={row.student.remarks}>
                          {isZero ? 'គ្មានចំណាត់ថ្នាក់' : row.student.remarks || ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ==================== SINGLE LONG COLUMN LAYOUT ==================== */
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-slate-400 text-xs text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-400 font-semibold h-[32px]">
                  <th className="border-r border-slate-400 w-[50px]">ល.រ</th>
                  <th className="border-r border-slate-400 text-left pl-3 min-w-[140px]">ឈ្មោះសិស្ស (Khmer)</th>
                  <th className="border-r border-slate-400 text-left pl-3 min-w-[120px] font-mono">Latin Name</th>
                  <th className="border-r border-slate-400 w-[50px]">ភេទ</th>
                  {subjects.map(subj => (
                    <th key={subj.id} className="border-r border-slate-300 w-[60px] truncate text-[10px]" title={subj.name}>
                      {subj.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="border-r border-slate-400 w-[70px] font-bold">ពិន្ទុសរុប</th>
                  <th className="border-r border-slate-400 w-[70px] font-bold text-blue-800">មធ្យមភាគ</th>
                  <th className="border-r border-slate-400 w-[70px] font-bold">ចំណាត់ថ្នាក់</th>
                  <th className="w-[80px] font-bold">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={subjects.length + 8} className="py-8 text-center text-slate-400">
                      មិនមានទិន្នន័យដើម្បីបង្ហាញចំណាត់ថ្នាក់ឡើយ។
                    </td>
                  </tr>
                ) : (
                  results.map((row, i) => {
                    const isTop3 = row.rank <= 3;
                    const isFailed = row.average < 5.0;
                    return (
                      <tr key={row.student.id} className={`h-[28px] ${isTop3 ? 'bg-amber-50/15' : ''}`}>
                        <td className="border-r border-slate-350 font-bold font-mono">{i + 1}</td>
                        <td className="border-r border-slate-350 text-left pl-3 font-bold text-slate-900">{row.student.nameKh}</td>
                        <td className="border-r border-slate-350 text-left pl-3 font-mono text-slate-500 uppercase text-[10px]">{row.student.nameEn}</td>
                        <td className="border-r border-slate-350 font-medium">{row.student.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
                        
                        {subjects.map(subj => {
                          const score = row.scores[subj.id];
                          return (
                            <td key={subj.id} className={`border-r border-slate-200 font-mono text-xs ${score < 5 ? 'text-rose-600 font-bold' : ''}`}>
                              {score !== undefined ? score : '-'}
                            </td>
                          );
                        })}

                        <td className="border-r border-slate-350 font-bold font-mono">{row.total}</td>
                        <td className={`border-r border-slate-350 font-bold font-mono text-blue-900 ${isFailed ? 'text-rose-600' : ''}`}>{row.average}</td>
                        
                        <td className={`border-r border-slate-350 font-bold ${isTop3 ? 'text-red-650' : 'text-slate-800'}`}>
                          <sup>{getOrdinalRank(row.rank, row.student.gender).match(/^\d+/) || ''}</sup>
                          <span className="text-[9px]">{getOrdinalRank(row.rank, row.student.gender).replace(/^\d+/, '')}</span>
                        </td>

                        <td className="font-semibold text-[10px] bg-slate-50/30">
                          <span className={`px-1.5 py-0.5 rounded border ${
                            row.gradeLetter === 'A' || row.gradeLetter === 'B' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            {row.gradeLetter} ({row.grade.split(' ')[0]})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistics Layout (Ministry-Standard Breakdown box underneath) */}
        {results.length > 0 && (
          <div className="mt-5 border border-slate-400 p-4 rounded-xl space-y-3 bg-slate-50/25">
            {/* Top row: general pass / fail metrics */}
            <div className="grid grid-cols-2 text-[11px] font-semibold text-slate-800 leading-normal gap-4 pb-2 border-b border-dashed border-slate-300">
              <div>
                <p className="inline-block">
                  ជាប់មធ្យមភាគ៖ <span className="font-mono text-green-700 font-bold text-xs">{passedCount}</span> នាក់ ត្រូវជា 
                  <span className="font-mono text-green-700 font-bold text-xs"> {passedPct}%</span>
                </p>
                <p className="inline-block pl-4">
                  ( ស្រី៖ <span className="font-mono text-green-700 font-bold text-xs">{passedGirlsCount}</span> នាក់ ត្រូវជា 
                  <span className="font-mono text-green-700 font-bold text-xs"> {passedGirlsPct}%</span> )
                </p>
              </div>
              <div className="text-right">
                <p className="inline-block">
                  ធ្លាក់មធ្យមភាគ៖ <span className="font-mono text-rose-700 font-bold text-xs">{failedCount}</span> នាក់ ត្រូវជា 
                  <span className="font-mono text-rose-700 font-bold text-xs"> {failedPct}%</span>
                </p>
                <p className="inline-block pl-4 text-left">
                  ( ស្រី៖ <span className="font-mono text-rose-700 font-bold text-xs">{failedGirlsCount}</span> នាក់ ត្រូវជា 
                  <span className="font-mono text-rose-700 font-bold text-xs"> {failedGirlsPct}%</span> )
                </p>
              </div>
            </div>

            {/* Middle grids: Details description of letter Grades */}
            <div className="grid grid-cols-2 md:grid-cols-6 text-[10.5px] text-slate-700 font-bold leading-normal gap-y-2 gap-x-4">
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-emerald-300/40 pb-0.5">និទ្ទេស A (ល្អប្រសើរ) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statA.count} ន ({statA.pct}%) | ស្រី: {statA.girlsCount} ន ({statA.girlsPct}%)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-emerald-300/40 pb-0.5">និទ្ទេស B (ល្អណាស់) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statB.count} ន ({statB.pct}%) | ស្រី: {statB.girlsCount} ន ({statB.girlsPct}%)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-blue-200/40 pb-0.5">និទ្ទេស C (ល្អ) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statC.count} ន ({statC.pct}%) | ស្រី: {statC.girlsCount} ន ({statC.girlsPct}%)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-amber-200/40 pb-0.5">និទ្ទេស D (ល្អបង្គួរ) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statD.count} ន ({statD.pct}%) | ស្រី: {statD.girlsCount} ន ({statD.girlsPct}%)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-orange-200/40 pb-0.5">និទ្ទេស E (មធ្យម) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statE.count} ន ({statE.pct}%) | ស្រី: {statE.girlsCount} ន ({statE.girlsPct}%)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-900 border-b border-rose-200/40 pb-0.5">និទ្ទេស F (ខ្សោយ) ៖</p>
                <p className="font-mono text-xs text-blue-900">
                  {statF.count} ន ({statF.pct}%) | ស្រី: {statF.girlsCount} ន ({statF.girlsPct}%)
                </p>
              </div>
            </div>

            {/* Final descriptive paragraph block ending line */}
            <div className="pt-2.5 border-t border-dashed border-slate-300 text-center text-[10.5px] font-bold text-slate-800">
              បញ្ឈប់បញ្ជីត្រឹមកម្រិតលេខរៀងទី <span className="font-mono text-blue-900 text-xs px-1 bg-blue-50 border border-blue-100 rounded">{totalStudents}</span> ដោយមានសិស្សស្រី <span className="font-mono text-red-650 text-xs px-1 bg-red-50 border border-red-100 rounded">{femaleStudentsCount}</span> នាក់ ត្រង់ឈ្មោះ <span className="underline decoration-dotted underline-offset-4 text-emerald-850 px-1 font-semibold">{lastHonoredName}</span>។
            </div>
          </div>
        )}

        {/* Official Approval Signatures section */}
        <div className="mt-10 grid grid-cols-2 text-center text-[11px] text-slate-700 pt-4 relative">
          <div>
            <p>បានឃើញ និងឯកភាព</p>
            <p className="font-moul text-[9px] pt-1 leading-normal">នាយក/នាយិកា</p>
            <div className="h-16"></div>
            <p>................................................</p>
          </div>
          <div>
            {/* Khmer Dynamic Lunar Calendar Date line */}
            <p className="italic text-slate-650 font-bold text-[10px]">
              {getKhmerLunarCalendarDate(selectedMonth, academicYear)}
            </p>
            <p className="text-slate-600 font-semibold py-0.5">
              ធ្វើនៅ {madeInLoc} ថ្ងៃទី{toKhmerDigits(new Date().getDate())} ខែ {selectedMonth} ឆ្នាំ {toKhmerDigits(new Date().getFullYear())}
            </p>
            <p className="font-moul text-[9px] pt-1.5 leading-normal">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-950 text-[13px]">{teacherName || '................................'}</p>
          </div>
        </div>
      </div>

      {/* Classroom stats summary chart visual/bars - in no-print of block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        {/* Left Card: Average score per Subject */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="font-bold text-slate-800 text-sm mb-4">មធ្យមភាគពិន្ទុតាមមុខវិជ្ជានីមួយៗ</h4>
          <div className="space-y-3">
            {subjectStats.map(({ subject, average }) => {
              const pct = (average / subject.maxScore) * 100;
              return (
                <div key={subject.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate max-w-[180px]" title={subject.name}>{subject.name}</span>
                    <span className="font-mono font-bold text-slate-850">{average} / {subject.maxScore}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        average >= 8.0 ? 'bg-emerald-500' : average >= 6.0 ? 'bg-blue-500' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Dynamic Grading Distributions and instructions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-4">មាត្រដ្ឋាននៃការវាយតម្លៃលទ្ធផលការសិក្សា (និទ្ទេស)</h4>
            <div className="space-y-2 text-xs text-slate-750">
              <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-800">
                <span className="font-bold">A - ល្អប្រសើរ (Excellent)</span>
                <span className="font-mono font-bold">&gt;= ៩.០០</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-blue-50 border border-blue-100 text-blue-800">
                <span className="font-bold">B - ល្អណាស់ (Very Good)</span>
                <span className="font-mono font-bold">&gt;= ៨.០០</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-sky-50 border border-sky-100 text-sky-800 font-semibold">
                <span className="font-bold">C - ល្អ (Good)</span>
                <span className="font-mono font-bold">&gt;= ៧.០០</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-amber-50 border border-amber-100 text-amber-800">
                <span className="font-bold">D - ល្អបង្គួរ (Fair)</span>
                <span className="font-mono font-bold">&gt;= ៦.០០</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-orange-50 border border-orange-100 text-orange-850">
                <span className="font-bold">E - មធ្យម (Medium)</span>
                <span className="font-mono font-bold">&gt;= ៥.០០</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-rose-50 border border-rose-100 text-rose-850">
                <span className="font-bold">F - ខ្សោយ (Poor)</span>
                <span className="font-mono font-bold">&lt; ៥.០០</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded text-xs leading-relaxed text-slate-500">
            <h5 className="font-bold text-slate-600 mb-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
              <span>ការណែនាំសម្រាប់ការបោះពុម្ព៖</span>
            </h5>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>ជ្រើសរើសជម្រើស <strong>Save as PDF</strong> ឬជ្រើសរើសម៉ាស៊ីនបោះពុម្ព។</li>
              <li>នៅក្នុងការកំណត់កម្រិតខ្ពស់ (More Settings) សូមបើក <strong>Background Graphics</strong> ដើម្បីបង្ហាញពណ៌ប្លង់កាតបោះពុម្ពឱ្យស្អាតបំផុត។</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
