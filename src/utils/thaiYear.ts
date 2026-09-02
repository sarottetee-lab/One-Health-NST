/**
 * Thai Buddhist Era (BE) & Christian Era (AD) Utility Functions
 * Example: 2025 AD = 2568 BE
 */

export const BE_OFFSET = 543;

export function toBE(year: number | string | 'all'): number {
  if (year === 'all') return 2569;
  const y = typeof year === 'string' ? parseInt(year, 10) : year;
  if (isNaN(y)) return 2569;
  return y > 2400 ? y : y + BE_OFFSET;
}

export function toAD(year: number | string | 'all'): number {
  if (year === 'all') return 2026;
  const y = typeof year === 'string' ? parseInt(year, 10) : year;
  if (isNaN(y)) return 2026;
  return y > 2400 ? y - BE_OFFSET : y;
}

export function sameYear(yearA: number | string | 'all', yearB: number | string | 'all'): boolean {
  if (yearA === 'all' || yearB === 'all') return true;
  if (!yearA || !yearB) return false;
  return toBE(yearA) === toBE(yearB);
}

export function formatYearBE(year: number | string | 'all'): string {
  if (year === 'all') return 'ทุกปี (ทุกช่วงเวลา)';
  const be = toBE(year);
  return `พ.ศ. ${be}`;
}

export function formatFullThaiDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const beYear = d.getFullYear() + BE_OFFSET;
    return `${day} ${month} ${beYear}`;
  } catch {
    return dateStr;
  }
}

export function formatNumber(num: number | undefined, decimals = 0): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(num: number | undefined, decimals = 1): string {
  if (num === undefined || num === null || isNaN(num)) return '0.0%';
  return `${num.toFixed(decimals)}%`;
}
