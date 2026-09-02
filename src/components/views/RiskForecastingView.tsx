import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  Gauge,
  MapPin,
  Building,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Dog2025Row,
  RabiesRow,
  PepVacRow,
  AreaZoneSummary,
} from '../../types';
import { useFilter } from '../../context/FilterContext';
import { calculateDynamicAreaZoneSummaries } from '../../utils/zoneClassifier';
import { DataSource } from '../common/DataSource';
import { formatPercent, toBE } from '../../utils/thaiYear';
import { CascadingLocationFilter } from '../common/CascadingLocationFilter';
import { RriTheoryModal } from '../risk/RriTheoryModal';
import { RriWhatIfSimulator } from '../risk/RriWhatIfSimulator';

interface RiskForecastingViewProps {
  dogData: Dog2025Row[];
  rabiesData: RabiesRow[];
  pepData: PepVacRow[];
}

export const RiskForecastingView: React.FC<RiskForecastingViewProps> = ({
  dogData,
  rabiesData,
  pepData,
}) => {
  const {
    selectedYear,
    selectedDistrict,
    setSelectedDistrict,
    selectedSubDistrict,
    setSelectedSubDistrict,
    searchQuery,
  } = useFilter();
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'vaccine' | 'epi'>('score');
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

  const selectedYearBE = toBE(selectedYear);

  const dynamicScope = calculateDynamicAreaZoneSummaries(
    selectedDistrict,
    selectedSubDistrict,
    selectedYear,
    dogData,
    rabiesData,
    pepData
  );

  const activeSummaries = dynamicScope.summaries;
  const currentLevel = dynamicScope.level;
  const unitLabel = currentLevel === 'district' ? 'อำเภอ' : currentLevel === 'subdistrict' ? 'ตำบล' : 'หมู่บ้าน';

  // Filter & Sort
  const filteredSummaries = activeSummaries.filter((d) => {
    const matchLevel = levelFilter === 'all' || d.riskLevel === levelFilter;
    const matchSearch =
      searchQuery === '' ||
      d.areaNameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.areaNameEn && d.areaNameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchLevel && matchSearch;
  });

  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortBy === 'score') return b.riskIndexScore - a.riskIndexScore;
    if (sortBy === 'vaccine') return a.vaccineCoverageRate - b.vaccineCoverageRate;
    if (sortBy === 'epi') {
      const aEpi = a.rriBreakdown?.epiForceScore || 0;
      const bEpi = b.rriBreakdown?.epiForceScore || 0;
      return bEpi - aEpi;
    }
    return a.areaNameTh.localeCompare(b.areaNameTh, 'th');
  });

  // Top 10 High Risk Chart Data
  const top10ChartData = sortedSummaries.slice(0, 10).map((d) => ({
    name: d.areaNameTh.replace('นครศรีธรรมราช', '').replace('ต.', ''),
    score: d.riskIndexScore,
    epiScore: d.rriBreakdown?.epiForceScore || 0,
    herdScore: d.rriBreakdown?.immunityGapScore || 0,
    ecoScore: d.rriBreakdown?.animalEcologyScore || 0,
    pepScore: d.rriBreakdown?.humanInterfaceScore || 0,
    vaccineRate: Math.round(d.vaccineCoverageRate),
    level: d.riskLevel,
  }));

  const criticalCount = activeSummaries.filter((z) => z.riskLevel === 'วิกฤต').length;
  const highCount = activeSummaries.filter((z) => z.riskLevel === 'สูง').length;
  const moderateCount = activeSummaries.filter((z) => z.riskLevel === 'ปานกลาง').length;
  const lowCount = activeSummaries.filter((z) => z.riskLevel === 'ต่ำ').length;

  // Provincial Pillar Averages
  const avgEpi = activeSummaries.length > 0
    ? (activeSummaries.reduce((sum, s) => sum + (s.rriBreakdown?.epiForceScore || 0), 0) / activeSummaries.length).toFixed(1)
    : '0';
  const avgHerd = activeSummaries.length > 0
    ? (activeSummaries.reduce((sum, s) => sum + (s.rriBreakdown?.immunityGapScore || 0), 0) / activeSummaries.length).toFixed(1)
    : '0';
  const avgEco = activeSummaries.length > 0
    ? (activeSummaries.reduce((sum, s) => sum + (s.rriBreakdown?.animalEcologyScore || 0), 0) / activeSummaries.length).toFixed(1)
    : '0';
  const avgPep = activeSummaries.length > 0
    ? (activeSummaries.reduce((sum, s) => sum + (s.rriBreakdown?.humanInterfaceScore || 0), 0) / activeSummaries.length).toFixed(1)
    : '0';

  const toggleRowExpand = (id: string) => {
    setExpandedAreaId(expandedAreaId === id ? null : id);
  };

  return (
    <div id="risk-forecasting-view" className="space-y-6">
      {/* Cascading Location Filter */}
      <CascadingLocationFilter />

      {/* Banner with Theory & Simulator Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              One Health Multi-Pillar Risk Model
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              ปี พ.ศ. {selectedYearBE}
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            พยากรณ์ความเสี่ยงและจัดอันดับพื้นที่ (Rabies Risk Index - RRI)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {dynamicScope.scopeTitleTh} • แบบจำลองตามหลักวิชาการสากล (WHO/WOAH): แรงระบาดของเชื้อย้อนหลัง 5 ปี (35%) + ช่องว่างภูมิคุ้มกันฝูง (25%) + นิเวศวิทยาสัตว์จรจัด (20%) + ความครอบคลุม PEP (20%)
          </p>
        </div>

        {/* Action Buttons & Quick Stats */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTheoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-colors shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            สูตรคำนวณและทฤษฎี RRI
          </button>

          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
              showSimulator
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-500'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            {showSimulator ? 'ซ่อนแบบจำลอง' : 'จำลองมาตรการ (What-If)'}
          </button>
        </div>
      </div>

      {/* Interactive Simulator Component (Collapsible) */}
      {showSimulator && (
        <RriWhatIfSimulator
          summaries={activeSummaries}
          levelLabel={unitLabel}
        />
      )}

      {/* 4 Pillars Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            1. แรงระบาดของเชื้อ (Epi Force)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgEpi} <span className="text-xs text-slate-400 font-normal">/ 35 แต้ม</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ตรวจพบสัตว์ติดเชื้อรอบ 1-5 ปี & ผู้เสียชีวิต
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            2. ช่องว่างภูมิคุ้มกัน (Herd Gap)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgHerd} <span className="text-xs text-slate-400 font-normal">/ 25 แต้ม</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ส่วนต่างวัคซีนจากเป้าหมาย 80% (WHO Target)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            3. นิเวศวิทยาสัตว์ (Animal Ecology)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgEco} <span className="text-xs text-slate-400 font-normal">/ 20 แต้ม</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            สัดส่วนสัตว์จรจัดและอัตราการทำหมัน
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-purple-200/80 dark:border-purple-900/40 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            4. ป้องกันในคน (PEP Interface)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgPep} <span className="text-xs text-slate-400 font-normal">/ 20 แต้ม</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            การฉีดวัคซีนป้องกันหลังสัมผัสโรคครบชุด
          </p>
        </div>
      </div>

      {/* Top 10 High Risk Areas Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
              10 อันดับ{unitLabel}ที่มีค่าดัชนีความเสี่ยงสูงสุด (Top 10 Risk Index)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              คะแนน RRI รวม (0-100) คำนวณจากสูตรพหุปัจจัย 4 เสาหลักทางระบาดวิทยา
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">คะแนน RRI (0-100)</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10ChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any, name: string) => [
                  name === 'score' ? `${val} / 100 (คะแนนความเสี่ยง RRI)` : `${val} แต้ม`,
                  name === 'score' ? 'RRI Score' : name
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="score" name="ดัชนีความเสี่ยง (RRI)" radius={[4, 4, 0, 0]}>
                {top10ChartData.map((entry, index) => {
                  const color =
                    entry.score >= 70
                      ? '#ef4444'
                      : entry.score >= 50
                      ? '#f97316'
                      : entry.score >= 30
                      ? '#eab308'
                      : '#10b981';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <DataSource source="แบบจำลอง RRI ตามกรอบแนวคิด One Health (สัตว์ปลอดโรค คนปลอดภัย) ร่วมกับข้อมูลระบบ Thai Rabies Net และกรมปศุสัตว์" />
      </div>

      {/* Full Ranking Table with Expandable Mathematical Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
              ตารางจัดอันดับความเสี่ยงราย{unitLabel} ({sortedSummaries.length} {unitLabel})
            </h4>
            <div className="text-[11px] text-slate-400">
              คลิกที่แถวเพื่อดูรายละเอียดคะแนน 4 เสาหลัก และทิศทางแนวโน้มการพยากรณ์ล่วงหน้า
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">ทุกระดับความเสี่ยง ({activeSummaries.length})</option>
              <option value="วิกฤต">เฉพาะ วิกฤต (≥70)</option>
              <option value="สูง">เฉพาะ สูง (50-69)</option>
              <option value="ปานกลาง">เฉพาะ ปานกลาง (30-49)</option>
              <option value="ต่ำ">เฉพาะ ต่ำ (&lt;30)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="score">เรียงตาม: คะแนนความเสี่ยง RRI (มาก ➔ น้อย)</option>
              <option value="epi">เรียงตาม: แรงระบาดของเชื้อ (มาก ➔ น้อย)</option>
              <option value="vaccine">เรียงตาม: ความครอบคลุมวัคซีน (น้อย ➔ มาก)</option>
              <option value="name">เรียงตาม: ชื่อ{unitLabel} (ก-ฮ)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">อันดับ</th>
                <th className="py-2.5 px-3">ชื่อ{unitLabel}</th>
                <th className="py-2.5 px-3">โซนระบาด</th>
                <th className="py-2.5 px-3 text-center">สัตว์ติดเชื้อปี {selectedYearBE}</th>
                <th className="py-2.5 px-3 text-center">วัคซีนสัตว์ (%)</th>
                <th className="py-2.5 px-3 text-center">สุนัขจรจัด (%)</th>
                <th className="py-2.5 px-3 text-center">คะแนน RRI</th>
                <th className="py-2.5 px-3 text-center">ระดับความเสี่ยง</th>
                <th className="py-2.5 px-3 text-center">ทิศทางแนวโน้ม</th>
                <th className="py-2.5 px-3 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedSummaries.map((summary, idx) => {
                const isExpanded = expandedAreaId === summary.areaId;
                const badgeColor =
                  summary.riskLevel === 'วิกฤต'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : summary.riskLevel === 'สูง'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800'
                    : summary.riskLevel === 'ปานกลาง'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

                const trendDirection = summary.rriForecast?.trendDirection || 'stable';

                return (
                  <React.Fragment key={summary.areaId}>
                    <tr
                      onClick={() => toggleRowExpand(summary.areaId)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {summary.areaNameTh}
                        {summary.parentDistrict && currentLevel !== 'district' && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            อ.{summary.parentDistrict}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {summary.zone === 'C'
                            ? '🔴 สีแดง'
                            : summary.zone === 'B_PLUS'
                            ? '🟠 สีส้ม'
                            : summary.zone === 'B'
                            ? '🟡 สีเหลือง'
                            : '🟢 สีเขียว'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={summary.animalPositivesSelectedYear > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {summary.animalPositivesSelectedYear}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-semibold ${summary.vaccineCoverageRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {formatPercent(summary.vaccineCoverageRate)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                        {formatPercent(summary.strayRatio)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="font-bold text-slate-900 dark:text-white">{summary.riskIndexScore}</div>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              summary.riskIndexScore >= 70
                                ? 'bg-rose-500'
                                : summary.riskIndexScore >= 50
                                ? 'bg-orange-500'
                                : summary.riskIndexScore >= 30
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${summary.riskIndexScore}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                          {summary.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          trendDirection === 'increasing'
                            ? 'text-rose-600 dark:text-rose-400'
                            : trendDirection === 'decreasing'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500'
                        }`}>
                          {trendDirection === 'increasing' && <TrendingUp className="w-3.5 h-3.5" />}
                          {trendDirection === 'decreasing' && <TrendingDown className="w-3.5 h-3.5" />}
                          {trendDirection === 'stable' && <Activity className="w-3.5 h-3.5" />}
                          {trendDirection === 'increasing' ? 'เสี่ยงเพิ่ม' : trendDirection === 'decreasing' ? 'มีแนวโน้มลดลง' : 'คงที่'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 mx-auto text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-y border-slate-200 dark:border-slate-800">
                        <td colSpan={10} className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
                              <div className="text-[10px] text-slate-500 uppercase font-semibold">1. แรงระบาดของเชื้อ (Epi Force)</div>
                              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                {summary.rriBreakdown?.epiForceScore || 0} / 35 แต้ม
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                ติดเชื้อปีปัจจุบัน: {summary.animalPositivesSelectedYear} ตัว • ย้อนหลัง 1-5 ปี: {((summary.rriBreakdown?.epiForceScore || 0) > 0 ? 'มีประวัติ' : 'ปลอดเชื้อ')}
                              </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200/80 dark:border-blue-900/40">
                              <div className="text-[10px] text-slate-500 uppercase font-semibold">2. ช่องว่างภูมิคุ้มกันฝูง (Herd Gap)</div>
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                {summary.rriBreakdown?.immunityGapScore || 0} / 25 แต้ม
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                ฉีดวัคซีน: {formatPercent(summary.vaccineCoverageRate)} (ส่วนต่าง {Math.max(0, 80 - summary.vaccineCoverageRate).toFixed(1)}% จากเป้า 80%)
                              </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
                              <div className="text-[10px] text-slate-500 uppercase font-semibold">3. นิเวศวิทยาสัตว์จรจัด (Animal Ecology)</div>
                              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                {summary.rriBreakdown?.animalEcologyScore || 0} / 20 แต้ม
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                สุนัขจรจัด: {formatPercent(summary.strayRatio)} • อัตราทำหมัน: {formatPercent(summary.sterilizationRate)}
                              </div>
                            </div>

                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-200/80 dark:border-purple-900/40">
                              <div className="text-[10px] text-slate-500 uppercase font-semibold">4. การป้องกันในมนุษย์ (PEP Interface)</div>
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                                {summary.rriBreakdown?.humanInterfaceScore || 0} / 20 แต้ม
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                ความครบถ้วน PEP: {formatPercent(summary.pepComplianceRate)}
                              </div>
                            </div>
                          </div>

                          {/* Multi-Year Projections & Action Roadmap */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                การพยากรณ์คะแนนความเสี่ยงล่วงหน้า (Multi-Year Risk Forecast)
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-500">ปีปัจจุบัน</div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {summary.riskIndexScore}
                                  </div>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-500">+1 ปีข้างหน้า</div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {summary.rriForecast?.forecastRri1Year ?? summary.riskIndexScore}
                                  </div>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-500">+2 ปีข้างหน้า</div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {summary.rriForecast?.forecastRri2Years ?? summary.riskIndexScore}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                มาตรการและข้อเสนอแนะเชิง One Health
                              </div>
                              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4 mt-1">
                                {summary.rriBreakdown?.recommendedInterventions?.map((rec, rIdx) => (
                                  <li key={rIdx}>{rec}</li>
                                )) || (
                                  <li>รักษาระดับความครอบคลุมวัคซีนให้คงอยู่เหนือเกณฑ์ 80% อย่างต่อเนื่อง</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RRI Theory & Documentation Modal */}
      <RriTheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
};
