import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Layers,
  Radio,
  Table as TableIcon,
  TrendingUp,
  Upload,
  RefreshCw,
  Download,
  Database,
  Sparkles,
  Info,
  UserCheck,
  Eye,
  Activity,
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
} from 'recharts';
import { RabiesRow } from '../../types';
import { useFilter } from '../../context/FilterContext';
import { formatFullThaiDate, formatPercent, toBE } from '../../utils/thaiYear';
import { DataSource } from '../common/DataSource';
import { RabiesPivotTableSection } from '../rabies/RabiesPivotTableSection';
import { ThaiRabiesNetImportModal } from '../rabies/ThaiRabiesNetImportModal';
import { RabiesCaseDetailModal } from '../rabies/RabiesCaseDetailModal';
import { CascadingLocationFilter } from '../common/CascadingLocationFilter';
import { matchSubDistrict, matchVillage } from '../../data/nakhonDistricts';

interface RabiesSituationViewProps {
  rabiesData: RabiesRow[];
  onUpdateRabiesData?: (newRows: RabiesRow[], mode: 'replace' | 'append', summary: string, fileName?: string) => void;
  onResetRabiesData?: () => void;
  importMeta?: {
    isImported: boolean;
    sourceName?: string;
    importDate?: string;
    recordCount?: number;
    positiveCount?: number;
  } | null;
}

export const RabiesSituationView: React.FC<RabiesSituationViewProps> = ({
  rabiesData,
  onUpdateRabiesData,
  onResetRabiesData,
  importMeta,
}) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedDistrict,
    selectedSubDistrict,
    selectedVillage,
    searchQuery,
  } = useFilter();

  const [activeTab, setActiveTab] = useState<'pivot' | 'trends' | 'records'>('pivot');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [exposureFilter, setExposureFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<RabiesRow | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const rowsPerPage = 12;
  const isAllYears = selectedYear === 'all';
  const selectedYearBE = toBE(selectedYear);

  // Discover all available years in dataset dynamically
  const yearsListBE = useMemo(() => {
    const set = new Set<number>();
    rabiesData.forEach((r) => {
      let y = 2025;
      if (r.Submission_Date) {
        const parts = r.Submission_Date.split('-');
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed)) {
          y = parsed > 2500 ? parsed - 543 : parsed;
        }
      }
      set.add(y + 543);
    });
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.length > 0 ? arr : [2562, 2563, 2564, 2565, 2566, 2567, 2568, 2569];
  }, [rabiesData]);

  // Multi-Year Surveillance Summary dynamically derived
  const multiYearStats = useMemo(() => {
    return yearsListBE.map((yBE) => {
      const yearRecords = rabiesData.filter((r) => {
        let rowYear = 2569;
        if (r.Submission_Date) {
          const parts = r.Submission_Date.split('-');
          const parsed = parseInt(parts[0], 10);
          if (!isNaN(parsed)) {
            rowYear = parsed > 2500 ? parsed : parsed + 543;
          }
        }
        const matchYear = rowYear === yBE;
        const matchDist = selectedDistrict === 'all' || (r.District && r.District.includes(selectedDistrict));
        const matchSub = matchSubDistrict(r.Sub_District, selectedSubDistrict);
        const matchVil = matchVillage((r as any).Village || r.Sub_District, selectedVillage);
        return matchYear && matchDist && matchSub && matchVil;
      });

      const positives = yearRecords.filter((r) => r.Result === 'Positive').length;
      const total = yearRecords.length;
      const rate = total > 0 ? (positives / total) * 100 : 0;
      return {
        yearBE: yBE,
        yearAD: yBE - 543,
        total,
        positives,
        negatives: total - positives,
        rate,
      };
    });
  }, [rabiesData, yearsListBE, selectedDistrict, selectedSubDistrict, selectedVillage]);

  // Filter Rabies records
  const filteredData = useMemo(() => {
    return rabiesData.filter((item) => {
      let rowYear = 2569;
      if (item.Submission_Date) {
        const parts = item.Submission_Date.split('-');
        const parsed = parseInt(parts[0], 10);
        if (!isNaN(parsed)) {
          rowYear = parsed > 2500 ? parsed : parsed + 543;
        }
      }

      const matchYear = isAllYears || rowYear === selectedYearBE;
      const matchDist = selectedDistrict === 'all' || (item.District && item.District.includes(selectedDistrict));
      const matchSub = matchSubDistrict(item.Sub_District, selectedSubDistrict);
      const matchVil = matchVillage((item as any).Village || item.Sub_District, selectedVillage);
      const matchResult = resultFilter === 'all' || item.Result === resultFilter;
      const matchSpecies = speciesFilter === 'all' || item.Animal_Species.includes(speciesFilter);
      
      const hasBitten = (item.Human_Bitten_Count && item.Human_Bitten_Count > 0) || item.Human_Exposure_Status === 'กัดคน';
      const hasSaliva = (item.Human_Saliva_Count && item.Human_Saliva_Count > 0) || item.Human_Exposure_Status === 'สัมผัสน้ำลาย';
      const matchExposure =
        exposureFilter === 'all' ||
        (exposureFilter === 'bitten' && hasBitten) ||
        (exposureFilter === 'saliva' && (hasSaliva || hasBitten));

      const matchSearch =
        searchQuery === '' ||
        item.Registration_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.Sample_No && item.Sample_No.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.Animal_Name && item.Animal_Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.District.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Sub_District.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Animal_Species.toLowerCase().includes(searchQuery.toLowerCase());

      return matchYear && matchDist && matchSub && matchVil && matchResult && matchSpecies && matchExposure && matchSearch;
    });
  }, [
    rabiesData,
    isAllYears,
    selectedYearBE,
    selectedDistrict,
    selectedSubDistrict,
    selectedVillage,
    resultFilter,
    speciesFilter,
    exposureFilter,
    searchQuery,
  ]);

  const totalTested = filteredData.length;
  const positiveCount = filteredData.filter((r) => r.Result === 'Positive').length;
  const negativeCount = filteredData.filter((r) => r.Result === 'Negative').length;
  const pendingCount = filteredData.filter((r) => r.Result === 'Pending' || r.Result === 'Inconclusive').length;
  const positivityRate = totalTested > 0 ? (positiveCount / totalTested) * 100 : 0;

  const totalHumansBitten = filteredData.reduce((acc, r) => acc + (r.Human_Bitten_Count || 0), 0);
  const totalHumansSaliva = filteredData.reduce((acc, r) => acc + (r.Human_Saliva_Count || 0), 0);

  // Species Pie Data
  const speciesPieData = useMemo(() => {
    return [
      { name: 'สุนัข (Canine)', value: filteredData.filter((r) => r.Animal_Species.includes('สุนัข')).length, color: '#f97316' },
      { name: 'แมว (Feline)', value: filteredData.filter((r) => r.Animal_Species.includes('แมว')).length, color: '#8b5cf6' },
      { name: 'โค/กระบือ (Bovine)', value: filteredData.filter((r) => r.Animal_Species.includes('โค')).length, color: '#0ea5e9' },
      {
        name: 'อื่นๆ (Other)',
        value: filteredData.filter((r) => !['สุนัข', 'แมว', 'โค'].some((sp) => r.Animal_Species.includes(sp))).length,
        color: '#64748b',
      },
    ].filter((item) => item.value > 0);
  }, [filteredData]);

  // Test Results Pie Data
  const resultsPieData = [
    { name: 'ผลบวกพบเชื้อ (Positive)', value: positiveCount, color: '#ef4444' },
    { name: 'ผลลบไม่พบเชื้อ (Negative)', value: negativeCount, color: '#10b981' },
    { name: 'รอผลแล็บ/ไม่สรุป', value: pendingCount, color: '#f59e0b' },
  ];

  // Export current dataset to CSV
  const handleExportCsv = () => {
    const headers = [
      'Registration_ID',
      'Sample_No',
      'Animal_Species',
      'Breed',
      'Animal_Name',
      'Owner_Type',
      'Submission_Date',
      'Symptoms',
      'Human_Bitten_Count',
      'Human_Saliva_Count',
      'Vaccine_History',
      'Test_Method',
      'Result',
      'Province',
      'District',
      'Sub_District',
      'Lat',
      'Lng',
    ];
    const rows = filteredData.map((r) => [
      r.Registration_ID,
      r.Sample_No || '',
      r.Animal_Species,
      r.Breed,
      r.Animal_Name || '',
      r.Owner_Type,
      r.Submission_Date,
      (r.Symptoms || []).join('; '),
      r.Human_Bitten_Count || 0,
      r.Human_Saliva_Count || 0,
      r.Vaccine_History || '',
      r.Test_Method,
      r.Result,
      r.Province,
      r.District,
      r.Sub_District,
      r.Lat,
      r.Lng,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rabies_animal_surveillance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const displayedRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const positiveCases = filteredData.filter((r) => r.Result === 'Positive');

  return (
    <div id="rabies-situation-view" className="space-y-6">
      {/* Case Detail Modal */}
      {selectedCaseForDetail && (
        <RabiesCaseDetailModal
          caseData={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ThaiRabiesNetImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          existingData={rabiesData}
          onImportSuccess={(newRows, mode, summary, fileName) => {
            if (onUpdateRabiesData) {
              onUpdateRabiesData(newRows, mode, summary, fileName);
            }
            setImportSuccessMsg(summary);
            setTimeout(() => setImportSuccessMsg(null), 6000);
          }}
        />
      )}

      {/* Top Banner & Primary Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              การเฝ้าระวังทางห้องปฏิบัติการ (Laboratory Animal Rabies Surveillance)
            </span>
            {importMeta?.isImported ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                ใช้ข้อมูลนำเข้าจากไฟล์: {importMeta.sourceName || 'Thai Rabies Net'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                ฐานข้อมูลทางการระบบ Thai Rabies Net ({rabiesData.length.toLocaleString()} ตัวอย่าง)
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            สถานการณ์โรคพิษสุนัขบ้าในสัตว์ จังหวัดนครศรีธรรมราช
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            โครงสร้างนำเข้าและวิเคราะห์ตามมาตรฐานระบบสารสนเทศโรคระบาดสัตว์ Thai Rabies Net (กรมปศุสัตว์)
          </p>
        </div>

        {/* Action Controls & Alert Box */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Import from file button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            นำเข้าข้อมูล Thai Rabies Net (.csv / Pivot)
          </button>

          {/* Reset button if imported */}
          {importMeta?.isImported && onResetRabiesData && (
            <button
              onClick={onResetRabiesData}
              title="คืนค่าข้อมูลเป็นฐานข้อมูลมาตรฐานระบบ"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              รีเซ็ตข้อมูลเดิม
            </button>
          )}

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            ส่งออก CSV
          </button>

          {/* Positive Summary Alert Box */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              positiveCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 ${positiveCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
            <div>
              <div className="text-[10px] font-semibold uppercase">
                {positiveCount > 0 ? 'พบสัตว์ติดเชื้อยืนยัน' : 'ไม่พบสัตว์ติดเชื้อ'}
              </div>
              <div className="text-xs font-bold">
                {positiveCount} ตัวอย่าง (ผลบวก {formatPercent(positivityRate)})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {importSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{importSuccessMsg}</span>
          </div>
          <button
            onClick={() => setImportSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Cascading Location & Timeframe Filter (ปี, อำเภอ, ตำบล, หมู่ที่) */}
      <CascadingLocationFilter />

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ตัวอย่างส่งตรวจรวม</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalTested.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ตัวอย่าง</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            {isAllYears
              ? `รวมทุกปี (${yearsListBE[0] || 2555} - ${yearsListBE[yearsListBE.length - 1] || 2569})`
              : `ประจำปี พ.ศ. ${selectedYearBE}`}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ผลบวก (Positive)</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {positiveCount.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ตัวอย่าง</span>
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            ต้องควบคุมรัศมี 3 และ 5 กม.
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ผู้ถูกกัด & สัมผัสน้ำลาย</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {totalHumansBitten + totalHumansSaliva} <span className="text-xs text-slate-500 font-normal">คน</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            ถูกกัด {totalHumansBitten} คน / สัมผัสน้ำลาย {totalHumansSaliva} คน
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ผลลบ (Negative)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {negativeCount.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ตัวอย่าง</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ตรวจไม่พบเชื้อไวรัสพิษสุนัขบ้า
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pivot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'pivot'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4 text-indigo-400" />
            ตาราง Pivot Table ผลตรวจจริง ({yearsListBE[0] || 2555} - {yearsListBE[yearsListBE.length - 1] || 2569})
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'trends'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-rose-200" />
            แนวโน้มรายปีและจุดเกิดโรค (Trends & 5km Buffer)
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'records'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            รายการตัวอย่างส่งตรวจ ({filteredData.length.toLocaleString()} รายการ)
          </button>
        </div>

        {activeTab === 'trends' && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedYear === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทุกปี
            </button>
            {yearsListBE.slice(-8).map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedYear === y
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Pivot Table View with dynamic rabiesData */}
      {activeTab === 'pivot' && (
        <RabiesPivotTableSection rabiesData={rabiesData} />
      )}

      {/* TAB 2: Trends and Outbreak Spots */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Multi-Year Confirmed Positives Surveillance Trend */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    สถิติย้อนหลังรายปี ({yearsListBE[0] || 2555} - {yearsListBE[yearsListBE.length - 1] || 2569})
                  </span>
                  <span className="text-xs text-slate-500 font-medium">รวม {rabiesData.length.toLocaleString()} ตัวอย่าง</span>
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 mt-1">
                  แนวโน้มสัตว์ยืนยันพบเชื้อโรคพิษสุนัขบ้ารายปี (Annual Confirmed Positive Trends)
                </h3>
              </div>
            </div>

            {/* Multi-Year Chart */}
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiYearStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="yearBE" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#e11d48' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(value: any, name: string) => [
                      name === 'positives' ? `${value} ตัวอย่าง (พบเชื้อ)` : `${value} ตัวอย่าง`,
                      name === 'positives' ? 'สัตว์ยืนยันพบเชื้อ' : 'ตัวอย่างส่งตรวจรวม',
                    ]}
                    labelFormatter={(label) => `พ.ศ. ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="total" name="ตัวอย่างส่งตรวจรวม" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="positives" name="สัตว์ยืนยันพบเชื้อ (ผลบวก)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Mini Cards per Year */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-100">
              {multiYearStats.slice(-8).map((item) => {
                const isSelected = selectedYear === item.yearBE || (selectedYear === 'all' && item.yearBE === 2569);
                return (
                  <div
                    key={item.yearBE}
                    onClick={() => setSelectedYear(item.yearBE)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-700">พ.ศ. {item.yearBE}</div>
                    <div className="text-base font-extrabold text-rose-600 my-0.5">
                      {item.positives} <span className="text-[10px] text-slate-500 font-normal">บวก</span>
                    </div>
                    <div className="text-[10px] text-slate-500">ตรวจ {item.total} ตัว</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Charts & Positive Spot Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Positive Outbreak Spot & Radius Notification */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-800 font-heading mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  จุดเกิดโรคสัตว์ติดเชื้อและรัศมีควบคุมโรค (Outbreak Spots & Buffer Zones)
                </h4>

                {positiveCases.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs border border-dashed border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    ไม่พบจุดเกิดโรคผลบวกในพื้นที่หรือเงื่อนไขที่เลือก
                  </div>
                ) : (
                  <div className="space-y-3">
                    {positiveCases.slice(0, 6).map((caseItem) => (
                      <div
                        key={caseItem.Registration_ID}
                        onClick={() => setSelectedCaseForDetail(caseItem)}
                        className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{caseItem.Sample_No || caseItem.Registration_ID}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                              {caseItem.Animal_Species} {caseItem.Animal_Name ? `(${caseItem.Animal_Name})` : ''}
                            </span>
                            <span className="text-slate-500">{formatFullThaiDate(caseItem.Submission_Date)}</span>
                          </div>
                          <div className="text-slate-600 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            ต.{caseItem.Sub_District} อ.{caseItem.District} จ.{caseItem.Province} ({caseItem.Owner_Type})
                          </div>
                          {caseItem.Human_Bitten_Count && caseItem.Human_Bitten_Count > 0 && (
                            <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> มีประวัติกัดคน {caseItem.Human_Bitten_Count} คน
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCaseForDetail(caseItem);
                            }}
                            className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-rose-600" />
                            ดูรายละเอียดเคส
                          </button>
                        </div>
                      </div>
                    ))}

                    {positiveCases.length > 6 && (
                      <div className="text-center text-xs text-slate-500 pt-1">
                        และอีก {positiveCases.length - 6} จุดเกิดโรคในชุดข้อมูล
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Species & Result Distributions */}
            <div className="space-y-6">
              {/* Species Distribution Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 font-heading mb-2">
                  สัดส่วนชนิดสัตว์ส่งตรวจ (Animal Species)
                </h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {speciesPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: string) => [`${val} ตัวอย่าง`, name]}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                  {speciesPieData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-slate-600">{s.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{s.value} ตัว</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Results Distribution */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 font-heading mb-2">
                  ผลการตรวจวินิจฉัยทางแล็บ (Diagnostic Results)
                </h4>
                <div className="space-y-2.5 text-xs pt-1">
                  {resultsPieData.map((res) => {
                    const pct = totalTested > 0 ? (res.value / totalTested) * 100 : 0;
                    return (
                      <div key={res.name} className="space-y-1">
                        <div className="flex justify-between text-slate-700">
                          <span>{res.name}</span>
                          <span className="font-bold">{res.value} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: res.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sample Records Table */}
      {activeTab === 'records' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-800 font-heading">
              รายการตัวอย่างส่งตรวจจากระบบ Thai Rabies Net (รวม {filteredData.length.toLocaleString()} รายการ)
            </h4>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={exposureFilter}
                onChange={(e) => setExposureFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
              >
                <option value="all">ประวัติคนถูกกัดทั้งหมด</option>
                <option value="bitten">เฉพาะมีคนถูกกัด</option>
                <option value="saliva">มีสัมผัสน้ำลาย/กัดคน</option>
              </select>

              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
              >
                <option value="all">ทุกชนิดสัตว์</option>
                <option value="สุนัข">สุนัข</option>
                <option value="แมว">แมว</option>
                <option value="โค">โค</option>
              </select>

              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
              >
                <option value="all">ทุกผลการตรวจ</option>
                <option value="Positive">เฉพาะผลบวก (Positive)</option>
                <option value="Negative">เฉพาะผลลบ (Negative)</option>
                <option value="Pending">รอผลตรวจ / ตรวจไม่ได้</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">รหัสตัวอย่าง</th>
                  <th className="px-3 py-2.5">วันที่ตรวจ</th>
                  <th className="px-3 py-2.5">ชนิดสัตว์ & สายพันธุ์</th>
                  <th className="px-3 py-2.5">อาการทางคลินิก</th>
                  <th className="px-3 py-2.5">คนถูกกัด/สัมผัส</th>
                  <th className="px-3 py-2.5">อำเภอ</th>
                  <th className="px-3 py-2.5">ตำบล</th>
                  <th className="px-3 py-2.5">วิธีตรวจ</th>
                  <th className="px-3 py-2.5 text-center">ผลการตรวจ</th>
                  <th className="px-3 py-2.5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-slate-400">
                      ไม่พบข้อมูลการส่งตรวจที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row) => {
                    const isPositive = row.Result === 'Positive';
                    const isNegative = row.Result === 'Negative';
                    return (
                      <tr
                        key={row.Registration_ID}
                        onClick={() => setSelectedCaseForDetail(row)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-2.5 font-bold text-slate-900 font-mono">
                          {row.Sample_No || row.Registration_ID}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatFullThaiDate(row.Submission_Date)}</td>
                        <td className="px-3 py-2.5 text-slate-800 whitespace-nowrap">
                          <span className="font-semibold">{row.Animal_Species}</span>
                          {row.Animal_Name && <span className="text-slate-500 ml-1">({row.Animal_Name})</span>}
                          <span className="text-slate-400 text-[11px] block">{row.Breed}</span>
                        </td>
                        <td className="px-3 py-2.5 max-w-[140px] truncate text-[11px] text-slate-600">
                          {row.Symptoms && row.Symptoms.length > 0 ? row.Symptoms.join(', ') : '-'}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {row.Human_Bitten_Count && row.Human_Bitten_Count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              กัด {row.Human_Bitten_Count} คน
                            </span>
                          ) : row.Human_Saliva_Count && row.Human_Saliva_Count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              สัมผัส {row.Human_Saliva_Count} คน
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">{row.District}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.Sub_District}</td>
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.Test_Method}</td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isPositive
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isNegative
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {row.Diagnosis_Result || row.Result}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCaseForDetail(row);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="ดูรายละเอียดฉบับเต็ม"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
              แสดงแถว {(currentPage - 1) * rowsPerPage + 1} ถึง{' '}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} จากทั้งหมด{' '}
              {filteredData.length.toLocaleString()} รายการ
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

          <DataSource source="ศูนย์สารสนเทศโรคระบาดสัตว์ กรมปศุสัตว์ / กรมควบคุมโรค (Thai Rabies Net)" />
        </div>
      )}
    </div>
  );
};
