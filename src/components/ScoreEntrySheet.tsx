import React, { useState } from 'react';
import { Student, Subject, MonthScore } from '../types';
import { Pencil, Sparkles, BookOpen, ChevronRight, Settings, Plus, Trash2, CheckCircle2 } from 'lucide-react';

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
}: ScoreEntrySheetProps) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formScores, setFormScores] = useState<Record<string, string>>({});
  const [formComment, setFormComment] = useState('');
  
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjMax, setNewSubjMax] = useState(10);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-xs border border-slate-100 gap-4 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រងពិន្ទុរបស់សិស្ស</h3>
          <p className="text-xs text-slate-400 mt-1">
            សូមកំណត់ពិន្ទុរបស់សិស្សម្នាក់ៗ។ ពិន្ទុរៀបចំទម្រង់ស្រង់ប្រចាំខែដោយស្វ័យប្រវត្ត។
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
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
              <span>បន្ថែមពិន្ទុគំរូស្វ័យប្រវត្តិ (Demo)</span>
            </button>
            <button
              onClick={onClearScores}
              className="flex items-center gap-1.5 py-2 px-3 bg-rose-50 border border-rose-100 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Trash2 className="h-4 w-4 text-rose-700" />
              <span>សម្អាតពិន្ទុទាំងអស់</span>
            </button>
          </div>
        )}
      </div>

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
    </div>
  );
}
