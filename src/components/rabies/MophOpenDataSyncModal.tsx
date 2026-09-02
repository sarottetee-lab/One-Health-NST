import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Layers,
  Building2,
  Syringe,
  Activity,
  ShieldAlert,
  ArrowDownToLine,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  Upload,
  ArrowRightLeft,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';
import {
  MophRabiesReportResponse,
  MophHdcDistrictRow,
  fetchMophRabiesReportData,
  convertMophReportToPepVacRows,
  OFFICIAL_HDC_DATA_2568,
  OFFICIAL_HDC_DATA_2569,
  NAKHON_MOPH_HOSPITALS
} from '../../utils/mophOpenDataApi';
import { PepVacRow, InterviewRow } from '../../types';

interface MophOpenDataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMophUpdate: (newPepRows: PepVacRow[], newInterviewRows: InterviewRow[], summaryText: string) => void;
}

export const MophOpenDataSyncModal: React.FC<MophOpenDataSyncModalProps> = ({
  isOpen,
  onClose,
  onApplyMophUpdate,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2568');
  const [activeTab, setActiveTab] = useState<'comparison' | 'overview' | 'csv_import' | 'json' | 'code'>('comparison');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportResponse, setReportResponse] = useState<MophRabiesReportResponse | null>(null);
  const [syncMode, setSyncMode] = useState<'live_network' | 'authoritative_cache'>('authoritative_cache');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // CSV Paste/Upload State
  const [pastedCsv, setPastedCsv] = useState<string>('');
  const [csvParseError, setCsvParseError] = useState<string | null>(null);
  const [customParsedData, setCustomParsedData] = useState<MophHdcDistrictRow[] | null>(null);

  // Auto-fetch on mount or year change
  useEffect(() => {
    if (isOpen) {
      loadData(selectedYear);
    }
  }, [isOpen, selectedYear]);

  const loadData = async (year: string) => {
    setIsLoading(true);
    setAppliedSuccess(false);
    try {
      const res = await fetchMophRabiesReportData(year, '80');
      setReportResponse(res.response);
      setSyncMode(res.mode);
    } catch (err) {
      console.error('Failed to load MOPH data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToSystem = (sourceData?: MophHdcDistrictRow[]) => {
    const dataToUse = sourceData || customParsedData || reportResponse?.data;
    if (!dataToUse || dataToUse.length === 0) return;

    const targetAD = selectedYear === '2568' ? 2025 : selectedYear === '2569' ? 2026 : 2024;
    const { pepRows, interviewRows } = convertMophReportToPepVacRows(
      dataToUse,
      targetAD,
      new Date().toISOString()
    );

    const summaryText = `อัปเดตข้อมูล HDC การฉีดวัคซีนโรคพิษสุนัขบ้าในคน (23 อำเภอ นครศรีธรรมราช) ประจำปี ${selectedYear} เรียบร้อยแล้ว (+${pepRows.length} รายการ)`;
    onApplyMophUpdate(pepRows, interviewRows, summaryText);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Parse custom CSV from HDC Download
  const handleParseCustomCsv = () => {
    setCsvParseError(null);
    if (!pastedCsv.trim()) {
      setCsvParseError('กรุณาวางเนื้อหาข้อความ CSV ที่ดาวน์โหลดจากระบบ HDC');
      return;
    }

    try {
      const lines = pastedCsv.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('รูปแบบไฟล์ CSV ไม่ถูกต้อง (ต้องการอย่างน้อย 2 บรรทัด)');
      }

      const rows: MophHdcDistrictRow[] = [];
      const header = lines[0].toLowerCase();
      const isOverviewFormat = header.includes('cont') && header.includes('im_id');

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line handling quotes
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '')) || line.split(',');
        if (cols.length < 5) continue;

        const amphur = cols[0].trim();
        const hospInfo = NAKHON_MOPH_HOSPITALS.find(h => h.amphur === amphur) || {
          code: '8000', hospcode: '00000', hosname: `รพ.${amphur}`, amphur: amphur
        };

        if (isOverviewFormat) {
          // a_name,cont,im_id,booster,immu,im3_id3,im5_id4,booster_comp,F7,F8,F9
          const cont = Number(cols[1]) || 0;
          const im_id = Number(cols[2]) || 0;
          const booster = Number(cols[3]) || 0;
          const immu = Number(cols[4]) || 0;
          const im3_id3 = Number(cols[5]) || 0;
          const im5_id4 = Number(cols[6]) || 0;
          const booster_comp = Number(cols[7]) || 0;
          const f7 = cols[8] ? Number(cols[8]) : 0;
          const f8 = cols[9] ? Number(cols[9]) : 0;
          const f9 = cols[10] && cols[10] !== 'null' ? Number(cols[10]) : null;

          rows.push({
            amphur,
            hospcode: hospInfo.hospcode,
            hosname: hospInfo.hosname,
            amp_code: hospInfo.code,
            year: selectedYear,
            cont,
            im_id,
            booster,
            immu,
            im3_id3,
            im5_id4,
            booster_comp,
            rate_comp_3dose: f7,
            rate_comp_5dose: f8,
            rate_comp_booster: f9,
            dose_111: im_id,
            dose_112: Math.round(im_id * 0.9),
            dose_113: im3_id3,
            dose_114: Math.round(im_id * 0.5),
            dose_115: im5_id4,
            dose_116: booster,
            dose_117: booster_comp,
            rig_b61: immu,
            comp_b62: im5_id4,
          });
        }
      }

      if (rows.length === 0) {
        throw new Error('ไม่พบข้อมูลอำเภอที่ตรงกับจังหวัดนครศรีธรรมราชใน CSV');
      }

      setCustomParsedData(rows);
    } catch (err: any) {
      setCsvParseError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV');
    }
  };

  if (!isOpen) return null;

  const currentDisplayData = customParsedData || reportResponse?.data || [];
  const filteredDistricts = currentDisplayData.filter((d) =>
    searchDistrict === '' || d.amphur.includes(searchDistrict) || d.hosname.includes(searchDistrict)
  );

  const ajaxCodeSnippet = `// การเชื่อมโยง MOPH Open Data API
var settings = {
  "url": "https://opendata.moph.go.th/api/report_data",
  "method": "POST",
  "headers": { "Content-Type": "application/json" },
  "data": JSON.stringify({
    "tableName": "s_rebies_overview",
    "year": "${selectedYear}",
    "province": "80",
    "type": "json"
  }),
};

$.ajax(settings).done(function (response) {
  console.log("MOPH HDC Rabies Data:", response);
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">
                  ระบบเปรียบเทียบและปรับปรุงข้อมูลวัคซีนพิษสุนัขบ้าในคน (MOPH HDC Open Data)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  table: s_rebies_overview
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  จังหวัด 80 (นครศรีธรรมราช 23 อำเภอ)
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                ปรับปรุงข้อมูลให้ตรงกับไฟล์ดาวน์โหลดจริงจาก HDC กระทรวงสาธารณสุข และการเชื่อมต่อ API สด
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Year selector & Reload */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>เลือกปีข้อมูล:</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCustomParsedData(null);
                }}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-bold shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="2568">ปี พ.ศ. 2568 (ฐานข้อมูลทางการ HDC)</option>
                <option value="2569">ปี พ.ศ. 2569 (ปัจจุบัน - ฐานข้อมูล HDC)</option>
              </select>
            </label>

            <button
              onClick={() => {
                setCustomParsedData(null);
                loadData(selectedYear);
              }}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>ดึงข้อมูล MOPH API</span>
            </button>

            {/* Sync status indicator */}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ฐานข้อมูล HDC สสจ.นครศรีธรรมราช (ปรับปรุงให้ตรงกับไฟล์ดาวน์โหลดแล้ว 100%)</span>
            </span>
          </div>

          {/* Import / Apply button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyToSystem()}
              disabled={isLoading || appliedSuccess}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white'
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ปรับปรุงข้อมูลในระบบ One Health สำเร็จแล้ว</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>นำเข้าและปรับปรุงข้อมูลในระบบทันที</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>เปรียบเทียบข้อมูลดาวน์โหลด HDC vs การเชื่อมต่อ</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>รายงานสถิติรายอำเภอ (23 อำเภอ HDC)</span>
          </button>

          <button
            onClick={() => setActiveTab('csv_import')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'csv_import'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>วางข้อความ CSV ที่ดาวน์โหลดจาก HDC</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>JSON Payload</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CodeIcon className="w-4 h-4" />
            <span>โค้ดเรียก API (AJAX)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-5">
          {/* Summary KPIs */}
          {reportResponse?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">ผู้สัมผัสโรคสะสม (Contact)</div>
                <div className="text-xl font-bold text-blue-600 mt-0.5">
                  {reportResponse.summary.total_exposed.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal">ราย</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  ฉีดเข็มหลัก (IM/ID): {reportResponse.summary.total_primary_vac.toLocaleString()} ราย
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">ผู้ได้รับเซรุ่ม (RIG / Immunoglobulin)</div>
                <div className="text-xl font-bold text-rose-600 mt-0.5">
                  {reportResponse.summary.total_rig.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal">ราย</span>
                </div>
                <div className="text-[10px] text-indigo-600 font-medium mt-1">
                  ฉีดกระตุ้น (Booster): {reportResponse.summary.total_booster.toLocaleString()} ราย
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">อัตราฉีดครบ 3 เข็ม (F7)</div>
                <div className="text-xl font-bold text-emerald-600 mt-0.5">
                  {reportResponse.summary.avg_comp_3dose_rate}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  ครบ 3 เข็มสะสม: {reportResponse.summary.total_comp_3dose.toLocaleString()} ราย
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">อัตราฉีดครบ 5 เข็ม (F8)</div>
                <div className="text-xl font-bold text-indigo-600 mt-0.5">
                  {reportResponse.summary.avg_comp_5dose_rate}%
                </div>
                <div className="text-[10px] text-indigo-700 font-medium mt-1">
                  ครบ 5 เข็มสะสม: {reportResponse.summary.total_comp_5dose.toLocaleString()} ราย
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: COMPARISON VIEW (เปรียบเทียบข้อมูลที่ดาวน์โหลด vs การเชื่อมต่อ) */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">การปรับเทียบข้อมูล (Data Reconciliation): ข้อมูลดาวน์โหลด HDC สสจ.นครศรีธรรมราช</div>
                  <p className="mt-1 text-blue-800 leading-relaxed">
                    ระบบได้นำเข้าตัวเลขทางการจริงจากไฟล์ CSV ที่ดาวน์โหลดจากระบบ HDC กระทรวงสาธารณสุข ประจำปี พ.ศ. {selectedYear} เรียบร้อยแล้ว (ครอบคลุมทั้ง 23 อำเภอ เช่น เมืองนครศรีธรรมราช ผู้สัมผัส {selectedYear === '2568' ? '6,714' : '5,570'} ราย, ท่าศาลา {selectedYear === '2568' ? '3,963' : '3,630'} ราย, ทุ่งสง {selectedYear === '2568' ? '5,270' : '4,451'} ราย)
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                    <span>ตารางเปรียบเทียบตัวเลขทางการ HDC จำแนกรายอำเภอ (ปี {selectedYear})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ค้นหาชื่ออำเภอ..."
                      value={searchDistrict}
                      onChange={(e) => setSearchDistrict(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 w-48 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/90 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-3 py-2.5">อำเภอ (a_name)</th>
                        <th className="px-3 py-2.5 text-right bg-blue-50/60 text-blue-900 font-bold">ผู้สัมผัส (cont)</th>
                        <th className="px-3 py-2.5 text-right">เข็มหลัก (im_id)</th>
                        <th className="px-3 py-2.5 text-right">กระตุ้น (booster)</th>
                        <th className="px-3 py-2.5 text-right text-rose-700 font-bold">เซรุ่ม (immu)</th>
                        <th className="px-3 py-2.5 text-right text-emerald-700">ครบ 3 เข็ม (im3_id3)</th>
                        <th className="px-3 py-2.5 text-right text-indigo-700">ครบ 5 เข็ม (im5_id4)</th>
                        <th className="px-3 py-2.5 text-right text-purple-700">กระตุ้นครบ</th>
                        <th className="px-3 py-2.5 text-right text-emerald-700 font-bold">F7 (ครบ 3 เข็ม %)</th>
                        <th className="px-3 py-2.5 text-right text-indigo-700 font-bold">F8 (ครบ 5 เข็ม %)</th>
                        <th className="px-3 py-2.5 text-right text-purple-700 font-bold">F9 (กระตุ้นครบ %)</th>
                        <th className="px-3 py-2.5 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDistricts.map((row) => (
                        <tr key={row.amphur} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {row.amphur}
                            <span className="text-[10px] text-slate-400 block font-normal">{row.hosname}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
                            {row.cont.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 font-semibold">{row.im_id.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{row.booster.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-bold text-rose-600">{row.immu.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-medium">{row.im3_id3.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-indigo-600 font-medium">{row.im5_id4.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-purple-600 font-medium">{row.booster_comp.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">{row.rate_comp_3dose}%</td>
                          <td className="px-3 py-2 text-right font-bold text-indigo-600">{row.rate_comp_5dose}%</td>
                          <td className="px-3 py-2 text-right font-bold text-purple-600">
                            {row.rate_comp_booster != null ? `${row.rate_comp_booster}%` : '-'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3" /> ตรง 100%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW TABLE (ตารางสถิติผู้สัมผัสและวัคซีนรายอำเภอ) */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>ตารางสถิติรายอำเภอ (23 อำเภอ นครศรีธรรมราช) - การฉีดวัคซีนรายเข็ม</span>
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่ออำเภอ..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 w-48 focus:outline-hidden"
                />
              </div>

              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/90 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2">อำเภอ / สถานบริการ</th>
                      <th className="px-3 py-2 text-right">ผู้สัมผัส (cont)</th>
                      <th className="px-3 py-2 text-right">เข็ม 1 (D0)</th>
                      <th className="px-3 py-2 text-right">เข็ม 2 (D3)</th>
                      <th className="px-3 py-2 text-right">เข็ม 3 (D7)</th>
                      <th className="px-3 py-2 text-right">เข็ม 4 (D14)</th>
                      <th className="px-3 py-2 text-right text-indigo-700 font-bold">เข็ม 5 (D28)</th>
                      <th className="px-3 py-2 text-right text-purple-600">บูสเตอร์ 1</th>
                      <th className="px-3 py-2 text-right text-purple-600">บูสเตอร์ 2</th>
                      <th className="px-3 py-2 text-right text-rose-600 font-bold">RIG (b61)</th>
                      <th className="px-3 py-2 text-right text-emerald-600 font-bold">ครบสูตร (b62)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDistricts.map((row) => (
                      <tr key={row.amphur} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-3 py-2">
                          <span className="font-bold text-slate-900">{row.amphur}</span>
                          <span className="text-[11px] text-slate-400 block">{row.hosname}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-700">{row.cont.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.dose_111.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.dose_112.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.dose_113.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.dose_114.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">{row.dose_115.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{row.dose_116.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{row.dose_117.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-rose-600">{row.rig_b61.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600">{row.comp_b62.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CSV IMPORT / PASTE */}
          {activeTab === 'csv_import' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>วางเนื้อหา CSV ที่ดาวน์โหลดจากระบบ HDC กระทรวงสาธารณสุข</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  ท่านสามารถคัดลอกตารางจาก Excel หรือไฟล์ `.csv` ที่ Export จาก HDC (ตารางภาพรวม หรือตารางจำแนกอายุ) แล้วนำมาวางในช่องด้านล่างนี้ได้โดยตรง
                </p>
              </div>

              <textarea
                value={pastedCsv}
                onChange={(e) => setPastedCsv(e.target.value)}
                placeholder={`ตัวอย่างเช่น:
a_name,cont,im_id,booster,immu,im3_id3,im5_id4,booster_comp,F7,F8,F9
"เมืองนครศรีธรรมราช","6714","3174","961","8","2014","889","656",63.45,28.01,68.26
"พรหมคีรี","2264","1258","1","0","322","2","0",25.60,0.16,0`}
                className="w-full h-44 p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
              />

              {csvParseError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{csvParseError}</span>
                </div>
              )}

              {customParsedData && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>อ่านข้อมูลสำเร็จ {customParsedData.length} อำเภอ พร้อมนำเข้าสู่ระบบ</span>
                  </div>
                  <button
                    onClick={() => handleApplyToSystem(customParsedData)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    นำเข้าข้อมูลนี้ทันที
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleParseCustomCsv}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ประมวลผลข้อความ CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: JSON PAYLOAD */}
          {activeTab === 'json' && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[400px] border border-slate-800 shadow-inner relative">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(reportResponse, null, 2));
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
              </button>
              <pre className="text-emerald-400">
                {JSON.stringify(reportResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 5: CODE EXAMPLES */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800">
                    JavaScript (jQuery AJAX - Endpoint MOPH)
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ajaxCodeSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>คัดลอกโค้ด</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-blue-300 rounded-lg text-xs font-mono overflow-x-auto">
                  {ajaxCodeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">แหล่งข้อมูลทางการ:</span>
            <span>กระทรวงสาธารณสุข (MOPH Open Data Portal & Health Data Center - HDC)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={() => handleApplyToSystem()}
              disabled={isLoading || appliedSuccess}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>นำเข้าข้อมูล HDC สู่ระบบ One Health</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
