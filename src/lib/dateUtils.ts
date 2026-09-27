import { DayOfWeek } from '../types';

export const INDONESIAN_DAYS: DayOfWeek[] = [
  'Minggu', // 0
  'Senin',  // 1
  'Selasa', // 2
  'Rabu',   // 3
  'Kamis',  // 4
  'Jumat',  // 5
  'Sabtu',  // 6
];

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export const getDayNameFromDate = (dateString: string): DayOfWeek => {
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  return INDONESIAN_DAYS[dayIndex];
};

export const getDaysInMonth = (year: number, month: number) => {
  // month is 1-based (1 = Januari, 12 = Desember)
  return new Date(year, month, 0).getDate();
};

export interface DayInfo {
  dateString: string; // YYYY-MM-DD
  dayNumber: number; // 1-31
  dayName: DayOfWeek;
  isToday: boolean;
}

export const getAllDatesInMonth = (year: number, month: number): DayInfo[] => {
  const dates: DayInfo[] = [];
  const totalDays = getDaysInMonth(year, month);
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${pad(month)}-${pad(i)}`;
    const d = new Date(year, month - 1, i);
    dates.push({
      dateString: dateStr,
      dayNumber: i,
      dayName: INDONESIAN_DAYS[d.getDay()],
      isToday: dateStr === todayStr
    });
  }

  return dates;
};

export interface ScheduledDayDetail {
  dateString: string;
  dayName: DayOfWeek;
}

/**
 * Mendapatkan semua tanggal dalam suatu bulan yang sesuai dengan jadwal guru.
 */
export const getScheduledDatesInMonth = (
  year: number,
  month: number,
  schedule: DayOfWeek[]
): ScheduledDayDetail[] => {
  const allDates = getAllDatesInMonth(year, month);
  return allDates
    .filter(d => schedule.includes(d.dayName))
    .map(d => ({
      dateString: d.dateString,
      dayName: d.dayName
    }));
};

/**
 * Format tanggal ke format Indonesia yang indah: "Senin, 12 Oktober 2026"
 */
export const formatIndonesianDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const dayName = getDayNameFromDate(dateString);
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

/**
 * Format bulan ke format Indonesia: "Oktober 2026"
 */
export const formatIndonesianMonthYear = (month: number, year: number): string => {
  return `${MONTH_NAMES[month - 1]} ${year}`;
};
