import React, { useState, useMemo } from 'react';
import {
  Table,
  Search,
  ArrowUpDown,
  Filter,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
} from 'lucide-react';
import { RabiesRow } from '../../types';
import {
  RAW_RABIES_PIVOT_DATA,
  PIVOT_AVAILABLE_YEARS_AD,
  PIVOT_AVAILABLE_YEARS_BE,
} from '../../data/rabiesPivotData';
import { NAKHON_DISTRICTS } from '../../data/nakhonDistricts';
import { cleanDistrictName } from '../../utils/rabiesImportParser';

interface RabiesPivotTableSectionProps {
  rabiesData?: RabiesRow[];
}

export const RabiesPivotTableSection: React.FC<RabiesPivotTableSectionProps> = ({ rabiesData }) => {
  const [searchDistrict, setSearchDistrict] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'positives_only' | 'compact'>('all');
  const [sortBy, setSortBy] = useState<'positive_desc' | 'total_desc' | 'name_asc'>('positive_desc');

  // Discover Available Years
  const availableYears = useMemo(() => {
    if (!rabiesData || rabiesData.length === 0) {
      return PIVOT_AVAILABLE_YEARS_AD;
    }
    const yearsSet = new Set<number>();
    rabiesData.forEach((r) => {
      let y = 2025;
      if (r.Submission_Date) {
        const parts = r.Submission_Date.split('-');
        const parsedY = parseInt(parts[0], 10);
        if (!isNaN(parsedY)) {
          y = parsedY > 2500 ? parsedY - 543 : parsedY;
        }
      }
      if (y >= 2000 && y <= 2050) {
        yearsSet.add(y);
      }
    });
    const sorted = Array.from(yearsSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : PIVOT_AVAILABLE_YEARS_AD;
  }, [rabiesData]);

  // Compute District Summaries
  const districtRows = useMemo(() => {
    if (!rabiesData || rabiesData.length === 0) {
      return RAW_RABIES_PIVOT_DATA.map((item) => {
        let totalPos = 0;
        let totalNeg = 0;
        let totalInc = 0;
        let totalSamples = 0;

        PIVOT_AVAILABLE_YEARS_AD.forEach((y) => {
          const rec = item.records[y];
          if (rec) {
            totalPos += rec.positive;
            totalNeg += rec.negative;
            totalInc += rec.inconclusive;
            totalSamples += rec.positive + rec.negative + rec.inconclusive;
          }
        });

        const positiveRate = totalSamples > 0 ? (totalPos / totalSamples) * 100 : 0;

        return {
          district: item.district,
          records: item.records,
          totalPos,
          totalNeg,
          totalInc,
          totalSamples,
          positiveRate,
        };
      });
    }

    // Dynamic calculation from active rabiesData
    const distMap: {
      [district: string]: { [year: number]: { positive: number; negative: number; inconclusive: number } };
    } = {};

    NAKHON_DISTRICTS.forEach((d) => {
      distMap[d.nameTh] = {};
    });

    rabiesData.forEach((r) => {
      const dist = cleanDistrictName(r.District) || 'เมืองนครศรีธรรมราช';
      if (!distMap[dist]) {
        distMap[dist] = {};
      }

      let y = 2025;
      if (r.Submission_Date) {
        const parts = r.Submission_Date.split('-');
        const parsedY = parseInt(parts[0], 10);
        if (!isNaN(parsedY)) {
          y = parsedY > 2500 ? parsedY - 543 : parsedY;
        }
      }

      if (!distMap[dist][y]) {
        distMap[dist][y] = { positive: 0, negative: 0, inconclusive: 0 };
      }

      if (r.Result === 'Positive') {
        distMap[dist][y].positive++;
      } else if (r.Result === 'Negative') {
        distMap[dist][y].negative++;
      } else {
        distMap[dist][y].inconclusive++;
      }
    });

    return Object.keys(distMap).map((dist) => {
      const records = distMap[dist];
      let totalPos = 0;
      let totalNeg = 0;
      let totalInc = 0;
      let totalSamples = 0;

      availableYears.forEach((y) => {
        const rec = records[y] || { positive: 0, negative: 0, inconclusive: 0 };
        totalPos += rec.positive;
        totalNeg += rec.negative;
        totalInc += rec.inconclusive;
        totalSamples += rec.positive + rec.negative + rec.inconclusive;
      });

      const positiveRate = totalSamples > 0 ? (totalPos / totalSamples) * 100 : 0;

      return {
        district: dist,
        records,
        totalPos,
        totalNeg,
        totalInc,
        totalSamples,
        positiveRate,
      };
    });
  }, [rabiesData, availableYears]);

  // Filter and Sort
  const filteredAndSortedRows = useMemo(() => {
    return districtRows
      .filter((row) => row.district.toLowerCase().includes(searchDistrict.trim().toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'positive_desc') return b.totalPos - a.totalPos || b.totalSamples - a.totalSamples;
        if (sortBy === 'total_desc') return b.totalSamples - a.totalSamples;
        return a.district.localeCompare(b.district, 'th');
      });
  }, [districtRows, searchDistrict, sortBy]);

  // Compute Grand Column Totals per Year
  const yearGrandTotals = useMemo(() => {
    const totals: { [year: number]: { positive: number; negative: number; inconclusive: number; total: number } } = {};
    let grandPos = 0;
    let grandNeg = 0;
    let grandInc = 0;
    let grandTotal = 0;

    availableYears.forEach((y) => {
      let p = 0;
      let n = 0;
      let inc = 0;
      districtRows.forEach((row) => {
        const rec = row.records[y];
        if (rec) {
          p += rec.positive;
          n += rec.negative;
          inc += rec.inconclusive;
        }
      });
      totals[y] = { positive: p, negative: n, inconclusive: inc, total: p + n + inc };
      grandPos += p;
      grandNeg += n;
      grandInc += inc;
      grandTotal += p + n + inc;
    });

    return {
      byYear: totals,
      grandPos,
      grandNeg,
      grandInc,
      grandTotal,
    };
  }, [districtRows, availableYears]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                Pivot Table วิเคราะห์ผลตรวจทางห้องปฏิบัติการ
              </span>
              <span className="text-xs text-slate-300">
                {availableYears.length > 0
                  ? `(ปี ${availableYears[0]} - ${availableYears[availableYears.length - 1]} / พ.ศ. ${availableYears[0] + 543} - ${availableYears[availableYears.length - 1] + 543})`
                  : 'COUNT ของ Received_Date'}
              </span>
            </div>
            <h2 className="text-lg font-bold font-heading text-white mt-1">
              ตารางวิเคราะห์สัตว์ยืนยันติดเชื้อและตัวอย่างส่งตรวจรายอำเภอ (Laboratory Pivot Table Matrix)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              ฐานข้อมูลผลการตรวจวิเคราะห์เชื้อไวรัสพิษสุนัขบ้าครอบคลุม {filteredAndSortedRows.length} อำเภอ รวม {yearGrandTotals.grandTotal.toLocaleString()} ตัวอย่าง (พบเชื้อยืนยัน {yearGrandTotals.grandPos.toLocaleString()} ตัวอย่าง)
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-rose-500/20 border border-rose-400/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-rose-300 uppercase font-semibold">ผลบวกสะสม</div>
              <div className="text-lg font-bold text-rose-400">{yearGrandTotals.grandPos} ตัว</div>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-emerald-300 uppercase font-semibold">ผลลบสะสม</div>
              <div className="text-lg font-bold text-emerald-400">{yearGrandTotals.grandNeg.toLocaleString()} ตัว</div>
            </div>
            <div className="bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-blue-300 uppercase font-semibold">ส่งตรวจรวม</div>
              <div className="text-lg font-bold text-blue-300">{yearGrandTotals.grandTotal.toLocaleString()} ตัว</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออำเภอ (เช่น ชะอวด, ร่อนพิบูลย์)..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  viewMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ตารางเต็ม (แยก ผลบวก / ผลลบ)
              </button>
              <button
                onClick={() => setViewMode('positives_only')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  viewMode === 'positives_only' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                เฉพาะผลบวก (Positives)
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                  viewMode === 'compact' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ยอดรวมส่งตรวจ (Totals)
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="positive_desc">เรียงตาม: ผลบวกสูงสุด (Positives ↓)</option>
              <option value="total_desc">เรียงตาม: ตัวอย่างส่งตรวจรวมสูงสุด (Total ↓)</option>
              <option value="name_asc">เรียงตาม: ชื่ออำเภอ (ก - ฮ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Pivot Table Container */}
      <div className="overflow-x-auto max-h-[540px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-300 shadow-xs">
            {/* Top Year Header Row */}
            <tr>
              <th rowSpan={viewMode === 'all' ? 2 : 1} className="py-2.5 px-3 font-bold bg-slate-200/90 text-slate-800 border-r border-slate-300 sticky left-0 z-20 min-w-[130px]">
                อำเภอ (District)
              </th>
              {availableYears.map((year) => {
                const yearBE = year + 543;
                if (viewMode === 'all') {
                  const hasInconclusive = year === 2016;
                  const colSpan = year === 2012 || year === 2013 ? 1 : hasInconclusive ? 3 : 2;
                  return (
                    <th
                      key={year}
                      colSpan={colSpan}
                      className="py-1.5 px-2 text-center font-bold border-r border-slate-300 bg-slate-100/90 text-slate-800 text-[11px]"
                    >
                      {year} <span className="text-[9px] text-slate-500 font-normal">({yearBE})</span>
                    </th>
                  );
                } else {
                  return (
                    <th
                      key={year}
                      className="py-2 px-2 text-center font-bold border-r border-slate-200 min-w-[65px]"
                    >
                      {year} <div className="text-[9px] text-slate-500 font-normal">({yearBE})</div>
                    </th>
                  );
                }
              })}
              {/* Grand Total Header */}
              <th
                colSpan={viewMode === 'all' ? 2 : 1}
                rowSpan={viewMode === 'all' ? 1 : 1}
                className="py-1.5 px-3 text-center font-bold bg-slate-200/90 text-slate-900 border-l border-slate-300 min-w-[110px]"
              >
                ผลรวมสะสม (Total)
              </th>
            </tr>

            {/* Sub-Header Row for Mode 'all' */}
            {viewMode === 'all' && (
              <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-200">
                {availableYears.map((year) => {
                  if (year === 2012 || year === 2013) {
                    return (
                      <th key={`${year}-neg`} className="py-1 px-1.5 text-center border-r border-slate-200 text-slate-500">
                        ผลลบ
                      </th>
                    );
                  }
                  if (year === 2016) {
                    return (
                      <React.Fragment key={year}>
                        <th className="py-1 px-1.5 text-center border-r border-slate-200 text-emerald-700">ผลลบ</th>
                        <th className="py-1 px-1 text-center border-r border-slate-200 text-amber-700">ตรวจไม่ได้</th>
                        <th className="py-1 px-1.5 text-center border-r border-slate-200 text-rose-700 font-bold bg-rose-50">ผลบวก</th>
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={year}>
                      <th className="py-1 px-1.5 text-center border-r border-slate-200 text-emerald-700">ผลลบ</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-200 text-rose-700 font-bold bg-rose-50">ผลบวก</th>
                    </React.Fragment>
                  );
                })}
                <th className="py-1 px-1.5 text-center text-rose-700 font-bold bg-rose-100">ผลบวก</th>
                <th className="py-1 px-1.5 text-center text-slate-700 font-bold bg-slate-200">ส่งตรวจ</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredAndSortedRows.map((row, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={row.district}
                  className={`hover:bg-indigo-50/50 transition-colors ${
                    isEven ? 'bg-white' : 'bg-slate-50/40'
                  } ${row.totalPos > 0 ? 'font-medium' : ''}`}
                >
                  {/* District Name Sticky Column */}
                  <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-200 sticky left-0 bg-inherit z-10 flex items-center justify-between gap-1">
                    <span>{row.district}</span>
                    {row.totalPos > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700 shrink-0">
                        {row.totalPos} +
                      </span>
                    )}
                  </td>

                  {/* Year Data Cells */}
                  {availableYears.map((year) => {
                    const rec = row.records[year] || { positive: 0, negative: 0, inconclusive: 0 };
                    const hasData = rec.positive > 0 || rec.negative > 0 || rec.inconclusive > 0;

                    if (viewMode === 'all') {
                      if (year === 2012 || year === 2013) {
                        return (
                          <td
                            key={year}
                            className={`py-1.5 px-1.5 text-center border-r border-slate-100 text-2xs ${
                              rec.negative > 0 ? 'text-slate-700 font-medium' : 'text-slate-300'
                            }`}
                          >
                            {rec.negative > 0 ? rec.negative : '-'}
                          </td>
                        );
                      }

                      if (year === 2016) {
                        return (
                          <React.Fragment key={year}>
                            <td className={`py-1.5 px-1.5 text-center border-r border-slate-100 text-2xs ${rec.negative > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                              {rec.negative > 0 ? rec.negative : '-'}
                            </td>
                            <td className={`py-1.5 px-1 text-center border-r border-slate-100 text-2xs ${rec.inconclusive > 0 ? 'text-amber-700 font-bold bg-amber-50' : 'text-slate-300'}`}>
                              {rec.inconclusive > 0 ? rec.inconclusive : '-'}
                            </td>
                            <td className={`py-1.5 px-1.5 text-center border-r border-slate-100 text-2xs font-bold ${rec.positive > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-300'}`}>
                              {rec.positive > 0 ? rec.positive : '-'}
                            </td>
                          </React.Fragment>
                        );
                      }

                      return (
                        <React.Fragment key={year}>
                          <td className={`py-1.5 px-1.5 text-center border-r border-slate-100 text-2xs ${rec.negative > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                            {rec.negative > 0 ? rec.negative : '-'}
                          </td>
                          <td
                            className={`py-1.5 px-1.5 text-center border-r border-slate-100 text-2xs font-bold ${
                              rec.positive > 0
                                ? rec.positive >= 4
                                  ? 'text-white bg-rose-600 font-extrabold shadow-2xs'
                                  : 'text-rose-700 bg-rose-50'
                                : 'text-slate-300'
                            }`}
                          >
                            {rec.positive > 0 ? rec.positive : '-'}
                          </td>
                        </React.Fragment>
                      );
                    } else if (viewMode === 'positives_only') {
                      return (
                        <td
                          key={year}
                          className={`py-1.5 px-2 text-center border-r border-slate-100 text-xs font-bold ${
                            rec.positive > 0
                              ? rec.positive >= 4
                                ? 'text-white bg-rose-600 font-extrabold'
                                : 'text-rose-700 bg-rose-50'
                              : 'text-slate-300'
                          }`}
                        >
                          {rec.positive > 0 ? rec.positive : '-'}
                        </td>
                      );
                    } else {
                      const total = rec.positive + rec.negative + rec.inconclusive;
                      return (
                        <td
                          key={year}
                          className={`py-1.5 px-2 text-center border-r border-slate-100 text-xs ${
                            total > 0 ? 'text-slate-800 font-medium' : 'text-slate-300'
                          }`}
                        >
                          {total > 0 ? total : '-'}
                        </td>
                      );
                    }
                  })}

                  {/* Summary Total Columns */}
                  {viewMode === 'all' ? (
                    <>
                      <td className={`py-1.5 px-2 text-center font-bold text-xs ${row.totalPos > 0 ? 'text-rose-700 bg-rose-50/80 font-extrabold' : 'text-slate-400'}`}>
                        {row.totalPos}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold text-slate-800 text-xs border-r border-slate-200">
                        {row.totalSamples}
                      </td>
                    </>
                  ) : viewMode === 'positives_only' ? (
                    <td className={`py-1.5 px-3 text-center font-extrabold text-xs ${row.totalPos > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-400'}`}>
                      {row.totalPos}
                    </td>
                  ) : (
                    <td className="py-1.5 px-3 text-center font-bold text-slate-800 text-xs">
                      {row.totalSamples}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer with Grand Column Totals */}
          <tfoot className="bg-slate-200 text-slate-900 font-bold sticky bottom-0 z-10 border-t-2 border-slate-400">
            <tr>
              <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-300 sticky left-0 bg-slate-300 z-20">
                รวมทั้งหมด ({filteredAndSortedRows.length} อำเภอ)
              </td>
              {availableYears.map((year) => {
                const yTot = yearGrandTotals.byYear[year] || { positive: 0, negative: 0, inconclusive: 0, total: 0 };
                if (viewMode === 'all') {
                  if (year === 2012 || year === 2013) {
                    return (
                      <td key={year} className="py-2 px-1.5 text-center text-slate-700 border-r border-slate-300">
                        {yTot.negative}
                      </td>
                    );
                  }
                  if (year === 2016) {
                    return (
                      <React.Fragment key={year}>
                        <td className="py-2 px-1.5 text-center text-emerald-800 border-r border-slate-300">{yTot.negative}</td>
                        <td className="py-2 px-1 text-center text-amber-800 border-r border-slate-300">{yTot.inconclusive}</td>
                        <td className="py-2 px-1.5 text-center text-rose-900 bg-rose-200 border-r border-slate-300 font-extrabold">{yTot.positive}</td>
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={year}>
                      <td className="py-2 px-1.5 text-center text-emerald-800 border-r border-slate-300">{yTot.negative}</td>
                      <td className="py-2 px-1.5 text-center text-rose-900 bg-rose-200 border-r border-slate-300 font-extrabold">{yTot.positive}</td>
                    </React.Fragment>
                  );
                } else if (viewMode === 'positives_only') {
                  return (
                    <td key={year} className="py-2 px-2 text-center text-rose-900 bg-rose-200 border-r border-slate-300 font-extrabold">
                      {yTot.positive}
                    </td>
                  );
                } else {
                  return (
                    <td key={year} className="py-2 px-2 text-center text-slate-900 border-r border-slate-300 font-bold">
                      {yTot.total}
                    </td>
                  );
                }
              })}

              {viewMode === 'all' ? (
                <>
                  <td className="py-2 px-2 text-center font-extrabold bg-rose-300 text-rose-950">
                    {yearGrandTotals.grandPos}
                  </td>
                  <td className="py-2 px-2 text-center font-extrabold bg-slate-300 text-slate-950 border-r border-slate-300">
                    {yearGrandTotals.grandTotal}
                  </td>
                </>
              ) : viewMode === 'positives_only' ? (
                <td className="py-2 px-3 text-center font-extrabold bg-rose-300 text-rose-950">
                  {yearGrandTotals.grandPos}
                </td>
              ) : (
                <td className="py-2 px-3 text-center font-extrabold bg-slate-300 text-slate-950">
                  {yearGrandTotals.grandTotal}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Notes & Key Insights */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>ตารางสรุปผลทางระบาดวิทยา:</strong> ข้อมูลคำนวณแบบพลวัต (Dynamic Matrix) สอดคล้องกับชุดข้อมูลตัวอย่างสัตว์ที่นำเข้าในระบบ
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> พบเชื้อ (Positive)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> ไม่พบเชื้อ (Negative)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> ไม่สรุปผล
          </span>
        </div>
      </div>
    </div>
  );
};
