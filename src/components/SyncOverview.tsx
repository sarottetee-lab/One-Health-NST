import React from 'react';
import { SheetMappingConfig } from '../types';
import { TARGET_ROW_COUNTS, TOTAL_SYSTEM_RECORDS } from '../data/surveillanceDataEngine';
import {
  Database,
  Key,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  RefreshCw,
  Sparkles,
  Table
} from 'lucide-react';

interface SyncOverviewProps {
  sheets: SheetMappingConfig[];
  totalRecordsCount: number;
  lang: 'th' | 'en';
  onNavigateTab: (tab: string) => void;
}

export const SyncOverview: React.FC<SyncOverviewProps> = ({
  sheets,
  totalRecordsCount,
  lang,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>{lang === 'th' ? 'สถาปัตยกรรม Upsert อัตโนมัติ' : 'Automated Idempotent Upsert Engine'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'th'
                ? 'เชื่อมต่อ Google Sheets สู่ Cloud Firestore แบบเรียลไทม์'
                : 'Bridge One Health Google Sheets directly into Cloud Firestore'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'th'
                ? 'ระบบประมวลผล Document ID จาก Composite Keys (Year + District + SubDistrict ฯลฯ) ป้องกันข้อมูลซ้ำซ้อนด้วยคำสั่ง createDocument / updateDocument พร้อมรองรับการดึงข้อมูลเข้าเพิ่มเมื่อมีการ Update'
                : 'Generates collision-free Document IDs from composite column keys. Supports atomic upserting via FirestoreApp library with automated ISO timestamp tagging.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={() => onNavigateTab('data')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'th' ? 'ดึงข้อมูลเข้าเพิ่ม / จัดการชีต' : 'Surveillance Data & Pull'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'th' ? 'เริ่มจำลองการซิงก์' : 'Launch Simulation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real Target Alignment Matrix */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'th' ? 'การเทียบเคียงขนาดข้อมูลจริง 5 ชีต One Health' : 'Google Sheets Target Matrix'}
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            รวมในระบบ: {totalRecordsCount.toLocaleString()} / {TOTAL_SYSTEM_RECORDS.toLocaleString()} แถว
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xs text-slate-500 block font-medium">ชีต KAP</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              {TARGET_ROW_COUNTS.KAP.toLocaleString()}
            </span>
            <span className="text-2xs text-emerald-600 block mt-0.5 font-medium">แถวตอบแบบสอบถาม</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xs text-slate-500 block font-medium">ชีต DOG2025</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              {TARGET_ROW_COUNTS.DOG2025.toLocaleString()}
            </span>
            <span className="text-2xs text-emerald-600 block mt-0.5 font-medium">แถวสำมะโนสัตว์ 23 อำเภอ</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xs text-slate-500 block font-medium">ชีต RABIES</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              {TARGET_ROW_COUNTS.RABIES.toLocaleString()}
            </span>
            <span className="text-2xs text-emerald-600 block mt-0.5 font-medium">แถวตรวจชันสูตรแล็บ</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xs text-slate-500 block font-medium">ชีต Interview</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              {TARGET_ROW_COUNTS.Interview.toLocaleString()}
            </span>
            <span className="text-2xs text-emerald-600 block mt-0.5 font-medium">แถวสอบสวนเคสถูกกัด</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xs text-slate-500 block font-medium">ชีต PEP_VAC</span>
            <span className="font-bold text-base text-slate-900 font-mono">
              {TARGET_ROW_COUNTS.PEP_VAC.toLocaleString()}
            </span>
            <span className="text-2xs text-emerald-600 block mt-0.5 font-medium">แถวติดตามวัคซีนคน</span>
          </div>
        </div>
      </div>

      {/* Grid of 5 Active Surveillance Datasets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-600 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'th' ? 'ชีตและคอลเลกชันที่กำหนดค่าไว้' : 'Configured Surveillance Collections'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {sheets.length} {lang === 'th' ? 'ชีต' : 'sheets'}
            </span>
          </h3>
          <span className="text-xs text-slate-600">
            {lang === 'th' ? 'ข้อมูลในระบบทั้งหมด:' : 'Total active records:'} <strong>{totalRecordsCount.toLocaleString()}</strong> {lang === 'th' ? 'แถว' : 'rows'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheetCfg) => {
            const keyDisplay = sheetCfg.keys.length > 0 ? sheetCfg.keys.join(' + ') : 'row-{index}';
            const target = TARGET_ROW_COUNTS[sheetCfg.sheet as keyof typeof TARGET_ROW_COUNTS] || 0;
            return (
              <div
                key={sheetCfg.sheet}
                className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                          <span>{sheetCfg.sheet}</span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <span>Firestore:</span>
                          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {sheetCfg.collection}/
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-slate-100 text-slate-700">
                      เป้า {target.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3.5 line-clamp-2">
                    {sheetCfg.description || 'Surveillance collection schema'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'th' ? 'คีย์สร้าง Doc ID:' : 'Document ID Keys:'}</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-md px-2 py-1 text-xs font-mono text-slate-700 truncate" title={keyDisplay}>
                    {keyDisplay}
                  </div>
                  <div className="flex items-center justify-between text-2xs text-slate-600 pt-1">
                    <span>Upsert: createDocument / updateDocument</span>
                    <button
                      onClick={() => onNavigateTab('data')}
                      className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline cursor-pointer"
                    >
                      {lang === 'th' ? 'ดูข้อมูล & ดึงเพิ่ม →' : 'Inspect & Pull →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Flow Architecture */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          <span>{lang === 'th' ? 'ขั้นตอนการทำงานของ Upsert ใน Google Apps Script' : 'How the Idempotent Upsert Works'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
              1
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">
              {lang === 'th' ? 'อ่านข้อมูลจาก Sheet' : 'Read Sheet Matrix'}
            </h4>
            <p className="text-slate-600">
              {lang === 'th'
                ? 'ดึง headers แถวที่ 1 และแปลงค่าเซลล์ทุกแถวเป็น Object พร้อมแปลง Date เป็น ISO String'
                : 'Reads headers from row 1, transforms cell values into clean objects and dates into ISO strings.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
              2
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">
              {lang === 'th' ? 'สร้าง Document ID' : 'Generate Safe Slug ID'}
            </h4>
            <p className="text-slate-600">
              {lang === 'th'
                ? 'นำค่าจาก keys มารวมกันด้วย __ และตัดอักขระต้องห้าม (/ \\ . # $ [ ]) ออกอัตโนมัติ'
                : 'Joins composite keys with "__", sanitizes forbidden Firestore characters (/ \\ . # $ [ ]).'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
              3
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">
              {lang === 'th' ? 'ตรวจสอบเอกสารเดิม' : 'Check Existence'}
            </h4>
            <p className="text-slate-600">
              {lang === 'th'
                ? 'เรียก firestore.getDocument(path) ใน try-catch เพื่อเช็คว่าเคยมีเอกสาร ID นี้ใน Firestore แล้วหรือไม่'
                : 'Invokes getDocument(path) inside a try-catch to determine whether record exists.'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
              4
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">
              {lang === 'th' ? 'Upsert ข้อมูลลงคลัง' : 'Atomic Upsert'}
            </h4>
            <p className="text-slate-600">
              {lang === 'th'
                ? 'ถ้ามีอยู่แล้วจะเรียก updateDocument(path, doc) หากยังไม่มีจะเรียก createDocument(path, doc)'
                : 'Dispatches updateDocument if found, otherwise executes createDocument with _syncedAt timestamp.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
