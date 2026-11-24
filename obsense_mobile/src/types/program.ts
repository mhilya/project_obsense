/**
 * Type definitions untuk program tracking Obsense
 */

export type ProgramStatus = 'belum_mulai' | 'sedang_berjalan' | 'selesai';

export interface DayEntry {
  day: number;
  date: string; // ISO string
  completed: boolean;
  recordedAt?: string; // ISO string, kapan user input data hari ini
}

export interface ProgramCycle {
  id: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string, jika sudah selesai
  status: ProgramStatus;
  currentDay: number; // 1-14
  entries: DayEntry[]; // Array 14 hari
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export interface ProgramSummary {
  totalCycles: number;
  completedCycles: number;
  currentCycle?: ProgramCycle;
  lastCompletedCycle?: ProgramCycle;
}
