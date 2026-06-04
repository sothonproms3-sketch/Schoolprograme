import { Student, Subject, MonthScore, MonthResult } from '../types';

export function calculateGrade(average: number): { letter: string; description: string; color: string } {
  // Assuming scale is out of 10
  if (average >= 9.0) {
    return { letter: 'A', description: 'ល្អប្រសើរ (Excellent)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (average >= 8.0) {
    return { letter: 'B', description: 'ល្អណាស់ (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  } else if (average >= 7.0) {
    return { letter: 'C', description: 'ល្អ (Good)', color: 'text-sky-700 bg-sky-50 border-sky-200' };
  } else if (average >= 6.0) {
    return { letter: 'D', description: 'ល្អបង្គួរ (Fair)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (average >= 5.0) {
    return { letter: 'E', description: 'មធ្យម (Medium)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  } else {
    return { letter: 'F', description: 'ខ្សោយ (Poor)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }
}

export function computeMonthlyResults(
  students: Student[],
  subjects: Subject[],
  monthScores: MonthScore[]
): MonthResult[] {
  // Calculate raw averages and totals
  const resultsWithoutRank = students.map((student) => {
    // Find the score entry for this student
    const scoreEntry = monthScores.find((e) => e.studentId === student.id);
    const scoresMap = scoreEntry?.scores || {};

    let total = 0;
    let countedSubjects = 0;

    subjects.forEach((subj) => {
      const scoreVal = scoresMap[subj.id];
      // If score is present, add it. If not, it defaults to 0
      const actualScore = typeof scoreVal === 'number' ? scoreVal : 0;
      total += actualScore;
      countedSubjects++;
    });

    const average = countedSubjects > 0 ? total / countedSubjects : 0;
    const gradeInfo = calculateGrade(average);

    return {
      student,
      scores: scoresMap,
      total: Number(total.toFixed(2)),
      average: Number(average.toFixed(2)),
      rank: 1, // temporary placeholder
      grade: gradeInfo.description,
      gradeLetter: gradeInfo.letter,
    };
  });

  // Sort by average descending
  const sorted = [...resultsWithoutRank].sort((a, b) => b.average - a.average);

  // Assign ranks with fractional/tied ranking handling
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].average < sorted[i - 1].average) {
      currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }

  return sorted;
}
