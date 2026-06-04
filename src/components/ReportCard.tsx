import React, { useState } from 'react';
import { Student, Subject, MonthScore } from '../types';
import { computeMonthlyResults } from '../utils/calculations';
import { Printer, BookOpen, Star, UserCheck, Shield, ClipboardList, PenTool } from 'lucide-react';

interface ReportCardProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
  onUpdateScores: (studentId: string, scores: Record<string, number>, comments?: string) => void;
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
}: ReportCardProps) {
  const results = computeMonthlyResults(students, subjects, monthScores);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ''
  );

  const [commentInput, setCommentInput] = useState('');

  // Find active student data
  const activeStudentResult = results.find((res) => res.student.id === selectedStudentId);
  const activeStudentScores = activeStudentResult?.scores || {};
  const activeScoreEntry = monthScores.find((e) => e.studentId === selectedStudentId);

  // Sync state if student changes
  React.useEffect(() => {
    if (activeScoreEntry) {
      setCommentInput(activeScoreEntry.comments || '');
    } else {
      setCommentInput('');
    }
  }, [selectedStudentId, activeScoreEntry]);

  const handleSaveComment = () => {
    if (!selectedStudentId) return;
    onUpdateScores(selectedStudentId, activeStudentScores, commentInput);
    alert('រក្សាទុកការសង្កេតរបស់គ្រូបង្រៀនដោយជោគជ័យ!');
  };

  const printReportCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Selector layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-xs border border-slate-150 gap-4 no-print">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">ជ្រើសរើសសិស្ស៖</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer min-w-[150px]"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameKh} ({s.gender})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={printReportCard}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>បោះពុម្ពសៀវភៅតាមដានសិស្សនេះ (Print A4)</span>
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400 font-medium">
          មិនមានព័ត៌មាននៅក្នុងប្រព័ន្ធឡើយ។ សូមចុះឈ្មោះសិស្ស។
        </div>
      ) : activeStudentResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Report Summary & Remarks (Interactive controls in no-print) */}
          <div className="lg:col-span-1 space-y-4 no-print">
            {/* Student metadata widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-center">
              <div className="h-16 w-16 bg-blue-50 text-blue-700 border border-blue-100 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {activeStudentResult.student.nameEn ? activeStudentResult.student.nameEn.substring(0, 2) : 'ST'}
              </div>
              <h4 className="font-bold text-slate-800 text-base">{activeStudentResult.student.nameKh}</h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide my-1">
                {activeStudentResult.student.nameEn}
              </p>
              <div className="flex justify-center gap-1.5 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                  {activeStudentResult.student.gender}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full font-medium border border-slate-100">
                  {activeStudentResult.student.conduct}
                </span>
              </div>
            </div>

            {/* Teacher monthly observations comment form */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <PenTool className="h-4 w-4 text-blue-700 shrink-0" />
                <span>សរសេរសេចក្ដីសង្កេតរបស់គ្រូ</span>
              </h5>
              <textarea
                rows={4}
                placeholder="សរសេរដំបូន្មាន សេចក្ដីសង្កេតរបស់លោកគ្រូ/អ្នកគ្រូប្រចាំខែសម្រាប់សិស្សម្នាក់នេះ..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 leading-relaxed"
              />
              <button
                onClick={handleSaveComment}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                រក្សាទុកការវាយតម្លៃខ្ពស់
              </button>
            </div>
          </div>

          {/* Right Column: Beautiful printable Transcript Design (សៀវភៅតាមដានការសិក្សា) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-300 p-6 shadow-md rounded-2xl print-area">
              
              {/* Report Header Logo & Title */}
              <div className="pb-5 border-b border-dashed border-slate-250 flex flex-col items-center justify-center text-center space-y-1.5">
                <h3 className="font-moul text-[11px] text-slate-850 tracking-wide uppercase">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                <h4 className="font-moul text-[9px] text-slate-700 tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                <div className="w-12 h-[1px] bg-slate-300"></div>
                <h2 className="font-moul text-sm text-brand-blue pt-2 tracking-wide">សៀវភៅតាមដានការសិក្សាប្រចាំខែ (STUDENT TRANSCIPT)</h2>
                <span className="text-[10px] px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 rounded font-bold uppercase">
                  របាយការណ៍សិក្សាប្រចាំខែ៖ {selectedMonth}
                </span>
              </div>

              {/* Identity grid details section */}
              <div className="mt-5 bg-slate-50/75 border border-slate-200 p-4 rounded-xl grid grid-cols-2 gap-y-3.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block font-semibold">ឈ្មោះសិស្ស (Khmer):</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{activeStudentResult.student.nameKh}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">ឡាតាំង En:</span>
                  <span className="font-mono font-bold text-slate-600 block text-xs mt-0.5 uppercase tracking-wider">
                    {activeStudentResult.student.nameEn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">ថ្ងៃកំណើត:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{activeStudentResult.student.dob || '................'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">ភេទ:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{activeStudentResult.student.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">ថ្នាក់៖</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{className}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">ឆ្នាំសិក្សា៖</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{academicYear}</span>
                </div>
              </div>

              {/* Progress of Subjects and Raw data */}
              <div className="mt-6 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1 bg-slate-100/50 p-2 rounded">
                  <ClipboardList className="h-4 w-4 text-blue-800 shrink-0" />
                  <span>ពិន្ទុវិទ្យាសាស្ត្រ និងសាខាមុខវិជ្ជានានា</span>
                </h4>

                <div className="space-y-3 pt-1">
                  {subjects.map((subj) => {
                    const score = activeStudentScores[subj.id];
                    const val = typeof score === 'number' ? score : 0;
                    const pct = (val / subj.maxScore) * 100;
                    return (
                      <div key={subj.id} className="grid grid-cols-12 items-center gap-4 text-xs">
                        <span className="col-span-4 font-semibold text-slate-800 truncate" title={subj.name}>
                          {subj.name}
                        </span>
                        
                        {/* Interactive custom bar rendering */}
                        <div className="col-span-6">
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-150">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                val >= 8 ? 'bg-emerald-500' : val >= 5 ? 'bg-blue-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Text representation */}
                        <span className="col-span-2 text-right font-mono font-bold text-slate-900">
                          {val} / {subj.maxScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual calculations Summary details */}
              <div className="mt-6 border-t border-slate-200/80 pt-5 grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ពិន្ទុសរុប</span>
                  <span className="text-base font-bold font-mono text-slate-800">{activeStudentResult.total}</span>
                </div>
                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-blue-600 font-bold block uppercase">មធ្យមភាគ</span>
                  <span className="text-base font-bold font-mono text-blue-800">{activeStudentResult.average}</span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">ចំណាត់ថ្នាក់</span>
                  <span className="text-base font-bold text-amber-800">លេខ {activeStudentResult.rank} <sup>/ {students.length}</sup></span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">វិន័យ និងសីលធម៌</span>
                  <span>វាយតម្លៃ៖ <strong className="font-bold text-slate-800">{activeStudentResult.student.conduct}</strong></span>
                </div>
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-slate-700">
                  <span className="text-[10px] text-purple-700 font-bold block uppercase mb-1">និទ្ទេសលទ្ធផល</span>
                  <span className="font-semibold text-purple-800 capitalize">{activeStudentResult.grade}</span>
                </div>
              </div>

              {/* Teacher Remarks block on the card */}
              <div className="mt-4 p-3 bg-stone-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">សេចក្ដីសង្កេត និងការវាយតម្លៃប្រចាំខែរបស់គ្រូ៖</span>
                <p className="text-slate-700 italic font-medium leading-relaxed">
                  " {activeScoreEntry?.comments || 'ខិតខំរៀនសូត្រ ស្តាប់ការពន្យល់ល្អ និងមានវិន័យរឹងមាំ។' } "
                </p>
              </div>

              {/* Signature block section */}
              <div className="mt-12 grid grid-cols-3 text-[10px] text-slate-650 text-center gap-2 pt-6 border-t border-slate-200/40">
                <div>
                  <p>បានឃើញ និងឯកភាព</p>
                  <p className="font-moul text-[8px] pt-1 leading-relaxed">នាយកសាលា</p>
                  <div className="h-12"></div>
                  <p>....................................</p>
                </div>
                <div>
                  <p>មតិយោបល់/ហត្ថលេខា</p>
                  <p className="font-semibold pt-1">អាណាព្យាបាលសិស្ស</p>
                  <div className="h-12"></div>
                  <p>....................................</p>
                </div>
                <div>
                  <p className="italic">ថ្ងៃទី ........ ខែ .............. ឆ្នាំ ២០២...</p>
                  <p className="font-moul text-[8px] pt-1 leading-relaxed">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-12"></div>
                  <p className="font-bold text-slate-800">{teacherName || '................................'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
