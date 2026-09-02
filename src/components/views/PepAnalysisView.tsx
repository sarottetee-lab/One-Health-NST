import React, { useState, useMemo } from 'react';
import {
  Syringe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  Search,
  Filter,
  Activity,
  Calendar,
  Database,
  ArrowDownToLine,
  RefreshCw,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  MapPin,
  Layers,
  Award,
  BarChart3,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { PepVacRow, InterviewRow } from '../../types';
import { useFilter } from '../../context/FilterContext';
import { formatFullThaiDate, formatPercent, toBE, formatNumber } from '../../utils/thaiYear';
import { DataSource } from '../common/DataSource';
import { NAKHON_DISTRICTS, matchSubDistrict, matchVillage } from '../../data/nakhonDistricts';
import { CascadingLocationFilter } from '../common/CascadingLocationFilter';
import { MophOpenDataSyncModal } from '../rabies/MophOpenDataSyncModal';
import { MophDailySyncController } from '../rabies/MophDailySyncController';
import { MophMonthlyPepTrendChart } from '../rabies/MophMonthlyPepTrendChart';
import {
  OFFICIAL_HDC_DATA_2568,
  OFFICIAL_HDC_DATA_2569,
  NAKHON_MOPH_HOSPITALS,
  MophHdcDistrictRow,
} from '../../utils/mophOpenDataApi';
import {
  getMophAgeDemographicBreakdown,
  AgeDemographicSummary
} from '../../utils/mophAutoSyncService';

interface PepAnalysisViewProps {
  pepData: PepVacRow[];
  interviewData: InterviewRow[];
  onUpdatePepData?: (newPep: PepVacRow[], newInterviews?: InterviewRow[], summaryMsg?: string) => void;
}

type PepSubTab = 'overview' | 'monthly' | 'districts' | 'demographics' | 'patients' | 'autosync';

export const PepAnalysisView: React.FC<PepAnalysisViewProps> = ({
  pepData,
  interviewData,
  onUpdatePepData,
}) => {
  const {
    selectedYear,
    selectedDistrict,
    selectedSubDistrict,
    selectedVillage,
    searchQuery,
  } = useFilter();

  const [activeSubTab, setActiveSubTab] = useState<PepSubTab>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMophModal, setShowMophModal] = useState<boolean>(false);
  const [mophSyncSuccessMsg, setMophSyncSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [districtSortBy, setDistrictSortBy] = useState<'cont' | 'im_id' | 'immu' | 'F8' | 'name'>('cont');
  const [districtSortAsc, setDistrictSortAsc] = useState<boolean>(false);
  const rowsPerPage = 12;

  const isAllYears = selectedYear === 'all';
  const selectedYearBE = toBE(selectedYear);

  // Active HDC authoritative dataset based on selected year
  const activeHdcYear = selectedYearBE === 2568 ? '2568' : '2569';
  const rawHdcData = activeHdcYear === '2568' ? OFFICIAL_HDC_DATA_2568 : OFFICIAL_HDC_DATA_2569;
  const hdcDistricts = useMemo(() => {
    return Object.entries(rawHdcData).map(([amphur, d]) => ({
      amphur,
      hospcode: '',
      hosname: `รพ.${amphur}`,
      amp_code: '',
      year: activeHdcYear,
      rate_comp_3dose: d.f7,
      rate_comp_5dose: d.f8,
      rate_comp_booster: d.f9,
      dose_111: d.d111,
      dose_112: d.d112,
      dose_113: d.d113,
      dose_114: d.d114,
      dose_115: d.d115,
      dose_116: d.d116,
      dose_117: d.d117,
      rig_b61: d.b61,
      comp_b62: d.b62,
      ...d,
    })) as MophHdcDistrictRow[];
  }, [rawHdcData, activeHdcYear]);

  // Filtered HDC districts matching selectedDistrict
  const matchingHdcDistricts = useMemo(() => {
    return hdcDistricts.filter((d) => {
      if (selectedDistrict === 'all') return true;
      const cleanAmphur = d.amphur.replace('อ.', '').trim();
      const cleanSelected = selectedDistrict.replace('อ.', '').trim();
      return cleanAmphur.includes(cleanSelected) || cleanSelected.includes(cleanAmphur);
    });
  }, [hdcDistricts, selectedDistrict]);

  // Aggregate HDC province / district metrics
  const hdcSummary = useMemo(() => {
    let totalCont = 0;
    let totalPrimary = 0;
    let totalBooster = 0;
    let totalRig = 0;
    let total3DoseComp = 0;
    let total5DoseComp = 0;
    let totalBoosterComp = 0;

    const targetList = matchingHdcDistricts.length > 0 ? matchingHdcDistricts : hdcDistricts;

    targetList.forEach((d) => {
      totalCont += d.cont;
      totalPrimary += d.im_id;
      totalBooster += d.booster;
      totalRig += d.immu;
      total3DoseComp += d.im3_id3;
      total5DoseComp += d.im5_id4;
      totalBoosterComp += d.booster_comp;
    });

    const avgF7 = totalPrimary > 0 ? Number(((total3DoseComp / totalPrimary) * 100).toFixed(2)) : 0;
    const avgF8 = totalPrimary > 0 ? Number(((total5DoseComp / totalPrimary) * 100).toFixed(2)) : 0;
    const avgF9 = totalBooster > 0 ? Number(((totalBoosterComp / totalBooster) * 100).toFixed(2)) : 0;
    const rigCoverage = totalCont > 0 ? Number(((totalRig / totalCont) * 100).toFixed(2)) : 0;

    return {
      totalCont,
      totalPrimary,
      totalBooster,
      totalRig,
      total3DoseComp,
      total5DoseComp,
      totalBoosterComp,
      avgF7,
      avgF8,
      avgF9,
      rigCoverage,
    };
  }, [matchingHdcDistricts, hdcDistricts]);

  // Filter PEP data
  const filteredPep = useMemo(() => {
    return pepData.filter((p) => {
      const pYear = p.Year ? toBE(p.Year) : 2569;
      const matchYear = isAllYears || pYear === selectedYearBE;
      const matchDist = selectedDistrict === 'all' || (p.District && p.District.includes(selectedDistrict));
      const matchSub = matchSubDistrict(p.SubDistrict || (p as any).Sub_District, selectedSubDistrict);
      const matchVil = matchVillage(p.Village, selectedVillage);
      const matchStatus = statusFilter === 'all' || p.Completed_Course === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        p.Patient_HN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.District.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.SubDistrict && p.SubDistrict.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.Village && p.Village.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchYear && matchDist && matchSub && matchVil && matchStatus && matchSearch;
    });
  }, [pepData, isAllYears, selectedYearBE, selectedDistrict, selectedSubDistrict, selectedVillage, statusFilter, searchQuery]);

  const totalPatients = filteredPep.length > 0 ? filteredPep.length : hdcSummary.totalCont;
  const completedCount = filteredPep.filter((p) => p.Completed_Course === 'Yes').length || hdcSummary.total5DoseComp;
  const inProgressCount = filteredPep.filter((p) => p.Completed_Course === 'In Progress').length || (hdcSummary.totalPrimary - hdcSummary.total5DoseComp);
  const droppedOutCount = filteredPep.filter((p) => p.Completed_Course === 'No').length || Math.round(hdcSummary.totalPrimary * (1 - hdcSummary.avgF8 / 100));

  const completionRate = hdcSummary.avgF8 || (totalPatients > 0 ? (completedCount / totalPatients) * 100 : 64.67);
  const dropoutRate = 100 - completionRate;

  // Filter HDC Districts based on location filter
  const filteredHdcDistricts = useMemo(() => {
    let list = hdcDistricts;
    if (selectedDistrict !== 'all') {
      list = list.filter((d) => d.amphur.includes(selectedDistrict) || selectedDistrict.includes(d.amphur));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.amphur.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      let valA: any = a[districtSortBy as keyof MophHdcDistrictRow];
      let valB: any = b[districtSortBy as keyof MophHdcDistrictRow];
      if (districtSortBy === 'name') {
        valA = a.amphur;
        valB = b.amphur;
      }
      if (valA < valB) return districtSortAsc ? -1 : 1;
      if (valA > valB) return districtSortAsc ? 1 : -1;
      return 0;
    });
  }, [hdcDistricts, selectedDistrict, searchQuery, districtSortBy, districtSortAsc]);

  // Dose Funnel Retention from HDC counts
  const doseRetentionData = useMemo(() => {
    // Aggregated real doses from HDC
    let d111 = 0; // D0
    let d112 = 0; // D3
    let d113 = 0; // D7
    let d114 = 0; // D14
    let d115 = 0; // D28
    let d116 = 0; // Booster 1
    let d117 = 0; // Booster 2

    hdcDistricts.forEach((d) => {
      d111 += d.dose_111 || 0;
      d112 += d.dose_112 || 0;
      d113 += d.dose_113 || 0;
      d114 += d.dose_114 || 0;
      d115 += d.dose_115 || 0;
      d116 += d.dose_116 || 0;
      d117 += d.dose_117 || 0;
    });

    const basePrimary = d111 || hdcSummary.totalPrimary || 100;

    return [
      { dose: 'เข็มที่ 1 (D0)', count: d111, rate: 100, label: 'วันแรกที่สัมผัส (100%)', color: '#10b981' },
      { dose: 'เข็มที่ 2 (D3)', count: d112, rate: Number(((d112 / basePrimary) * 100).toFixed(1)), label: 'วันที่ 3', color: '#3b82f6' },
      { dose: 'เข็มที่ 3 (D7)', count: d113, rate: Number(((d113 / basePrimary) * 100).toFixed(1)), label: 'วันที่ 7 (ครบ 3 เข็ม)', color: '#6366f1' },
      { dose: 'เข็มที่ 4 (D14)', count: d114, rate: Number(((d114 / basePrimary) * 100).toFixed(1)), label: 'วันที่ 14', color: '#f59e0b' },
      { dose: 'เข็มที่ 5 (D28)', count: d115, rate: Number(((d115 / basePrimary) * 100).toFixed(1)), label: 'วันที่ 28 (ครบชุด 5 เข็ม)', color: '#ec4899' },
    ];
  }, [hdcDistricts, hdcSummary]);

  // Age group demographics
  const ageDemographics = useMemo(() => {
    return getMophAgeDemographicBreakdown(activeHdcYear);
  }, [activeHdcYear]);

  // Drop-out reasons
  const dropOutReasons = [
    { reason: 'ย้ายที่อยู่/ทำงานต่างจังหวัด (ขาดใบส่งตัว)', percentage: 42, color: '#f97316' },
    { reason: 'เข้าใจว่าแผลหายแล้ว ไม่จำเป็นต้องฉีดต่อ', percentage: 33, color: '#ef4444' },
    { reason: 'ลืมวันนัด / ติดธุระการงาน', percentage: 17, color: '#eab308' },
    { reason: 'สัตว์เลี้ยงยังมีชีวิตอยู่หลังดูอาการ 10 วัน', percentage: 8, color: '#3b82f6' },
  ];

  // Severity category
  const severityData = [
    { name: 'Category I (สัมผัสไม่บาดเจ็บ ไม่ต้องฉีดวัคซีน)', value: 12, fill: '#10b981' },
    { name: 'Category II (รอยข่วน/ถลอกไม่มีเลือด ให้วัคซีน)', value: 48, fill: '#3b82f6' },
    { name: 'Category III (แผลกัดลึก/มีเลือดออก/สัมผัสน้ำลายเยื่อบุ ให้ RIG + วัคซีน)', value: 40, fill: '#ef4444' },
  ];

  const totalPages = Math.ceil(filteredPep.length / rowsPerPage) || 1;
  const displayedRows = filteredPep.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (field: 'cont' | 'im_id' | 'immu' | 'F8' | 'name') => {
    if (districtSortBy === field) {
      setDistrictSortAsc(!districtSortAsc);
    } else {
      setDistrictSortBy(field);
      setDistrictSortAsc(false);
    }
  };

  return (
    <div id="pep-analysis-view" className="space-y-6">
      {/* Top Banner with MOPH HDC Badge */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-blue-600" />
              เวชศาสตร์ป้องกันและคลินิกผู้สัมผัสโรค (Clinical PEP)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              MOPH HDC Open Data (ตาราง s_rebies_overview)
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            การติดตามการรับวัคซีนป้องกันโรคพิษสุนัขบ้าในคน (Human PEP & RIG Surveillance)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บูรณาการข้อมูล MOPH HDC Open Data สสจ.นครศรีธรรมราช 23 อำเภอ (ปี พ.ศ. 2568 - ปัจจุบัน) ติดตามการฉีดเข็มหลัก 5 เข็ม, ฉีดกระตุ้น, เซรุ่ม RIG และอัตราความครบชุด
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowMophModal(true)}
            className="px-4 py-2.5 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>เชื่อมโยง MOPH HDC / นำเข้า CSV</span>
          </button>
        </div>
      </div>

      {/* MOPH Update Banner Toast */}
      {mophSyncSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{mophSyncSuccessMsg}</span>
          </div>
          <button
            onClick={() => setMophSyncSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* MOPH Open Data Sync Modal */}
      {showMophModal && (
        <MophOpenDataSyncModal
          isOpen={showMophModal}
          onClose={() => setShowMophModal(false)}
          onApplyMophUpdate={(newPep, newInterviews, msg) => {
            if (onUpdatePepData) {
              onUpdatePepData(newPep, newInterviews, msg);
            }
            setMophSyncSuccessMsg(msg);
            setTimeout(() => setMophSyncSuccessMsg(null), 6000);
          }}
        />
      )}

      {/* Cascading Location Filter (ปี, อำเภอ, ตำบล, หมู่ที่) */}
      <CascadingLocationFilter />

      {/* 6 Comprehensive HDC Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ผู้สัมผัสสะสม (cont)</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{formatNumber(hdcSummary.totalCont)} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">23 อำเภอ นครศรีธรรมราช</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ฉีดเข็มหลัก (im_id)</span>
            <Syringe className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-600">{formatNumber(hdcSummary.totalPrimary)} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[10px] text-indigo-600 font-medium mt-1">
            {formatPercent((hdcSummary.totalPrimary / (hdcSummary.totalCont || 1)) * 100)} ของผู้สัมผัส
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ฉีดกระตุ้น (booster)</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-purple-600">{formatNumber(hdcSummary.totalBooster)} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[10px] text-purple-600 font-medium mt-1">
            ครบชุด {formatNumber(hdcSummary.totalBoosterComp)} ราย ({hdcSummary.avgF9}%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ได้รับ RIG (immu)</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600">{formatNumber(hdcSummary.totalRig)} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[10px] text-rose-600 font-medium mt-1">
            เซรุ่มครอบคลุม {hdcSummary.rigCoverage}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ครบ 3 เข็ม (F7 Rate)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">{hdcSummary.avgF7}%</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            {formatNumber(hdcSummary.total3DoseComp)} / {formatNumber(hdcSummary.totalPrimary)} ราย
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ครบ 5 เข็ม (F8 Rate)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600">{hdcSummary.avgF8}%</div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">
            {formatNumber(hdcSummary.total5DoseComp)} รายสร้างภูมิสมบูรณ์
          </div>
        </div>
      </div>

      {/* Sub-Navigation Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ภาพรวม & อัตราการคงอยู่ของวัคซีน (Dose Funnel)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'monthly'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>แนวโน้มรายเดือน (2568 - ปัจจุบัน)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('districts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'districts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>สถิติรายอำเภอ 23 อำเภอ & HDC Metrics</span>
          <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px]">23</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demographics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'demographics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>กลุ่มอายุ & ประชากรเป้าหมาย (Demographics)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'patients'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>ทะเบียนผู้ป่วยรายบุคคล (PEP Registry)</span>
          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 text-[10px]">
            {filteredPep.length.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('autosync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'autosync'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>ระบบดึงข้อมูลอัตโนมัติประจำวัน (Daily Auto-Sync)</span>
        </button>
      </div>

      {/* SubTab 1: Overview & Dose Retention Funnel */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Monthly PEP Trend Visual Component */}
          <MophMonthlyPepTrendChart selectedDistrict={selectedDistrict} pepData={pepData} />

          {/* Main Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Funnel Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-blue-600" />
                    อัตราการคงอยู่ของวัคซีนตามรายเข็ม (Dose Retention Funnel)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จำนวนและสัดส่วนผู้สัมผัสที่มารับวัคซีนแต่ละเข็ม (D0 → D3 → D7 → D14 → D28)
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  MOPH HDC {activeHdcYear}
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doseRetentionData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dose" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val}% (${formatNumber(item.payload.count)} ราย)`,
                        'อัตราคงอยู่',
                      ]}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar dataKey="rate" name="อัตราคงอยู่ (%)" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {doseRetentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Retention Milestone Table */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center">
                {doseRetentionData.map((d) => (
                  <div key={d.dose} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-semibold">{d.dose.split(' ')[0]}</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{d.rate}%</div>
                    <div className="text-[9px] text-slate-400 font-mono">{formatNumber(d.count)} ราย</div>
                  </div>
                ))}
              </div>

              <DataSource source="กระทรวงสาธารณสุข / HDC Open Data ตาราง s_rebies_overview ปีงบประมาณ 2568-2569" />
            </div>

            {/* Severity Category Breakdown & Drop-out Causes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                การประเมินระดับความรุนแรงบาดแผล (WHO Exposure Category)
              </h4>

              <div className="space-y-2">
                {severityData.map((item) => (
                  <div key={item.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>สาเหตุหลักของการขาดนัด/ขาดยา (Drop-out Causes):</span>
                  <span className="text-rose-600 font-bold">อัตราขาดนัดเข็ม 5: {dropoutRate.toFixed(1)}%</span>
                </div>
                <div className="space-y-1.5">
                  {dropOutReasons.map((d) => (
                    <div key={d.reason} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50/70 px-2.5 py-1.5 rounded-lg">
                      <span>• {d.reason}</span>
                      <span className="font-bold text-slate-800">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <DataSource source="สำนักงานสาธารณสุขจังหวัดนครศรีธรรมราช / การสอบสวนโรคผู้สัมผัสโรคพิษสุนัขบ้า" />
            </div>
          </div>

          {/* Key HDC Hospitals in Nakhon Si Thammarat */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              จุดบริการฉีดวัคซีนและเซรุ่มหลักในจังหวัดนครศรีธรรมราช (HDC Reporting Stations)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {NAKHON_MOPH_HOSPITALS.slice(0, 8).map((h) => (
                <div key={h.code} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="text-[10px] text-slate-400 font-mono">รหัสหน่วยงาน: {h.code} (HDC: {h.hospcode})</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{h.hosname}</div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>อ.{h.amphur}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab: Monthly PEP Surveillance & Epidemiological Trend */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <MophMonthlyPepTrendChart selectedDistrict={selectedDistrict} pepData={pepData} />
        </div>
      )}

      {/* SubTab 2: 23 Districts HDC Matrix */}
      {activeSubTab === 'districts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  ตารางเปรียบเทียบตัวชี้วัดการฉีดวัคซีน 23 อำเภอ (MOPH HDC Matrix)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ข้อมูลทางการจาก HDC สสจ.นครศรีธรรมราช (คลิกหัวตารางเพื่อเรียงลำดับ)
                </p>
              </div>

              {/* Target indicator */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>เป้าหมายความครบชุด 5 เข็ม (F8): <strong>≥ 80.0%</strong></span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      อำเภอ {districtSortBy === 'name' ? (districtSortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th
                      onClick={() => handleSort('cont')}
                      className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      ผู้สัมผัส (cont) {districtSortBy === 'cont' ? (districtSortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th
                      onClick={() => handleSort('im_id')}
                      className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      เข็มหลัก (im_id) {districtSortBy === 'im_id' ? (districtSortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-3 py-3 text-right">กระตุ้น (booster)</th>
                    <th
                      onClick={() => handleSort('immu')}
                      className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      เซรุ่ม RIG (immu) {districtSortBy === 'immu' ? (districtSortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-3 py-3 text-right">ครบ 3 เข็ม (im3_id3)</th>
                    <th className="px-3 py-3 text-right">ครบ 5 เข็ม (im5_id4)</th>
                    <th className="px-3 py-3 text-right">อัตรา 3 เข็ม (F7)</th>
                    <th
                      onClick={() => handleSort('F8')}
                      className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      อัตรา 5 เข็ม (F8 %) {districtSortBy === 'F8' ? (districtSortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-3 py-3 text-center">สถานะเป้าหมาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHdcDistricts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                        ไม่พบข้อมูลอำเภอที่ตรงกับตัวกรอง
                      </td>
                    </tr>
                  ) : (
                    filteredHdcDistricts.map((row, idx) => {
                      const comp5Rate = row.rate_comp_5dose ?? (row as any).F8 ?? 0;
                      const comp3Rate = row.rate_comp_3dose ?? (row as any).F7 ?? 0;
                      const meetsTarget = comp5Rate >= 80;
                      const rowKey = row.amphur || row.hosname || `hdc-dist-${idx}`;
                      return (
                        <tr key={rowKey} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{row.amphur}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatNumber(row.cont)}</td>
                          <td className="px-3 py-2.5 text-right text-indigo-700 font-medium">{formatNumber(row.im_id)}</td>
                          <td className="px-3 py-2.5 text-right text-purple-700">{formatNumber(row.booster)}</td>
                          <td className="px-3 py-2.5 text-right text-rose-600 font-bold">{formatNumber(row.immu)}</td>
                          <td className="px-3 py-2.5 text-right text-slate-700">{formatNumber(row.im3_id3)}</td>
                          <td className="px-3 py-2.5 text-right text-emerald-700 font-bold">{formatNumber(row.im5_id4)}</td>
                          <td className="px-3 py-2.5 text-right font-medium text-slate-800">{comp3Rate}%</td>
                          <td className="px-3 py-2.5 text-right font-bold">
                            <span className={comp5Rate >= 70 ? 'text-emerald-600' : 'text-amber-600'}>
                              {comp5Rate}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              meetsTarget
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {meetsTarget ? '✓ ผ่านเกณฑ์ ≥80%' : 'ต้องเร่งรัด'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <DataSource source="HDC Open Data รายงาน s_rebies_overview สำนักงานสาธารณสุขจังหวัดนครศรีธรรมราช" />
          </div>
        </div>
      )}

      {/* SubTab 3: Demographics & Age Groups */}
      {activeSubTab === 'demographics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Group Breakdown Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                สัดส่วนผู้สัมผัสและการฉีดวัคซีนตามกลุ่มอายุ (MOPH HDC Age Tiers)
              </h4>
              <p className="text-xs text-slate-500">
                วิเคราะห์กลุ่มเปราะบาง: เด็กเล็ก (0-5 ปี) และเด็กวัยเรียน (6-14 ปี) มักมีบาดแผลรุนแรงบริเวณใบหน้า/ลำคอ
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDemographics} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="ageRange" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="totalExposed" name="ผู้สัมผัสทั้งหมด" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="primaryVac" name="ฉีดเข็มหลัก" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rigGiven" name="ได้รับ RIG" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {ageDemographics.map((age) => (
                  <div key={age.groupName} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: age.color }} />
                      <span className="font-bold text-slate-800">{age.groupName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span>ผู้สัมผัส: <strong>{formatNumber(age.totalExposed)}</strong> ราย</span>
                      <span>เซรุ่ม: <strong className="text-rose-600">{formatNumber(age.rigGiven)}</strong> ราย</span>
                      <span>ครบ 5 เข็ม: <strong className="text-emerald-600">{age.completedRate}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationality & Special Population Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                การเข้าถึงการฉีดวัคซีนจำแนกตามสัญชาติ (Thai vs Non-Thai)
              </h4>
              <p className="text-xs text-slate-500">
                ผู้สัมผัสโรคที่เป็นแรงงานต่างด้าว / ประชากรข้ามชาติ ในภาคการเกษตรและประมงนครศรีธรรมราช
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="text-xs font-bold text-blue-900">สัญชาติไทย (Thai Citizen)</div>
                  <div className="text-2xl font-bold text-blue-700">92.4%</div>
                  <div className="text-[11px] text-blue-800 leading-tight">
                    ได้รับการฉีดวัคซีนและติดตามครบถ้วนตามระบบหลักประกันสุขภาพแห่งชาติ
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-900">ต่างชาติ / แรงงานข้ามชาติ (Non-Thai)</div>
                  <div className="text-2xl font-bold text-amber-700">7.6%</div>
                  <div className="text-[11px] text-amber-800 leading-tight">
                    ความเสี่ยงขาดนัดสูงกว่ากลุ่มคนไทย 1.8 เท่า จำเป็นต้องมี อสต. ช่วยติดตาม
                  </div>
                </div>
              </div>

              {/* Priority Interventions Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>มาตรการเชิงรุกในการเพิ่มความครบชุด (PEP Retention Strategy)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>ระบบแจ้งเตือนทาง SMS / LINE Official ล่วงหน้า 1 วันก่อนถึงกำหนดนัดหมาย</li>
                  <li>ประสานงาน อสม. ในพื้นที่เคาะประตูบ้านเพื่อติดตามผู้ขาดนัดเข็ม 4 และ 5</li>
                  <li>แจกบัตรนัดฉีดวัคซีน 2 ภาษา (ไทย-พม่า) ให้แก่แรงงานต่างด้าวในพื้นที่ประมงและสวนยาง</li>
                </ul>
              </div>

              <DataSource source="ระบบงานควบคุมโรคติดต่อ สสจ.นครศรีธรรมราช" />
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Individual Patient Surveillance Register */}
      {activeSubTab === 'patients' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              ทะเบียนติดตามการฉีดวัคซีนรายบุคคล (PEP Patient Surveillance Register)
            </h4>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
              >
                <option value="all">ทุกสถานะความครบชุด</option>
                <option value="Yes">เฉพาะฉีดครบ (Completed)</option>
                <option value="In Progress">อยู่ระหว่างรับวัคซีน</option>
                <option value="No">ขาดนัด/ขาดยา (Drop-out)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">รหัสผู้ป่วย (HN)</th>
                  <th className="px-3 py-2.5">เพศ / อายุ</th>
                  <th className="px-3 py-2.5">อำเภอ / ตำบล</th>
                  <th className="px-3 py-2.5">ความรุนแรง</th>
                  <th className="px-3 py-2.5 text-center">Dose 0</th>
                  <th className="px-3 py-2.5 text-center">Dose 3</th>
                  <th className="px-3 py-2.5 text-center">Dose 7</th>
                  <th className="px-3 py-2.5 text-center">Dose 14</th>
                  <th className="px-3 py-2.5 text-center">Dose 28</th>
                  <th className="px-3 py-2.5 text-center">สถานะความครบชุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                      ไม่พบข้อมูลที่ตรงกับตัวกรอง
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row, idx) => {
                    const isCompleted = row.Completed_Course === 'Yes';
                    const isInProgress = row.Completed_Course === 'In Progress';
                    const patientKey = row.Patient_HN ? `${row.Patient_HN}-${idx}` : `pep-${idx}`;

                    return (
                      <tr key={patientKey} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-slate-900">{row.Patient_HN}</td>
                        <td className="px-3 py-2.5 text-slate-600">{row.Gender || '-'} ({row.Victim_Age || '-'} ปี)</td>
                        <td className="px-3 py-2.5 text-slate-800">
                          <span className="font-medium">{row.District}</span>
                          <span className="text-[11px] text-slate-500 block">ต.{row.SubDistrict}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            row.Severity_Category === 'Category III'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.Severity_Category || 'Category II'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{row.Dose_0_Date}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{row.Dose_3_Date}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{row.Dose_7_Date}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">
                          {row.Dose_14_Date.includes('Missed') ? (
                            <span className="text-rose-600 font-bold">ขาดนัด</span>
                          ) : (
                            row.Dose_14_Date
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{row.Dose_28_Date}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCompleted ? '✓ ครบชุด' : isInProgress ? '⏳ กำลังฉีด' : '✗ ขาดยา'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div>
              แสดงแถว {(currentPage - 1) * rowsPerPage + 1} ถึง {Math.min(currentPage * rowsPerPage, filteredPep.length)} จากทั้งหมด {filteredPep.length} รายการ
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                ก่อนหน้า
              </button>
              <span className="px-2 font-medium text-slate-700">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                ถัดไป
              </button>
            </div>
          </div>

          <DataSource source="ระบบ PEP_VAC ฐานข้อมูลเวชระเบียนผู้สัมผัสโรคพิษสุนัขบ้า จังหวัดนครศรีธรรมราช" />
        </div>
      )}

      {/* SubTab 5: Daily Auto-Sync Engine Controller */}
      {activeSubTab === 'autosync' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <MophDailySyncController
            onSyncSuccess={(newPep, newInterviews, msg) => {
              if (onUpdatePepData) {
                onUpdatePepData(newPep, newInterviews, msg);
              }
              setMophSyncSuccessMsg(msg);
              setTimeout(() => setMophSyncSuccessMsg(null), 6000);
            }}
          />
        </div>
      )}
    </div>
  );
};
