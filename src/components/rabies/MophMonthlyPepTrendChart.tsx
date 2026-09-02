import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Syringe,
  Heart,
  Award,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Filter,
  Download,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { PepVacRow } from '../../types';
import { formatNumber, formatPercent } from '../../utils/thaiYear';
import { DataSource } from '../common/DataSource';
import {
  getMophMonthlyPepTrendData,
  MophMonthlyPepTrendPoint
} from '../../utils/mophOpenDataApi';

interface MophMonthlyPepTrendChartProps {
  selectedDistrict?: string;
  pepData?: PepVacRow[];
}

type ChartViewMode = 'timeline' | 'comparison' | 'dose_mix' | 'completion_rate';
type YearFilter = 'all' | '2568' | '2569';

export const MophMonthlyPepTrendChart: React.FC<MophMonthlyPepTrendChartProps> = ({
  selectedDistrict = 'all',
  pepData,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('timeline');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [showPeakHighlight, setShowPeakHighlight] = useState<boolean>(true);

  // Compute calculated trend data from authoritative MOPH HDC
  const { timeline, comparisonByMonth, summary } = useMemo(() => {
    return getMophMonthlyPepTrendData(selectedDistrict, pepData);
  }, [selectedDistrict, pepData]);

  // Filtered timeline based on year selection
  const filteredTimeline = useMemo(() => {
    if (yearFilter === '2568') {
      return timeline.filter((t) => t.yearBE === 2568);
    }
    if (yearFilter === '2569') {
      return timeline.filter((t) => t.yearBE === 2569);
    }
    return timeline;
  }, [timeline, yearFilter]);

  // Download CSV of monthly trend
  const handleExportCsv = () => {
    const headers = [
      'ช่วงเวลา (Period)',
      'ปี พ.ศ. (BE)',
      'เดือน (Month)',
      'ผู้สัมผัสโรค (Exposed)',
      'ฉีดเข็มหลัก (Primary Dose)',
      'ฉีดกระตุ้น (Booster)',
      'ได้รับ RIG (RIG Given)',
      'ฉีดครบ 3 เข็ม (3-Dose Comp)',
      'ฉีดครบ 5 เข็ม (5-Dose Comp)',
      'อัตราครบ 5 เข็ม % (Comp Rate %)',
    ];

    const rows = timeline.map((t) => [
      t.periodKey,
      t.yearBE,
      t.monthNameTh,
      t.exposedCount,
      t.primaryDose,
      t.boosterDose,
      t.rigGiven,
      t.comp3Dose,
      t.comp5Dose,
      t.compRate5Dose,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `moph_rabies_pep_monthly_trend_${selectedDistrict}_2568_2569.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const districtLabel =
    selectedDistrict === 'all'
      ? 'สสจ.นครศรีธรรมราช (ภาพรวม 23 อำเภอ)'
      : `อำเภอ${selectedDistrict}`;

  return (
    <div
      id="moph-monthly-pep-trend-chart"
      className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              แนวโน้มรายเดือน (Monthly Epidemiological Trend)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              MOPH HDC Open Data (2568 - 2569)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
              📍 {districtLabel}
            </span>
          </div>

          <h3 className="text-base md:text-lg font-bold text-slate-900 font-heading">
            สถิติการรับวัคซีนป้องกันโรคพิษสุนัขบ้าในคนรายเดือน (PEP Surveillance Timeline)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามพลวัตจำนวนผู้สัมผัสสัตว์สงสัย, การเริ่มฉีดเข็มแรก, ฉีดกระตุ้น, เซรุ่ม RIG และอัตราความครบชุด 5 เข็ม (พ.ศ. 2568 ถึงปัจจุบัน)
          </p>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setYearFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                yearFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              2568-ปัจจุบัน
            </button>
            <button
              onClick={() => setYearFilter('2568')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                yearFilter === '2568'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              ปี 2568
            </button>
            <button
              onClick={() => setYearFilter('2569')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                yearFilter === '2569'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              ปี 2569
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดาวน์โหลดข้อมูลแนวโน้มรายเดือนเป็น CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50/40 border border-blue-100">
          <div className="flex items-center justify-between text-xs text-blue-700 font-medium mb-1">
            <span>ผู้สัมผัสสะสม 2568 vs 2569</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatNumber(summary.totalExposed2568)}
            </span>
            <span className="text-xs text-slate-500">/ 2568</span>
          </div>
          <div className="text-xs text-indigo-700 font-semibold mt-0.5 flex items-center gap-1">
            <span>2569 (ถึงปัจจุบัน):</span>
            <span className="font-bold">{formatNumber(summary.totalExposed2569)} ราย</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium mb-1">
            <span>ฉีดเข็มหลักครบ 5 เข็ม (F8 Rate)</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-700">
              {summary.avgRate5Dose2568}%
            </span>
            <span className="text-xs text-slate-500">/ 2568</span>
          </div>
          <div className="text-xs text-teal-700 font-semibold mt-0.5">
            2569: {summary.avgRate5Dose2569}% ({formatNumber(summary.totalComp5Dose2569)} ราย)
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-linear-to-br from-rose-50 to-red-50/40 border border-rose-100">
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium mb-1">
            <span>ได้รับเซรุ่ม RIG (Cat III)</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-rose-700">
              {formatNumber(summary.totalRig2568 + summary.totalRig2569)}
            </span>
            <span className="text-xs text-slate-500">รายรวม</span>
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-0.5">
            2568: {formatNumber(summary.totalRig2568)} • 2569: {formatNumber(summary.totalRig2569)} ราย
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-linear-to-br from-amber-50 to-orange-50/40 border border-amber-100">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
            <span>ช่วงที่มีผู้สัมผัสสูงสุด (Peak Exposure)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-amber-900">
            มีนาคม - พฤษภาคม
          </div>
          <div className="text-xs text-amber-700 mt-0.5">
            หน้าร้อน/ปิดเทอม สูงกว่าเฉลี่ย +32%
          </div>
        </div>
      </div>

      {/* Sub Tab View Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มต่อเนื่อง (2568 - ปัจจุบัน)</span>
          </button>

          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'comparison'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>เปรียบเทียบ 2568 vs 2569 รายเดือน</span>
          </button>

          <button
            onClick={() => setViewMode('dose_mix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'dose_mix'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>สัดส่วนเข็มหลัก / กระตุ้น / RIG</span>
          </button>

          <button
            onClick={() => setViewMode('completion_rate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'completion_rate'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>อัตราความครบชุด 5 เข็ม % (Target 80%)</span>
          </button>
        </div>

        {/* Peak Season Highlight Checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPeakHighlight}
            onChange={(e) => setShowPeakHighlight(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
          />
          <span>เน้นช่วงฤดูเสี่ยงสูง (มี.ค. - พ.ค.)</span>
        </label>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-80 w-full pt-2">
        {viewMode === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredTimeline}
              margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorExposed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="periodKey"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={40}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => formatNumber(val)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#e11d48' }}
                tickFormatter={(val) => formatNumber(val)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${formatNumber(val)} ราย`,
                  name,
                ]}
                labelFormatter={(label) => `รอบเดือน: ${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontSize: '11px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                verticalAlign="top"
              />

              {/* Area for Total Exposed */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="exposedCount"
                name="ผู้สัมผัสสัตว์สงสัย (Exposed)"
                fill="url(#colorExposed)"
                stroke="#3b82f6"
                strokeWidth={2}
              />

              {/* Bar for Primary Doses Started */}
              <Bar
                yAxisId="left"
                dataKey="primaryDose"
                name="เริ่มฉีดเข็มแรก/เข็มหลัก (Primary)"
                fill="url(#colorPrimary)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />

              {/* Line for 5-Dose Completed */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="comp5Dose"
                name="ฉีดครบ 5 เข็มสมบูรณ์"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
              />

              {/* Line for RIG Given (Right Axis) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rigGiven"
                name="ได้รับเซรุ่ม RIG (แกนขวา)"
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#e11d48' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'comparison' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonByMonth}
              margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="monthShortTh"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => formatNumber(val)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${formatNumber(val)} ราย`,
                  name,
                ]}
                labelFormatter={(label) => `เดือน${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="top" />

              <Bar
                dataKey="exposed2568"
                name="ผู้สัมผัส ปี 2568"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="exposed2569"
                name="ผู้สัมผัส ปี 2569"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="comp5Dose2568"
                name="ฉีดครบ 5 เข็ม ปี 2568"
                fill="#fbbf24"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="comp5Dose2569"
                name="ฉีดครบ 5 เข็ม ปี 2569"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'dose_mix' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredTimeline}
              margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="periodKey"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-25}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => formatNumber(val)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${formatNumber(val)} ราย`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="top" />

              <Bar
                dataKey="primaryDose"
                name="ฉีดเข็มหลัก 5 เข็ม (Primary)"
                stackId="a"
                fill="#3b82f6"
              />
              <Bar
                dataKey="boosterDose"
                name="ฉีดกระตุ้น (Booster 1-2 เข็ม)"
                stackId="a"
                fill="#8b5cf6"
              />
              <Bar
                dataKey="rigGiven"
                name="เซรุ่ม RIG (Cat III)"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'completion_rate' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredTimeline}
              margin={{ top: 15, right: 25, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="periodKey"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-25}
                textAnchor="end"
                height={40}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}%`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="top" />

              {/* Target 80% line */}
              <ReferenceLine
                y={80}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'เกณฑ์เป้าหมายกระทรวงฯ 80%',
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* Benchmark 70% line */}
              <ReferenceLine
                y={70}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: 'เกณฑ์มาตรฐานขั้นต่ำ 70%',
                  position: 'insideBottomRight',
                  fill: '#d97706',
                  fontSize: 10,
                }}
              />

              <Line
                type="monotone"
                dataKey="compRate5Dose"
                name="อัตราฉีดครบ 5 เข็ม (F8 %)"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
              />

              <Line
                type="monotone"
                dataKey="compRate3Dose"
                name="อัตราฉีดครบ 3 เข็มแรก (F7 %)"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Epidemiological Season & Clinical Guidance Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-0.5">
            <div className="font-bold">พีคฤดูร้อน & วันหยุดยาว (มี.ค. - พ.ค.)</div>
            <p className="text-[11px] text-amber-800/80 leading-relaxed">
              สถิติเด็กถูกสุนัขกัดข่วนเพิ่มสูงขึ้น 30-35% ในช่วงปิดเทอมและสงกรานต์ ควรเตรียมสต็อกวัคซีนและ RIG ล่วงหน้า
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-2.5">
          <Syringe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 space-y-0.5">
            <div className="font-bold">การติดตามการขาดยาเข็ม 4-5 (D14 / D28)</div>
            <p className="text-[11px] text-blue-800/80 leading-relaxed">
              จุดที่ผู้สัมผัสมักขาดนัดคือเข็ม 5 (วันที่ 28) เนื่องจากแผลหายแล้ว ควรใช้อสม. และระบบ SMS Alert ช่วยติดตาม
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-0.5">
            <div className="font-bold">เกณฑ์เป้าหมาย MOPH One Health</div>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              เป้าหมายอัตราความครอบคลุมวัคซีนเข็มแรก 100% ในผู้สัมผัส Category II/III และความครบชุด 5 เข็ม ≥ 80%
            </p>
          </div>
        </div>
      </div>

      <DataSource source="กระทรวงสาธารณสุข (MOPH Open Data API & Health Data Center HDC) ตาราง s_rebies_overview ปีงบประมาณ 2568 - 2569 สสจ.นครศรีธรรมราช" />
    </div>
  );
};
