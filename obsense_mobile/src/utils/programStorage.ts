import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgramCycle, ProgramStatus, DayEntry, ProgramSummary } from '../types/program';

const STORAGE_KEY = '@program_cycles';

/**
 * Ambil semua siklus program dari storage
 */
export async function getAllCycles(): Promise<ProgramCycle[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as ProgramCycle[];
    }
    return [];
  } catch (error) {
    console.error('Error getting cycles:', error);
    return [];
  }
}

/**
 * Ambil siklus yang sedang aktif (status: sedang_berjalan)
 */
export async function getCurrentCycle(): Promise<ProgramCycle | null> {
  try {
    const cycles = await getAllCycles();
    return cycles.find(c => c.status === 'sedang_berjalan') || null;
  } catch (error) {
    console.error('Error getting current cycle:', error);
    return null;
  }
}

/**
 * Ambil siklus terakhir yang selesai
 */
export async function getLastCompletedCycle(): Promise<ProgramCycle | null> {
  try {
    const cycles = await getAllCycles();
    const completed = cycles
      .filter(c => c.status === 'selesai')
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || a.createdAt).getTime();
        const dateB = new Date(b.completedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    return completed[0] || null;
  } catch (error) {
    console.error('Error getting last completed cycle:', error);
    return null;
  }
}

/**
 * Dapatkan summary program secara keseluruhan
 */
export async function getProgramSummary(): Promise<ProgramSummary> {
  try {
    const cycles = await getAllCycles();
    const currentCycle = await getCurrentCycle();
    const lastCompletedCycle = await getLastCompletedCycle();

    return {
      totalCycles: cycles.length,
      completedCycles: cycles.filter(c => c.status === 'selesai').length,
      currentCycle: currentCycle || undefined,
      lastCompletedCycle: lastCompletedCycle || undefined,
    };
  } catch (error) {
    console.error('Error getting program summary:', error);
    return {
      totalCycles: 0,
      completedCycles: 0,
    };
  }
}

/**
 * Mulai siklus baru (14 hari)
 */
export async function startNewCycle(): Promise<ProgramCycle> {
  try {
    const cycles = await getAllCycles();
    
    // Pastikan tidak ada siklus yang sedang berjalan
    const hasActiveCycle = cycles.some(c => c.status === 'sedang_berjalan');
    if (hasActiveCycle) {
      throw new Error('Sudah ada siklus yang sedang berjalan');
    }

    // Buat 14 hari entry
    const entries: DayEntry[] = Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
    }));

    const newCycle: ProgramCycle = {
      id: `cycle_${Date.now()}`,
      startDate: new Date().toISOString(),
      status: 'sedang_berjalan',
      currentDay: 1,
      entries,
      createdAt: new Date().toISOString(),
    };

    cycles.push(newCycle);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
    
    return newCycle;
  } catch (error) {
    console.error('Error starting new cycle:', error);
    throw error;
  }
}

/**
 * Tandai hari tertentu sebagai selesai diinput
 */
export async function markDayCompleted(cycleId: string, day: number): Promise<boolean> {
  try {
    const cycles = await getAllCycles();
    const cycleIndex = cycles.findIndex(c => c.id === cycleId);
    
    if (cycleIndex === -1) {
      throw new Error('Cycle not found');
    }

    const cycle = cycles[cycleIndex];
    const entryIndex = cycle.entries.findIndex(e => e.day === day);
    
    if (entryIndex === -1) {
      throw new Error('Day entry not found');
    }

    // Tandai hari ini sebagai completed
    cycle.entries[entryIndex].completed = true;
    cycle.entries[entryIndex].recordedAt = new Date().toISOString();
    
    // Update current day
    cycle.currentDay = day + 1;

    // Jika sudah hari ke-14, tandai siklus selesai
    if (day === 14) {
      cycle.status = 'selesai';
      cycle.endDate = new Date().toISOString();
      cycle.completedAt = new Date().toISOString();
    }

    cycles[cycleIndex] = cycle;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
    
    return true;
  } catch (error) {
    console.error('Error marking day completed:', error);
    return false;
  }
}

/**
 * Hitung berapa hari yang sudah diisi
 */
export function getCompletedDaysCount(cycle: ProgramCycle): number {
  return cycle.entries.filter(e => e.completed).length;
}

/**
 * Cek apakah hari tertentu bisa diinput (hari ini atau sebelumnya yang belum diisi)
 */
export function canInputDay(cycle: ProgramCycle, day: number): boolean {
  // Hanya bisa input jika status sedang_berjalan
  if (cycle.status !== 'sedang_berjalan') {
    return false;
  }
  
  // Bisa input hari yang belum completed dan <= current day
  const entry = cycle.entries.find(e => e.day === day);
  return entry ? !entry.completed && day <= cycle.currentDay : false;
}

/**
 * Reset semua data (untuk testing/development)
 */
export async function resetAllCycles(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting cycles:', error);
  }
}
