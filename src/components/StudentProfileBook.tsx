import React, { useState } from 'react';
import { Student, Gender } from '../types';
import { UserPlus, Search, Edit2, Trash2, ShieldCheck, UserCheck, Calendar, Phone, MapPin, Notebook, Plus, X, FileSpreadsheet } from 'lucide-react';

interface StudentProfileBookProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'avatar'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
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
}: StudentProfileBookProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

  const filteredStudents = students.filter(
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
          {/* Export button */}
          <button
            onClick={exportStudentsList}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm border border-slate-200 h-[38px]"
            title="ទាញយកបញ្ជីសិស្សទាំងអស់ជាឯកសារ Excel/CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>នាំចេញបញ្ជីសិស្ស</span>
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
                      <div
                        className={`h-11 w-11 rounded-full font-bold flex items-center justify-center text-sm uppercase shrink-0 border ${colorClass}`}
                      >
                        {student.nameEn ? student.nameEn.substring(0, 2) : 'ST'}
                      </div>
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
                  <div className="h-20 w-20 rounded-full font-bold flex items-center justify-center text-2xl uppercase border border-blue-200 bg-blue-50 text-blue-700 mx-auto mb-2">
                    {selectedStudent.nameEn ? selectedStudent.nameEn.substring(0, 2) : 'ST'}
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
    </div>
  );
}
