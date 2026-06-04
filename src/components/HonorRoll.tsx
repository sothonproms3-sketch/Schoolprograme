import React, { useState } from 'react';
import { Student, Subject, MonthScore } from '../types';
import { computeMonthlyResults } from '../utils/calculations';
import { Trophy, Award, Stars, Printer, FileCheck, Check, Smile } from 'lucide-react';

interface HonorRollProps {
  students: Student[];
  subjects: Subject[];
  monthScores: MonthScore[];
  className: string;
  teacherName: string;
  academicYear: string;
  selectedMonth: string;
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
  
  // Slice top 5
  const top5 = results.slice(0, 5);

  const [activeCertIndex, setActiveCertIndex] = useState<number>(0);

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl shadow-xs border border-slate-150 gap-4 no-print">
        <div>
          <h3 className="text-base font-bold text-slate-800">តារាងកិត្តិយស និងប័ណ្ណសរសើរសិស្សឆ្នើមទាំង ៥ នាក់</h3>
          <p className="text-xs text-slate-400 mt-1">
            សិស្សដែលមានមធ្យមភាគខ្ពស់ជាងគេចំនួន ៥ នាក់ ត្រូវបានចាត់ចូលក្នុងតារាងកិត្តិយសប្រចាំខែនេះ។
          </p>
        </div>
        <button
          onClick={printCertificate}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>បោះពុម្ពប័ណ្ណសរសើរសិស្សនេះ (Print A4)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List of Top 5 students in Podium with gold/silver accents */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider block px-1 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>តារាងកិត្តិយស (Honor Roll - Top 5)</span>
          </h4>

          {top5.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
              មិនទាន់មានសិស្សនៅក្នុងតារាងកិត្តិយសនៅឡើយទេ។ សូមបំពេញពិន្ទុជាមុន។
            </div>
          ) : (
            <div className="space-y-3">
              {top5.map((res, index) => {
                const rank = index + 1;
                const isActive = activeCertIndex === index;
                
                // Color badges for ranking
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-white ${
                      isActive 
                        ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full font-bold flex items-center justify-center text-sm border shadow-xs ${rankColors}`}>
                        {rank}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-base">{res.student.nameKh}</h5>
                        <p className="text-[10px] text-slate-400 font-mono text-left uppercase tracking-wide">{res.student.nameEn}</p>
                        <span className="text-[11px] text-slate-500 block mt-1">{rankText}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">មធ្យមភាគ</span>
                      <span className="text-base font-bold font-mono text-blue-800">{res.average}</span>
                      <span className="block text-[10px] text-emerald-600 font-medium px-1.5 py-0.5 bg-emerald-50 rounded-md mt-1 border border-emerald-100 uppercase font-bold text-center">
                        {res.gradeLetter}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Beautiful Printable Certificate Template */}
        <div className="lg:col-span-7">
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider block px-1 flex items-center gap-1.5 no-print mb-4">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>រូបភាពវិញ្ញាបនបត្រ / ប័ណ្ណសរសើរ</span>
          </h4>

          {top5.length > 0 && top5[activeCertIndex] ? (
            (() => {
              const currentHonoree = top5[activeCertIndex];
              const student = currentHonoree.student;
              
              const titleRole = 
                currentHonoree.rank === 1 ? 'ផ្នែកសិក្សា (លំដាប់ទី១)' :
                currentHonoree.rank === 2 ? 'លំដាប់ទី២' :
                currentHonoree.rank === 3 ? 'លំដាប់ទី៣' :
                `លំដាប់ទី${currentHonoree.rank}`;

              return (
                <div 
                  className="bg-stone-50 border-[10px] border-brand-gold-dark/80 p-8 shadow-md rounded-lg max-w-[297mm] mx-auto print-area relative overflow-hidden"
                  style={{
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    aspectRatio: '1.414/1' // Standard A4 Aspect Ratio landscape
                  }}
                >
                  {/* Decorative Ornate Borders */}
                  <div className="absolute inset-2 border-2 border-brand-gold/60 pointer-events-none rounded-sm"></div>
                  
                  {/* Outer corner ornaments */}
                  <div className="absolute top-4 left-4 h-8 w-8 border-t-4 border-l-4 border-brand-red pointer-events-none"></div>
                  <div className="absolute top-4 right-4 h-8 w-8 border-t-4 border-r-4 border-brand-red pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-brand-red pointer-events-none"></div>
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-brand-red pointer-events-none"></div>

                  <div className="text-center space-y-3 h-full flex flex-col justify-between py-2">
                    {/* Header Nation Motto */}
                    <div className="space-y-1">
                      <h3 className="font-moul text-[13px] text-slate-800 tracking-wide uppercase">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                      <h4 className="font-moul text-[10px] text-slate-700 tracking-wider">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                      <div className="mx-auto w-16 h-[1.5px] bg-brand-gold"></div>
                    </div>

                    {/* School / Ministry banner */}
                    <div className="text-left text-[11px] font-semibold text-slate-600 px-6 flex justify-between">
                      <span>មន្ទីរអប់រំ យុវជន និងកីឡា</span>
                      <span className="italic">លេខ៖ ................. គ.ថ.ស</span>
                    </div>

                    {/* Core Core Title Certificate */}
                    <div className="space-y-2 mt-4">
                      <span className="inline-block px-4 py-1.5 bg-brand-red text-white uppercase text-xs font-bold rounded-md tracking-wider shadow-xs font-moul leading-normal">
                        ប័ណ្ណសរសើរ (Honor Certificate)
                      </span>
                      <p className="text-slate-600 font-semibold text-xs py-2">
                        នាយកសាលាបឋមសិក្សារួមជាមួយលោកគ្រូ/អ្នកគ្រូប្រចាំថ្នាក់ សហការសម្រេចប្រគល់ជូន
                      </p>
                    </div>

                    {/* Student Identity Information in grand display style */}
                    <div className="space-y-2">
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

                    {/* Honor statement descriptions */}
                    <div className="max-w-xl mx-auto px-4 mt-2">
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        ដែលទទួលបានលទ្ធផលសិក្សាល្អប្រសើរ លេចធ្លោ មានវិន័យស្អាតស្អំ សីលធម៌សមរម្យ 
                        និងដណ្តើមបានលំដាប់ថ្នាក់ <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-xs shrink-0 border border-amber-200">ចំណាត់ថ្នាក់គឺ៖ លេខ ១ (លំដាប់ទី១)</span> 
                        ក្នុងខែ <strong>{selectedMonth}</strong> នៃឆ្នាំសិក្សា <strong>{academicYear}</strong> 
                        ដោយទទួលបានមធ្យមភាគពិន្ទុ <strong className="font-mono text-blue-800 text-sm font-bold">{currentHonoree.average}</strong> និងសញ្ញានិទ្ទេសលេចធ្លោ <strong className="text-emerald-700 font-bold uppercase">"{currentHonoree.gradeLetter}" ({currentHonoree.grade.split(' ')[0]})</strong>។
                      </p>
                    </div>

                    {/* Decorative star bursts */}
                    <div className="flex justify-center gap-1.5 text-brand-gold py-1">
                      <Stars className="h-5 w-5 animate-pulse" />
                      <Stars className="h-5 w-5 animate-pulse" />
                      <Stars className="h-5 w-5 animate-pulse" />
                    </div>

                    {/* Signatures and locations block */}
                    <div className="grid grid-cols-2 text-[11px] text-slate-600 pt-6 border-slate-200/40">
                      <div>
                        <p className="font-moul text-[9px] leading-relaxed">បានឃើញ និងឯកភាព</p>
                        <p className="text-slate-500 py-1 font-semibold">នាយកសាលាបឋមសិក្សា</p>
                        <div className="h-10"></div>
                        <p className="font-bold text-slate-700">................................................</p>
                      </div>
                      <div>
                        <p className="italic">ធ្វើនៅថ្ងៃទី ........ ខែ ................ ឆ្នាំ ២០២...</p>
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
    </div>
  );
}
