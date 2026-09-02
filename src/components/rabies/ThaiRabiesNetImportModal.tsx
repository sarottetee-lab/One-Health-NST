import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  Table,
  Sparkles,
  ClipboardPaste,
  Layers,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Activity,
  MapPin,
  Check,
} from 'lucide-react';
import { RabiesRow } from '../../types';
import {
  parseRabiesRowsData,
  ParseRabiesFileResult,
  SAMPLE_THAI_RABIES_NET_CSV,
} from '../../utils/rabiesImportParser';

interface ThaiRabiesNetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newRows: RabiesRow[], mode: 'replace' | 'append', summary: string, fileName?: string) => void;
  existingData: RabiesRow[];
}

export const ThaiRabiesNetImportModal: React.FC<ThaiRabiesNetImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingData,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste' | 'preset'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseRabiesFileResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Official Thai Rabies Net CSV Template (114 columns)
  const handleDownloadOfficialTemplate = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_THAI_RABIES_NET_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thai_rabies_net_official_114col_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Pivot TSV Template
  const handleDownloadPivotTemplate = () => {
    const tsvContent =
      'COUNT ของ Received_Date\tปี\tผลตรวจ\t\t\t\t\t\t\n' +
      '\t\t2024\t\t2025\t\t2026\t\n' +
      'อำเภอ\tผลบวก\tผลลบ\tผลบวก\tผลลบ\tผลบวก\tผลลบ\n' +
      'เมืองนครศรีธรรมราช\t1\t24\t0\t10\t0\t6\n' +
      'ชะอวด\t2\t9\t0\t6\t0\t4\n' +
      'ร่อนพิบูลย์\t2\t8\t0\t6\t0\t5\n' +
      'ทุ่งสง\t0\t25\t0\t3\t0\t2\n' +
      'สิชล\t0\t14\t0\t5\t0\t3\n' +
      'พระพรหม\t1\t12\t2\t14\t2\t8\n';
    const blob = new Blob(['\uFEFF' + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rabies_pivot_matrix_template.tsv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const processFileContent = (content: string, fileName: string) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const parsed = parseRabiesRowsData(content);
      if (parsed.rows.length === 0) {
        throw new Error('ไม่พบรายการข้อมูลในไฟล์ที่นำเข้า');
      }
      setParseResult(parsed);
      setUploadedFileName(fileName);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการแปลผลข้อมูลไฟล์');
      setParseResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        processFileContent(text, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMsg('ไม่สามารถอ่านไฟล์ได้');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleProcessPasteText = () => {
    if (!pasteText.trim()) {
      setErrorMsg('กรุณาวางข้อความหรือตารางข้อมูลที่ต้องการนำเข้า');
      return;
    }
    processFileContent(pasteText, 'ตารางข้อมูลที่วาง (Pasted Thai Rabies Net / Matrix)');
  };

  const handleLoadOfficialSamplePreset = () => {
    processFileContent(SAMPLE_THAI_RABIES_NET_CSV, 'ไฟล์จริงส่งออกจากระบบ Thai Rabies Net (พ.ศ. 2568 - 2569)');
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.rows.length === 0) return;

    const bittenText = parseResult.summary.totalHumansBitten && parseResult.summary.totalHumansBitten > 0
      ? ` (คนถูกกัด ${parseResult.summary.totalHumansBitten} คน, สัมผัสน้ำลาย ${parseResult.summary.totalHumansSalivaExposed || 0} คน)`
      : '';

    const summary = `นำเข้าข้อมูลผลตรวจสัตว์จำนวน ${parseResult.summary.total.toLocaleString()} ตัวอย่าง (พบเชื้อ ${parseResult.summary.positives.toLocaleString()} ตัวอย่าง, ผลลบ ${parseResult.summary.negatives.toLocaleString()} ตัวอย่าง)${bittenText} ครอบคลุม ${parseResult.summary.districtsFound.length} อำเภอ`;

    onImportSuccess(parseResult.rows, importMode, summary, uploadedFileName);
    setParseResult(null);
    setPasteText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  นำเข้าข้อมูลสถานการณ์โรคในสัตว์ (Animal Rabies Surveillance Import)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  Thai Rabies Net Standard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                รองรับโครงสร้าง 114 คอลัมน์เต็มระบบ Thai Rabies Net (กรมปศุสัตว์) รวมถึงประวัติสัตว์ อาการกัดคน และพิกัดจริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Tabs: Upload File vs Paste Text vs Quick Preset */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => {
                setActiveInputMode('upload');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInputMode === 'upload'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              อัปโหลดไฟล์ (.csv / .tsv / .txt)
            </button>
            <button
              onClick={() => {
                setActiveInputMode('paste');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInputMode === 'paste'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              วางตารางข้อมูลโดยตรง (Paste Thai Rabies Net / TSV)
            </button>
            <button
              onClick={handleLoadOfficialSamplePreset}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer ml-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              โหลดชุดตัวอย่างจริง 2568-2569 (Thai Rabies Net)
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">เกิดข้อผิดพลาดในการประมวลผลไฟล์</div>
                <div>{errorMsg}</div>
              </div>
            </div>
          )}

          {!parseResult && (
            <div className="space-y-4">
              {/* Upload Mode */}
              {activeInputMode === 'upload' && (
                <div
                  className="border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt,.tab"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    คลิกเพื่อเลือกไฟล์ส่งออกจากระบบ Thai Rabies Net (.csv)
                  </div>
                  <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    ระบบรองรับไฟล์ส่งออกจากโปรแกรม Thai Rabies Net ของกรมปศุสัตว์แบบอัตโนมัติ (114 คอลัมน์) หรือไฟล์ Pivot Matrix สรุปผลตรวจ
                  </div>
                </div>
              )}

              {/* Paste Mode */}
              {activeInputMode === 'paste' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    วางข้อความตารางผลตรวจ (คัดลอกโดยตรงจากไฟล์ส่งออก Thai Rabies Net หรือตาราง Excel):
                  </label>
                  <textarea
                    rows={7}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="วางข้อมูล เช่น คำนำหน้า,ชื่อ,สกุล,ชื่อหน่วยงาน... หรือตาราง Pivot Table..."
                    className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50/50"
                  />
                  <button
                    onClick={handleProcessPasteText}
                    disabled={isProcessing || !pasteText.trim()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    ประมวลผลตารางข้อมูล
                  </button>
                </div>
              )}

              {/* Download Sample Templates & Presets */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600">
                  <div className="font-bold text-slate-800 mb-0.5">แม่แบบโครงสร้างไฟล์มาตรฐาน</div>
                  <div>ดาวน์โหลดโครงสร้างไฟล์ส่งออกจากระบบ Thai Rabies Net แท้จริง หรือตารางสรุปผลแล็บ</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadOfficialTemplate}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    แม่แบบ Thai Rabies Net (114 คอลัมน์)
                  </button>
                  <button
                    onClick={handleDownloadPivotTemplate}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    แม่แบบ Pivot Table Matrix
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parseResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>
                      อ่านข้อมูลสำเร็จจาก: <strong>{uploadedFileName || 'ไฟล์นำเข้า'}</strong>
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    {parseResult.summary.isOfficialThaiRabiesNet ? 'โครงสร้าง Thai Rabies Net แท้จริง' : parseResult.summary.isPivotFormat ? 'รูปแบบ Pivot Matrix' : 'CSV ทั่วไป'}
                  </span>
                </div>

                {/* Stat summary grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-slate-500 text-[10px]">ตัวอย่างส่งตรวจรวม</div>
                    <div className="text-base font-bold text-slate-900">
                      {parseResult.summary.total.toLocaleString()} ตัว
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100">
                    <div className="text-rose-500 text-[10px] font-semibold">ผลบวก (Positive)</div>
                    <div className="text-base font-bold text-rose-600">
                      {parseResult.summary.positives.toLocaleString()} ตัว
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-emerald-500 text-[10px] font-semibold">ผลลบ (Negative)</div>
                    <div className="text-base font-bold text-emerald-600">
                      {parseResult.summary.negatives.toLocaleString()} ตัว
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <div className="text-amber-700 text-[10px] font-semibold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> ผู้สัมผัส/ถูกกัด
                    </div>
                    <div className="text-xs font-bold text-amber-900 mt-0.5">
                      กัด {parseResult.summary.totalHumansBitten || 0} คน / สัมผัส {parseResult.summary.totalHumansSalivaExposed || 0} คน
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <div className="text-blue-500 text-[10px] font-semibold">พื้นที่ครอบคลุม</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {parseResult.summary.districtsFound.length} อำเภอ ({parseResult.summary.yearsFound.length > 0 ? `${parseResult.summary.yearsFound[0] + (parseResult.summary.yearsFound[0] < 2500 ? 543 : 0)}-${parseResult.summary.yearsFound[parseResult.summary.yearsFound.length - 1] + (parseResult.summary.yearsFound[parseResult.summary.yearsFound.length - 1] < 2500 ? 543 : 0)}` : 'ไม่ระบุ'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Import Action */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-800">เลือกวิธีการบันทึกข้อมูลเข้าสู่ระบบ:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-bold text-xs">แทนที่ข้อมูลเดิมทั้งหมด (Replace All)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ล้างข้อมูลสัตว์เดิมและใช้ข้อมูลชุดใหม่จากไฟล์นี้เป็นฐานข้อมูลหลัก (แนะนำ)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-bold text-xs">รวมต่อท้ายข้อมูลเดิม (Append & Merge)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        เพิ่มรายการใหม่เข้าไปร่วมกับฐานข้อมูลเดิมที่มีอยู่ ({existingData.length.toLocaleString()} รายการ)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table of Extracted Rows */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>ตัวอย่างข้อมูลที่ถอดรหัสได้ ({parseResult.rows.length.toLocaleString()} รายการ):</span>
                  <button
                    onClick={() => {
                      setParseResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    เลือกไฟล์อื่นใหม่
                  </button>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56 text-xs bg-white">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2">เลขที่ตัวอย่าง</th>
                        <th className="p-2">วันที่ตรวจ</th>
                        <th className="p-2">ชนิดสัตว์/ชื่อ</th>
                        <th className="p-2">อาการทางคลินิก</th>
                        <th className="p-2">ประวัติวัคซีน</th>
                        <th className="p-2">ผู้ถูกกัด/สัมผัส</th>
                        <th className="p-2">อำเภอ / ตำบล</th>
                        <th className="p-2">วิธีตรวจ</th>
                        <th className="p-2 text-center">ผลการตรวจ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.rows.slice(0, 8).map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-slate-900 text-2xs">
                            {r.Sample_No || r.Registration_ID}
                          </td>
                          <td className="p-2 text-slate-600 whitespace-nowrap">{r.Submission_Date}</td>
                          <td className="p-2 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">{r.Animal_Species}</span>
                            {r.Animal_Name && <span className="text-slate-500 ml-1">({r.Animal_Name})</span>}
                            <span className="text-slate-400 text-[10px] block">{r.Breed}</span>
                          </td>
                          <td className="p-2 max-w-[150px] truncate text-[11px] text-slate-600">
                            {r.Symptoms && r.Symptoms.length > 0 ? r.Symptoms.join(', ') : '-'}
                          </td>
                          <td className="p-2 text-slate-600 text-[11px] whitespace-nowrap">
                            {r.Vaccine_History || r.Owner_Type}
                          </td>
                          <td className="p-2 text-[11px] whitespace-nowrap">
                            {r.Human_Bitten_Count && r.Human_Bitten_Count > 0 ? (
                              <span className="text-rose-600 font-bold">กัด {r.Human_Bitten_Count} คน</span>
                            ) : r.Human_Saliva_Count && r.Human_Saliva_Count > 0 ? (
                              <span className="text-amber-600">สัมผัส {r.Human_Saliva_Count} คน</span>
                            ) : (
                              <span className="text-slate-400">ไม่กัดคน</span>
                            )}
                          </td>
                          <td className="p-2 whitespace-nowrap font-medium text-slate-800">
                            {r.District} <span className="text-slate-400 font-normal">({r.Sub_District})</span>
                          </td>
                          <td className="p-2 text-slate-500 whitespace-nowrap">{r.Test_Method}</td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
                                r.Result === 'Positive'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : r.Result === 'Negative'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {r.Diagnosis_Result || r.Result}
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.rows.length === 0}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            ยืนยันนำเข้าข้อมูลสู่ระบบ ({parseResult ? `${parseResult.summary.total.toLocaleString()} รายการ` : '0'})
          </button>
        </div>
      </div>
    </div>
  );
};
