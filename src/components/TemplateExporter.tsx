import React, { useState } from 'react';
import { SheetMappingConfig, SheetDataMap } from '../types';
import { Download, Copy, Check, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface TemplateExporterProps {
  sheets: SheetMappingConfig[];
  dataMap: SheetDataMap;
  lang: 'th' | 'en';
}

export const TemplateExporter: React.FC<TemplateExporterProps> = ({
  sheets,
  dataMap,
  lang,
}) => {
  const [copiedSheet, setCopiedSheet] = useState<string | null>(null);

  const handleCopyHeaders = (sheetName: string) => {
    const rows = dataMap[sheetName] || [];
    if (!rows.length) return;

    const headers = Object.keys(rows[0]).filter((k) => k !== '_syncedAt');
    const headerString = headers.join('\t');
    navigator.clipboard.writeText(headerString);
    setCopiedSheet(sheetName);
    setTimeout(() => setCopiedSheet(null), 2000);
  };

  const handleDownloadCsv = (sheetName: string) => {
    const rows = dataMap[sheetName] || [];
    if (!rows.length) return;

    const headers = Object.keys(rows[0]).filter((k) => k !== '_syncedAt');
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '');
            return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {lang === 'th' ? 'ดาวน์โหลดแม่แบบ Google Sheets (Templates & CSV Export)' : 'Google Sheets Templates & Export Hub'}
        </h3>
        <p className="text-xs text-slate-500">
          {lang === 'th'
            ? 'คัดลอกส่วนหัวตาราง (Headers) ไปวางใน Google Sheets หรือดาวน์โหลดไฟล์ตัวอย่าง .CSV สำหรับเริ่มต้นโปรเจกต์'
            : 'Copy tab-separated headers to paste directly into Google Sheets or download CSV templates.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheets.map((sheetCfg) => {
          const rows = dataMap[sheetCfg.sheet] || [];
          const headers = rows.length ? Object.keys(rows[0]).filter((k) => k !== '_syncedAt') : [];
          const isCopied = copiedSheet === sheetCfg.sheet;

          return (
            <div
              key={sheetCfg.sheet}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{sheetCfg.sheet}</h4>
                    <span className="text-2xs text-slate-500 font-mono">
                      Firestore: {sheetCfg.collection}/
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {sheetCfg.description}
                </p>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                  <div className="text-2xs font-semibold text-slate-600 mb-1.5 uppercase">
                    {lang === 'th' ? 'คอลัมน์ทั้งหมด:' : 'Columns:'} ({headers.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {headers.map((h) => (
                      <span
                        key={h}
                        className={`text-2xs px-1.5 py-0.5 rounded font-mono ${
                          sheetCfg.keys.includes(h)
                            ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-200'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleCopyHeaders(sheetCfg.sheet)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-2xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? (lang === 'th' ? 'คัดลอกแล้ว!' : 'Copied!') : (lang === 'th' ? 'คัดลอก Headers' : 'Copy Headers')}</span>
                </button>
                <button
                  onClick={() => handleDownloadCsv(sheetCfg.sheet)}
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-2xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
