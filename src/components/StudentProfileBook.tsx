import React, { useState } from 'react';
import { Student, Gender } from '../types';
import { UserPlus, Search, Edit2, Trash2, ShieldCheck, UserCheck, Calendar, Phone, MapPin, Notebook, Plus, X, FileSpreadsheet, Printer, Camera, FileText } from 'lucide-react';

interface StudentProfileBookProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'avatar'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  className?: string;
  teacherName?: string;
  academicYear?: string;
}

const CONDUCT_OPTIONS = ['ល្អណាស់', 'ល្អ', 'មធ្យម', 'ខ្សោយ'];
const GENDER_OPTIONS: Gender[] = ['ប្រុស', 'ស្រី'];

const BACKGROUNDS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

export default function StudentProfileBook({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  className = '',
  teacherName = '',
  academicYear = '',
}: StudentProfileBookProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const toKhmerDigits = (val: number | string) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(val).split('').map(char => {
      const idx = parseInt(char);
      return isNaN(idx) ? char : khmerDigits[idx];
    }).join('');
  };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [gender, setGender] = useState<Gender>('ប្រុស');
  const [dob, setDob] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [conduct, setConduct] = useState('ល្អណាស់');
  const [remarks, setRemarks] = useState('');

  // Customizable Administrative Header Tags for MoEYS standard print registry
  const [ministryLabel, setMinistryLabel] = useState('ក្រសួងអប់រំ យុវជន និងកីឡា');
  const [provincialLabel, setProvincialLabel] = useState('មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង');
  const [districtLabel, setDistrictLabel] = useState('ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកសង្កែ');
  const [schoolLabel, setSchoolLabel] = useState('សាលាបឋមសិក្សាវត្តចចង');

  const openAddForm = () => {
    setIsEditing(false);
    setNameKh('');
    setNameEn('');
    setGender('ប្រុស');
    setDob('2015-01-01');
    setBirthPlace('');
    setFatherName('');
    setMotherName('');
    setPhone('');
    setAddress('');
    setConduct('ល្អណាស់');
    setRemarks('');
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setIsEditing(true);
    setSelectedStudent(student);
    setNameKh(student.nameKh);
    setNameEn(student.nameEn);
    setGender(student.gender);
    setDob(student.dob);
    setBirthPlace(student.birthPlace);
    setFatherName(student.fatherName);
    setMotherName(student.motherName);
    setPhone(student.phone);
    setAddress(student.address);
    setConduct(student.conduct);
    setRemarks(student.remarks);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKh || !nameEn) {
      alert('សូមបំពេញឈ្មោះសិស្សទាំងអក្សរខ្មែរ និងឡាតាំង!');
      return;
    }

    if (isEditing && selectedStudent) {
      onUpdateStudent({
        ...selectedStudent,
        nameKh,
        nameEn,
        gender,
        dob,
        birthPlace,
        fatherName,
        motherName,
        phone,
        address,
        conduct,
        remarks,
      });
    } else {
      onAddStudent({
        nameKh,
        nameEn,
        gender,
        dob,
        birthPlace,
        fatherName,
        motherName,
        phone,
        address,
        conduct,
        remarks,
      });
    }
    setIsFormOpen(false);
    setSelectedStudent(null);
  };

  const sortedStudents = [...students].sort((a, b) => a.nameEn.localeCompare(b.nameEn, 'en', { sensitivity: 'base' }));

  const filteredStudents = sortedStudents.filter(
    (s) =>
      s.nameKh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

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
    
    sortedStudents.forEach((student, index) => {
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

  const exportToExcel = () => {
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>បញ្ជីឈ្មោះសិស្ស</x:Name>
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
          .gender-female { color: #db2777; }
          .gender-male { color: #1d4ed8; }
          .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #1e3a8a; }
          .meta-info { margin-bottom: 15px; font-size: 13px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">បញ្ជីឈ្មោះសិស្ស (សៀវភៅសិក្ខាគារិក)</div>
        <div class="meta-info">
          <strong>ថ្នាក់សិក្សា៖</strong> ${className} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>ឆ្នាំសិក្សា៖</strong> ${academicYear} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>គ្រូទទួលបន្ទុក៖</strong> ${teacherName}
        </div>
        <table>
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>ឈ្មោះភាសាខ្មែរ</th>
              <th>ឈ្មោះឡាតាំង</th>
              <th>ភេទ</th>
              <th>ថ្ងៃខែឆ្នាំកំណើត</th>
              <th>ទីកន្លែងកំណើត</th>
              <th>ឈ្មោះឪពុក</th>
              <th>ឈ្មោះម្តាយ</th>
              <th>លេខទូរស័ព្ទ</th>
              <th>អាសយដ្ឋានបច្ចុប្បន្ន</th>
              <th>សីលធម៌</th>
            </tr>
          </thead>
          <tbody>
            ${sortedStudents.map((student, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><b>${student.nameKh}</b></td>
                <td style="text-transform: uppercase;">${student.nameEn}</td>
                <td style="text-align: center;" class="${student.gender === 'ស្រី' ? 'gender-female' : 'gender-male'}">${student.gender}</td>
                <td style="text-align: center;">${student.dob || ''}</td>
                <td>${student.birthPlace || ''}</td>
                <td>${student.fatherName || ''}</td>
                <td>${student.motherName || ''}</td>
                <td style="mso-number-format:'\\@'; text-align: center;">${student.phone || ''}</td>
                <td>${student.address || ''}</td>
                <td style="text-align: center;">${student.conduct}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `បញ្ជីឈ្មោះសិស្ស_សៀវភៅសិក្ខាគារិក_${className.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const currentMonthKh = khmerMonths[new Date().getMonth()];

    const contentHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>បញ្ជីឈ្មោះសិស្ស</title>
        <style>
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            font-family: 'Khmer OS Battambang', 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
            font-size: 11pt;
            color: #333333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
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
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-top: 40px;
            margin-bottom: 20px;
            color: #1e3a8a;
          }
          .meta-info {
            margin-bottom: 20px;
            border-bottom: 2px double #1e3a8a;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            padding: 8px;
            border: 1px solid #cbd5e1;
            font-size: 10pt;
            text-align: center;
          }
          td {
            padding: 8px;
            border: 1px solid #cbd5e1;
            font-size: 9.5pt;
          }
          .text-center {
            text-align: center;
          }
          .gender-female {
            color: #db2777;
            font-weight: bold;
          }
          .signature-section {
            margin-top: 40px;
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
        <div>
          <div class="ministry">${ministryLabel}</div>
          <div class="country">ព្រះរាជាណាចក្រកម្ពុជា</div>
        </div>
        <div style="clear: both;"></div>
        <div>
          <div class="school">${provincialLabel}<br>${districtLabel}<br><b>សាលា៖ ${schoolLabel}</b></div>
          <div class="motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
        </div>
        
        <div style="clear: both; height: 20px;"></div>

        <div class="title">បញ្ជីឈ្មោះសិក្ខាគារិក (សៀវភៅសិក្ខាគារិក)</div>
        
        <div class="meta-info">
          <table style="width: 100%; border: none; margin-bottom: 10px;">
            <tr style="border: none;">
              <td style="border: none; padding: 0;"><b>ថ្នាក់រៀន / ក្រុម៖</b> ${className}</td>
              <td style="border: none; padding: 0; text-align: center;"><b>ឆ្នាំសិក្សា៖</b> ${academicYear}</td>
              <td style="border: none; padding: 0; text-align: right;"><b>គ្រូបន្ទុកថ្នាក់៖</b> ${teacherName}</td>
            </tr>
          </table>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">ល.រ</th>
              <th style="width: 20%;">ឈ្មោះភាសាខ្មែរ</th>
              <th style="width: 20%;">ឈ្មោះឡាតាំង</th>
              <th style="width: 8%;">ភេទ</th>
              <th style="width: 15%;">ថ្ងៃកំណើត</th>
              <th style="width: 15%;">លេខទូរស័ព្ទ</th>
              <th style="width: 10%;">សីលធម៌</th>
              <th style="width: 7%;">ចំណាំ</th>
            </tr>
          </thead>
          <tbody>
            ${sortedStudents.map((student, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td><b>${student.nameKh}</b></td>
                <td style="text-transform: uppercase;">${student.nameEn}</td>
                <td class="text-center ${student.gender === 'ស្រី' ? 'gender-female' : ''}">${student.gender}</td>
                <td class="text-center">${student.dob || ''}</td>
                <td class="text-center">${student.phone || ''}</td>
                <td class="text-center">${student.conduct}</td>
                <td>${student.remarks || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <table style="width: 100%; border: none;">
            <tr style="border: none;">
              <td style="border: none; width: 50%;"></td>
              <td style="border: none; width: 50%; text-align: center;">
                <p>ធ្វើនៅ ${schoolLabel}, ថ្ងៃទី ${toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ ${currentMonthKh} ឆ្នាំ ${toKhmerDigits(new Date().getFullYear())}</p>
                <p style="font-family: 'Khmer OS Muol Light'; font-size: 10pt; margin-top: 5px; font-weight: bold;">គ្រូបន្ទុកថ្នាក់</p>
                <div style="height: 60px;"></div>
                <p><b>${teacherName}</b></p>
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
    link.setAttribute("download", `បញ្ជីឈ្មោះសិស្ស_សៀវភៅសិក្ខាគារិក_${className.replace(/\s+/g, '_')}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printStudentRegistry = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Search and Add section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 no-print bg-white p-4 rounded-xl shadow-xs border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកសិស្ស (ឈ្មោះខ្មែរ ឡាតាំង ឬលេខទូរស័ព្ទ)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Print Registry button */}
          <button
            onClick={printStudentRegistry}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer text-sm h-[38px] shadow-xs"
            title="បោះពុម្ពសៀវភៅសិក្ខាគារិក (បញ្ជីឈ្មោះ និងប្រវត្តិរូបសង្ខេបសិស្សសរុប)"
          >
            <Printer className="h-4 w-4" />
            <span>បោះពុម្ពបញ្ជីសិស្ស</span>
          </button>

          {/* Export Excel button */}
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm h-[38px]"
            title="ទាញយកបញ្ជីសិស្សជាឯកសារ Excel (.xls)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>នាំចេញជា Excel</span>
          </button>

          {/* Export Word button */}
          <button
            onClick={exportToWord}
            className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-850 border border-blue-200 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm h-[38px]"
            title="ទាញយកបញ្ជីសិស្សជាឯកសារ Word (.doc)"
          >
            <FileText className="h-4 w-4 text-blue-700" />
            <span>នាំចេញជា Word</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm shadow-xs h-[38px]"
          >
            <UserPlus className="h-4 w-4" />
            <span>ចុះឈ្មោះសិស្សថ្មី</span>
          </button>
        </div>
      </div>

      {/* Customizable school metadata header inputs (no-print) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-slate-150 mb-6">
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

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Student Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 px-1">
            <Notebook className="h-5 w-5 text-blue-800" />
            <span>បញ្ជីឈ្មោះសិស្សសរុប (សៀវភៅសិក្ខាគារិក) ({filteredStudents.length} នាក់)</span>
          </h3>

          {filteredStudents.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
              <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">មិនមានទិន្នន័យសិស្សឡើយ។</p>
              <button
                onClick={openAddForm}
                className="mt-4 text-sm text-blue-700 font-semibold hover:underline"
              >
                + បន្ថែមសិស្សដំបូងរបស់អ្នក
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student, idx) => {
                const colorClass = BACKGROUNDS[idx % BACKGROUNDS.length];
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      selectedStudent?.id === student.id
                        ? 'border-blue-500 ring-2 ring-blue-500/10'
                        : 'border-slate-150 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar representation derived cleanly */}
                      {student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http')) ? (
                        <img
                          src={student.avatar}
                          alt="Student Profile"
                          className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className={`h-11 w-11 rounded-full font-bold flex items-center justify-center text-sm uppercase shrink-0 border ${colorClass}`}
                        >
                          {student.nameEn ? student.nameEn.substring(0, 2) : 'ST'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <h4 className="font-semibold text-slate-800 truncate text-base">
                            {student.nameKh}
                          </h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                              student.gender === 'ប្រុស'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-pink-50 text-pink-700'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono tracking-wide mt-0.5 uppercase">
                          {student.nameEn}
                        </p>
                        
                        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{student.dob || 'ពុំមាន'}</span>
                          </span>
                          {student.phone && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{student.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>សីលធម៌៖ <strong className="text-slate-700">{student.conduct}</strong></span>
                      </span>
                      <div className="flex items-center gap-2 no-print" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditForm(student)}
                          className="p-1 hover:bg-slate-100 rounded text-amber-600 transition-colors"
                          title="កែសម្រួលព័ត៌មាន"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                          title="លុបសិស្ស"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Profile View */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs sticky top-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="relative group mx-auto mb-2 w-20 h-20">
                    {selectedStudent.avatar && (selectedStudent.avatar.startsWith('data:') || selectedStudent.avatar.startsWith('http')) ? (
                      <img
                        src={selectedStudent.avatar}
                        alt="Student Profile"
                        className="h-20 w-20 rounded-full object-cover border border-slate-200 shadow-inner"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full font-bold flex items-center justify-center text-2xl uppercase border border-blue-200 bg-blue-50 text-blue-700 shadow-inner">
                        {selectedStudent.nameEn ? selectedStudent.nameEn.substring(0, 2) : 'ST'}
                      </div>
                    )}
                    
                    {/* Hover upload trigger */}
                    <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1 no-print">
                      <Camera className="h-3.5 w-3.5 mb-1 text-white" />
                      <span>ផ្ទុកឡើងរូបថត</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 2 * 1024 * 1024) {
                            alert("ទំហំរូបភាពធំពេក! សូមជ្រើសរើសរូបភាពក្រោម ២MB។");
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onUpdateStudent({
                              ...selectedStudent,
                              avatar: reader.result as string
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedStudent.nameKh}</h3>
                  <p className="text-xs text-slate-500 font-mono uppercase mt-0.5">{selectedStudent.nameEn}</p>
                  <span className="inline-block mt-2 text-xs px-2.5 py-0.5 bg-slate-100 rounded-full font-medium text-slate-600">
                    សិស្ស {selectedStudent.gender}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">ថ្ងៃ ខែ ឆ្នាំកំណើត</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {selectedStudent.dob || 'ពុំទាន់កំណត់'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">ទីកន្លែងកំណើត</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {selectedStudent.birthPlace || 'ពុំទាន់កំណត់'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block">ឈ្មោះឪពុក</span>
                      <span className="font-medium text-slate-705 block mt-0.5">{selectedStudent.fatherName || 'ពុំទាន់កំណត់'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">ឈ្មោះម្តាយ</span>
                      <span className="font-medium text-slate-705 block mt-0.5">{selectedStudent.motherName || 'ពុំទាន់កំណត់'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">លេខទូរស័ព្ទអាណាព្យាបាល</span>
                    <span className="font-medium text-slate-707 flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {selectedStudent.phone || 'ពុំទាន់កំណត់'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">អាសយដ្ឋានបច្ចុប្បន្ន</span>
                    <span className="font-medium text-slate-707 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {selectedStudent.address || 'ពុំទាន់កំណត់'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">វិន័យ/សីលធម៌</span>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg font-medium">
                      {selectedStudent.conduct}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">កំណត់សម្គាល់របស់គ្រូ</span>
                    <p className="text-slate-600 text-xs mt-1 bg-slate-50 p-2.5 rounded-lg leading-relaxed italic">
                      " {selectedStudent.remarks || 'មិនទាន់មានការវាយតម្លៃលម្អិត' } "
                    </p>
                  </div>
                </div>

                <div className="pt-2 no-print">
                  <button
                    onClick={() => openEditForm(selectedStudent)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>កែសម្រួលព័ត៌មានលម្អិត</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-700 text-sm">មិនទាន់ជ្រើសរើសសិស្ស</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  សូមចុចលើកាតសិស្សណាម្នាក់ចំហៀងខាងឆ្វេង ដើម្បីមើលប្រវត្តិរូបសង្ខេបលម្អិតរបស់សិស្សម្នាក់នោះនៅទីនេះ។
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Dialog/Modal Overlay for Adding & Editing */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditing ? 'កែសម្រួលប្រវត្តិរូបសិស្ស' : 'ចុះឈ្មោះសិស្សថ្មី'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Kh */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    ឈ្មោះជាភាសាខ្មែរ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. សុខ រតនា"
                    value={nameKh}
                    onChange={(e) => setNameKh(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Name En/Latin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    ឈ្មោះជាឡាតាំង (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. SOK ROTANA"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 font-mono uppercase"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ភេទ</label>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 text-sm font-medium border rounded-lg transition-all ${
                          gender === g
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ថ្ងៃខែឆ្នាំកំណើត</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Place of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ទីកន្លែងកំណើត</label>
                  <input
                    type="text"
                    placeholder="ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត/រាជធានី"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Parents names */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ឈ្មោះឪពុក</label>
                  <input
                    type="text"
                    placeholder="ឈ្មោះឪពុក"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ឈ្មោះម្តាយ</label>
                  <input
                    type="text"
                    placeholder="ឈ្មោះម្តាយ"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                  <input
                    type="text"
                    placeholder="ឧ. 012 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Conduct option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ការវាយតម្លៃសីលធម៌/វិន័យ</label>
                  <select
                    value={conduct}
                    onChange={(e) => setConduct(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-slate-700"
                  >
                    {CONDUCT_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                  <input
                    type="text"
                    placeholder="ផ្ទះលេខ ផ្លូវ ភូមិ..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>

                {/* Teacher remarks */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">កំណត់សម្គាល់បន្ថែមពីប្រវត្តិសិក្សា</label>
                  <textarea
                    rows={3}
                    placeholder="សរសេរការយល់ឃើញរបស់លោកគ្រូ/អ្នកគ្រូ..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors cursor-pointer text-sm font-semibold shadow-xs"
                >
                  {isEditing ? 'រក្សាទុកការកែប្រែ' : 'យល់ព្រមចុះឈ្មោះ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Registry Book - HIDDEN ON SCREEN, SHOWN ON PRINT */}
      <div className="hidden print:block print-area">
        {/* Official Header */}
        <div className="grid grid-cols-3 items-start pb-5 border-b border-double border-slate-350 mb-6">
          <div className="text-left space-y-1">
            <h3 className="font-moul text-[10px] text-slate-800 leading-normal">{ministryLabel}</h3>
            <h4 className="font-moul text-[8.5px] text-slate-700 leading-normal pl-1.5">{provincialLabel}</h4>
            <p className="text-[9.5px] font-semibold text-slate-700 pl-3 leading-normal">
              {districtLabel}
            </p>
            <p className="text-[10.5px] font-bold text-slate-900 pl-4 leading-normal mt-1">
              សាលា៖ <span className="underline decoration-dotted stroke-slate-400 underline-offset-4 font-bold text-[11px]">{schoolLabel}</span>
            </p>
          </div>
          
          <div className="text-center space-y-1 col-span-1">
            <h2 className="font-moul text-[12px] text-slate-900 leading-normal tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h2>
            <h3 className="font-moul text-[10px] text-slate-850 leading-normal tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
            <div className="flex justify-center py-0.5">
              <svg width="45" height="10" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 block">
                <path d="M2.5 5C5.5 1.5 8.5 1.5 11.5 5C14.5 8.5 17.5 8.5 20.5 5C23.5 1.5 26.5 1.5 29.5 5C32.5 8.5 35.5 8.5 38.5 5C41.5 1.5 43.5 3 44.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="text-right"></div>
        </div>

        {/* Title */}
        <div className="text-center pb-6">
          <h1 className="font-moul text-lg text-brand-blue tracking-wide uppercase">សៀវភៅសិក្ខាគារិក (បញ្ជីប្រវត្តិរូបសង្ខេបសិស្ស)</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-500 font-medium pt-2">
            <span>ថ្នាក់៖ <strong className="text-slate-800 font-bold">{className || '...'}</strong></span>
            <span>ឆ្នាំសិក្សា៖ <strong className="text-slate-800 font-bold">{academicYear || '...'}</strong></span>
            <span>គ្រូបង្រៀន៖ <strong className="text-slate-800 font-bold">{teacherName || '...'}</strong></span>
            <span>សិស្សសរុប៖ <strong className="text-slate-800 font-bold">{students.length} នាក់</strong></span>
          </div>
        </div>

        {/* Table of profiles */}
        <table className="w-full text-left border-collapse border border-slate-400 text-xs text-slate-800">
          <thead>
            <tr className="bg-slate-50 text-slate-800 text-center font-bold border-b border-slate-400">
              <th className="py-2 px-1 border-r border-slate-400 w-[45px]">ល.រ</th>
              <th className="py-2 px-2 border-r border-slate-400 text-left min-w-[120px]">ឈ្មោះភាសាខ្មែរ</th>
              <th className="py-2 px-2 border-r border-slate-400 text-left min-w-[100px] font-mono">Latin Name</th>
              <th className="py-2 px-1 border-r border-slate-400 w-[45px]">ភេទ</th>
              <th className="py-2 px-2 border-r border-slate-400 min-w-[90px]">ថ្ងៃខែឆ្នាំកំណើត</th>
              <th className="py-2 px-2 border-r border-slate-400 min-w-[130px] text-left">ទីកន្លែងកំណើត</th>
              <th className="py-2 px-2 border-r border-slate-400 text-left">អាណាព្យាបាល (ឪពុក-ម្តាយ)</th>
              <th className="py-2 px-2 border-r border-slate-400 text-left min-w-[85px]">លេខទូរស័ព្ទ</th>
              <th className="py-2 px-1 border-r border-slate-400 w-[60px]">សីលធម៌</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  មិនទាន់មានទិន្នន័យសិស្សឡើយ។
                </td>
              </tr>
            ) : (
              sortedStudents.map((student, idx) => (
                <tr key={student.id} className="text-center border-b border-slate-300">
                  <td className="py-2 px-1 border-r border-slate-300 font-mono font-bold">{idx + 1}</td>
                  <td className="py-2 px-2 border-r border-slate-300 text-left font-semibold text-slate-900">{student.nameKh}</td>
                  <td className="py-2 px-2 border-r border-slate-300 text-left font-mono uppercase text-[11px] text-slate-600">{student.nameEn}</td>
                  <td className="py-2 px-1 border-r border-slate-300">{student.gender}</td>
                  <td className="py-2 px-2 border-r border-slate-300 font-mono">{student.dob || '-'}</td>
                  <td className="py-2 px-2 border-r border-slate-300 text-left text-[11px] leading-snug">{student.birthPlace || '-'}</td>
                  <td className="py-2 px-2 border-r border-slate-300 text-left text-[11px] leading-snug">
                    {student.fatherName && <span>ឪពុក៖ {student.fatherName}</span>}
                    {student.fatherName && student.motherName && <br />}
                    {student.motherName && <span>ម្តាយ៖ {student.motherName}</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 font-mono text-left">{student.phone || '-'}</td>
                  <td className="py-2 px-1 border-r border-slate-300 font-semibold">{student.conduct}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Signature at bottom */}
        <div className="mt-12 grid grid-cols-2 text-center text-xs text-slate-705 pt-6">
          <div>
            <p className="font-semibold text-slate-500">បានឃើញ និងឯកភាព</p>
            <p className="font-moul text-[8.5px] pt-1 leading-relaxed">នាយកសាលា</p>
            <div className="h-16 flex items-center justify-center relative select-none">
              {/* Decorative stamp element behind */}
              <div className="absolute border border-dotted border-rose-500/10 rounded-full h-11 w-11 flex items-center justify-center rotate-12 -z-10 no-print">
                <span className="text-[7px] text-rose-500/15 font-bold uppercase truncate">GRADED</span>
              </div>
            </div>
            <p className="text-slate-400">................................................</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="italic font-bold text-[10px] text-amber-900 leading-normal">
              ថ្ងៃសុក្រ ៧កើត ខែមិគសិរ ឆ្នាំជូត ឯកស័ក {academicYear ? toKhmerDigits(academicYear) : '២០២៦'}
            </p>
            <p className="text-[10px] font-bold text-slate-800 leading-normal">
              ធ្វើនៅ {schoolLabel || 'សាលា'}, ថ្ងៃទី {toKhmerDigits(new Date().getDate().toString().padStart(2, '0'))} ខែ {["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][new Date().getMonth()]} ឆ្នាំ {toKhmerDigits(new Date().getFullYear())}
            </p>
            <p className="font-moul text-[8.5px] pt-2.5 leading-relaxed text-slate-805">គ្រូបន្ទុកថ្នាក់</p>
            <div className="h-16 flex items-center justify-center"></div>
            <p className="font-bold text-slate-900 text-sm border-b border-dashed border-slate-300 pb-0.5 min-w-[130px] font-mono tracking-wide">{teacherName || '................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
