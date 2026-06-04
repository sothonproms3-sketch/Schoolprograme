import React from 'react';
import { Student, Subject, MonthScore } from '../types';
import { computeMonthlyResults } from '../utils/calculations';
import { Printer, Trophy, Award, TrendingUp, Users, CheckCircle2, AlertCircle, FileSpreadsheet, FileDown, FileText } from 'lucide-react';

interface MonthlyRankingProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
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

  const exportToCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    // Header row
    const headers = ["ចំណាត់ថ្នាក់", "ឈ្មោះសិស្ស (ខ្មែរ)", "ឈ្មោះសិស្ស (ឡាតាំង)", "ភេទ"];
    subjects.forEach(subj => {
      headers.push(`${subj.name} (ពិន្ទុអតិបរមា ${subj.maxScore})`);
    });
    headers.push("ពិន្ទុសរុប", "មធ្យមភាគ", "និទ្ទេស");
    
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";
    
    // Data rows
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
      <div style="text-align: center;">
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">ព្រះរាជាណាចក្រកម្ពុជា</p>
        <p style="margin: 3px 0 0 0; font-weight: bold; font-size: 9pt;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
        <p style="margin: 0; font-size: 10pt;">******</p>
      </div>
      
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
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 10pt;">នាយកសាលា</p>
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

  return (
    <div className="space-y-6">
      {/* Action Header bar with Print & Export options */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-2xl shadow-xs border border-slate-200 gap-4 no-print">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">ការគ្រប់គ្រងការនាំចេញ និងបោះពុម្ព</h3>
          <p className="text-xs text-slate-400">
            នាំចេញទិន្នន័យចំណាត់ថ្នាក់សិស្សប្រចាំខែទៅជាទម្រង់ផ្សេងៗ សម្រាប់តម្រូវការរដ្ឋបាល និងអប់រំ។
          </p>
        </div>
        
        {/* Export Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print/PDF */}
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>បោះពុម្ព (PDF / Print)</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
            title="ទាញយកជាឯកសារ Excel (.xls) ដែលមានទម្រង់ស្អាតស្រាប់"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>នាំចេញជា Excel</span>
          </button>

          {/* Word Export */}
          <button
            onClick={exportToWord}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
            title="ទាញយកជាឯកសារ MS Word (.word) ផ្លូវការ"
          >
            <FileText className="h-4 w-4" />
            <span>នាំចេញជា Word</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-650 hover:bg-slate-700 text-slate-100 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
            title="ទាញយកជាឯកសារ CSV ងាយស្រួលបើកក្នុងកម្មវិធីផ្សេងៗ"
          >
            <FileDown className="h-4 w-4" />
            <span>នាំចេញជា CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Total students */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">សិស្សសរុប</span>
            <span className="text-lg font-bold text-slate-800">{totalStudents} នាក់ (ស្រី {femaleStudentsCount})</span>
          </div>
        </div>

        {/* Class Average */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">មធ្យមភាគថ្នាក់</span>
            <span className="text-lg font-bold text-emerald-700">{classAverage} / 10</span>
          </div>
        </div>

        {/* Top/Highest rank score */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ពិន្ទុខ្ពស់បំផុត</span>
            <span className="text-lg font-bold text-amber-700">{highestAverage} / 10</span>
          </div>
        </div>

        {/* Pass rate percentages */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">អត្រាជាប់មធ្យមភាគ</span>
            <span className="text-lg font-bold text-purple-700">{passRate}% (&gt;= 5.0)</span>
          </div>
        </div>
      </div>

      {/* Main Print Layout section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print-area">
        {/* Official Header for Print */}
        <div className="text-center space-y-1.5 pb-6 border-b border-dashed border-slate-200">
          <h2 className="font-moul text-base text-slate-900 tracking-wide uppercase">ព្រះរាជាណាចក្រកម្ពុជា</h2>
          <h3 className="font-moul text-[11px] text-slate-800 tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
          <div className="flex justify-center py-1">
            <div className="w-16 h-[1px] bg-slate-400"></div>
          </div>
          <h1 className="font-moul text-lg text-brand-blue pt-2 tracking-wide">តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ{selectedMonth}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-500 font-medium pt-1.5">
            <span>ថ្នាក់៖ <strong className="text-slate-800 font-bold">{className || '...'}</strong></span>
            <span>ឆ្នាំសិក្សា៖ <strong className="text-slate-800 font-bold">{academicYear || '...'}</strong></span>
            <span>គ្រូបង្រៀន៖ <strong className="text-slate-800 font-bold">{teacherName || '...'}</strong></span>
          </div>
        </div>

        {/* Scoring list tables */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs text-slate-800">
            <thead>
              <tr className="bg-slate-50 text-slate-800 text-center font-semibold border-b border-slate-300">
                <th className="py-2.5 px-2 border-r border-slate-300 w-[50px]">ចំណាត់ថ្នាក់</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[150px]">ឈ្មោះសិស្ស</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[110px] font-mono">Student Name</th>
                <th className="py-2.5 px-1.5 border-r border-slate-300 w-[50px]">ភេទ</th>
                {subjects.map(subj => (
                  <th key={subj.id} className="py-2 px-1 border-r border-slate-250 w-[54px] truncate text-[10px]" title={subj.name}>
                    {subj.name.split(' ')[0]}
                  </th>
                ))}
                <th className="py-2.5 px-2 border-r border-slate-300 w-[60px] bg-slate-100/50 font-bold">ពិន្ទុសរុប</th>
                <th className="py-2.5 px-2 border-r border-slate-300 w-[60px] bg-blue-50/50 font-bold text-blue-800">មធ្យមភាគ</th>
                <th className="py-2.5 px-2 w-[80px] bg-slate-50 font-bold">និទ្ទេស (Grade)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 7} className="py-8 text-center text-slate-400">
                    មិនមានទិន្នន័យដើម្បីបង្ហាញចំណាត់ថ្នាក់ឡើយ។
                  </td>
                </tr>
              ) : (
                results.map((res) => {
                  const isTop3 = res.rank <= 3;
                  const isFailed = res.average < 5.0;
                  return (
                    <tr
                      key={res.student.id}
                      className={`text-center transition-colors ${
                        isTop3 ? 'bg-amber-50/30' : res.rank % 2 === 0 ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-2.5 px-1.5 border-r border-slate-300 font-bold text-sm">
                        {isTop3 ? (
                          <span className="inline-flex items-center justify-center gap-1">
                            <span className={`h-5 w-5 rounded-full text-xs text-white font-bold flex items-center justify-center ${
                              res.rank === 1 ? 'bg-amber-500' : res.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                            }`}>
                              {res.rank}
                            </span>
                          </span>
                        ) : (
                          <span>{res.rank}</span>
                        )}
                      </td>

                      {/* Khmer name */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-left font-semibold text-slate-900">
                        {res.student.nameKh}
                      </td>

                      {/* Latin name */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-left font-mono text-slate-500 tracking-wide text-[11px] uppercase">
                        {res.student.nameEn}
                      </td>

                      {/* Gender */}
                      <td className="py-2.5 px-1.5 border-r border-slate-300 font-medium">
                        {res.student.gender}
                      </td>

                      {/* Individual cell values */}
                      {subjects.map((subj) => {
                        const score = res.scores[subj.id];
                        const isNoScore = score === undefined;
                        return (
                          <td
                            key={subj.id}
                            className={`py-2 px-1 border-r border-slate-200 font-mono text-xs ${
                              score < 5 ? 'text-rose-600 font-bold bg-rose-50/30' : ''
                            }`}
                          >
                            {!isNoScore ? score : '-'}
                          </td>
                        );
                      })}

                      {/* Total Score Column */}
                      <td className="py-2.5 px-1.5 border-r border-slate-300 font-bold font-mono bg-slate-100/20">
                        {res.total}
                      </td>

                      {/* Average Score Column */}
                      <td className={`py-2.5 px-1.5 border-r border-slate-300 font-bold font-mono text-sm ${
                        isFailed ? 'text-rose-600' : 'text-blue-800 bg-blue-50/20'
                      }`}>
                        {res.average}
                      </td>

                      {/* Grade Description */}
                      <td className="py-2.5 px-1.5 font-semibold text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded-md border font-sans ${
                          res.gradeLetter === 'A' || res.gradeLetter === 'B'
                            ? 'text-emerald-700 bg-emerald-50/60 border-emerald-100'
                            : isFailed
                            ? 'text-rose-700 bg-rose-50/40 border-rose-100'
                            : 'text-slate-600 bg-slate-50 border-slate-100'
                        }`}>
                          {res.gradeLetter} ({res.grade.split(' ')[0]})
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Certificate Signatures block for printing */}
        <div className="mt-12 grid grid-cols-2 text-center text-xs text-slate-700 pt-6 border-t border-slate-200/40">
          <div>
            <p>បានឃើញ និងឯកភាព</p>
            <p className="font-moul text-[9px] pt-1 leading-relaxed">នាយកសាលា</p>
            <div className="h-16"></div>
          </div>
          <div>
            <p className="italic">ថ្ងៃទី ........ ខែ ................ ឆ្នាំ ២០២...</p>
            <p className="font-moul text-[9px] pt-1 leading-relaxed">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">{teacherName || '................................'}</p>
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
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                <span className="font-bold">និទ្ទេស A - ល្អប្រសើរ (Excellent)</span>
                <span className="font-mono font-bold">&gt;= ៩.០០</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800">
                <span className="font-bold">និទ្ទេស B - ល្អណាស់ (Very Good)</span>
                <span className="font-mono font-bold">&gt;= ៨.០០</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/60 border border-sky-100 text-sky-800">
                <span className="font-bold">និទ្ទេស C - ល្អ (Good)</span>
                <span className="font-mono font-bold">&gt;= ៧.០០</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-amber-800">
                <span className="font-bold">និទ្ទេស D - ល្អបង្គួរ (Fair)</span>
                <span className="font-mono font-bold">&gt;= ៦.០០</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/60 border border-orange-100 text-orange-850">
                <span className="font-bold">និទ្ទេស E - មធ្យម (Medium)</span>
                <span className="font-mono font-bold">&gt;= ៥.០០</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100 text-rose-850">
                <span className="font-bold">និទ្ទេស F - ខ្សោយ (Poor)</span>
                <span className="font-mono font-bold">&lt; ៥.០០</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg text-xs leading-relaxed text-slate-500">
            <h5 className="font-bold text-slate-600 mb-1.5 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
              <span>ការណែនាំសម្រាប់ការបោះពុម្ព៖</span>
            </h5>
            <ol className="list-decimal pl-4 space-y-1">
              <li>ចុចប៊ូតុង <strong>បោះពុម្ពតារាងចំណាត់ថ្នាក់</strong> ខាងលើ។</li>
              <li>ជ្រើសរើសជម្រើស <strong>Save as PDF</strong> ឬជ្រើសរើសម៉ាស៊ីនបោះពុម្ព។</li>
              <li>នៅក្នុងការកំណត់កម្រិតខ្ពស់ (More Settings) សូមបើក <strong>Background Graphics</strong> ដើម្បីរក្សាពណ៌ប្លង់កាតបោះពុម្ពឱ្យស្អាតបំផុត។</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
