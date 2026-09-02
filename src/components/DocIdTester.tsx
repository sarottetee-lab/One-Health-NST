import React, { useState } from 'react';
import { slug, docIdFor, analyzeSlug } from '../utils/slugify';
import { Key, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

interface DocIdTesterProps {
  lang: 'th' | 'en';
}

export const DocIdTester: React.FC<DocIdTesterProps> = ({ lang }) => {
  const [testInput, setTestInput] = useState('2025/Maha Sarakham.Zone#3[Main]');
  const [compositeKeys, setCompositeKeys] = useState<{ field: string; value: string }[]>([
    { field: 'Year', value: '2025' },
    { field: 'District', value: 'Mueang / Maha Sarakham' },
    { field: 'Sub_District', value: 'Nai.Mueang #1' },
    { field: 'agency', value: 'DLD [Zone 3]' },
  ]);

  const singleAnalysis = analyzeSlug(testInput);

  // Composite calculation
  const compositeObj: Record<string, string> = {};
  const activeKeys: string[] = [];
  compositeKeys.forEach((item) => {
    if (item.field.trim()) {
      compositeObj[item.field.trim()] = item.value;
      activeKeys.push(item.field.trim());
    }
  });

  const generatedCompositeId = docIdFor(compositeObj, activeKeys, 1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {lang === 'th' ? 'เครื่องมือทดสอบ Document ID & การกรองอักขระ (Slug Sandbox)' : 'Document ID & Slug Algorithm Sandbox'}
        </h3>
        <p className="text-xs text-slate-500">
          {lang === 'th'
            ? 'ทดสอบการแปลงค่าในเซลล์ให้เป็น Document ID ที่ปลอดภัยตามกฎข้อกำหนดของ Cloud Firestore'
            : 'Test how cell values are sanitized into valid Cloud Firestore document identifiers.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single value sanitizer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'th' ? '1) ทดสอบการแปลงค่าเดี่ยว (slug_)' : '1) Single Field slug_() Tester'}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {lang === 'th' ? 'ข้อความทดสอบ (รวมอักขระพิเศษได้):' : 'Raw Input String:'}
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 2025/Maha Sarakham.Zone#3[Main]"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 text-2xs">
            <span className="text-slate-600 font-medium py-0.5">{lang === 'th' ? 'ตัวอย่าง:' : 'Presets:'}</span>
            <button
              onClick={() => setTestInput('Sub/District.01 #A')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
            >
              Sub/District.01 #A
            </button>
            <button
              onClick={() => setTestInput('HN$2025[Patient]')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
            >
              HN$2025[Patient]
            </button>
            <button
              onClick={() => setTestInput('ตำบลในเมือง อำเภอเมือง')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
            >
              Thai Unicode Text
            </button>
          </div>

          {/* Analysis output */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{lang === 'th' ? 'ผลลัพธ์ Slug ที่ได้:' : 'Sanitized Slug:'}</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded select-all">
                {singleAnalysis.sanitized || '(empty)'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1 text-2xs">
              <div className="flex items-center gap-1.5">
                {singleAnalysis.hasIllegalChars ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>
                  {singleAnalysis.hasIllegalChars
                    ? `${lang === 'th' ? 'ตรวจพบอักขระต้องห้ามที่ถูกเปลี่ยนเป็น "-":' : 'Forbidden chars sanitized:'} ${singleAnalysis.illegalCharsFound.join(' ')}`
                    : lang === 'th' ? 'ไม่มีอักขระต้องห้าม' : 'Clean of illegal characters'}
                </span>
              </div>
              <div className="text-slate-600">
                {lang === 'th'
                  ? `ความยาว: ${singleAnalysis.sanitized.length} / 80 ตัวอักษร`
                  : `Length: ${singleAnalysis.sanitized.length} / 80 characters max`}
              </div>
            </div>
          </div>
        </div>

        {/* Composite ID tester */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{lang === 'th' ? '2) จำลอง Composite Primary Keys (docIdFor_)' : '2) Composite Primary Key Generator'}</span>
          </div>

          <div className="space-y-2">
            {compositeKeys.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  value={item.field}
                  onChange={(e) => {
                    const newKeys = [...compositeKeys];
                    newKeys[idx].field = e.target.value;
                    setCompositeKeys(newKeys);
                  }}
                  className="col-span-4 font-mono px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-2xs"
                  placeholder="Key name"
                />
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => {
                    const newKeys = [...compositeKeys];
                    newKeys[idx].value = e.target.value;
                    setCompositeKeys(newKeys);
                  }}
                  className="col-span-8 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-2xs"
                  placeholder="Cell value"
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-emerald-300 space-y-2">
            <div className="text-slate-400 text-2xs uppercase font-sans font-semibold">
              {lang === 'th' ? 'Document ID ที่ได้ (คั่นด้วย __):' : 'Calculated Document ID:'}
            </div>
            <div className="text-emerald-400 font-bold break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
              {generatedCompositeId}
            </div>
            <div className="text-2xs text-slate-400 font-sans">
              Path: <code className="text-amber-300">DOG2025/{generatedCompositeId}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Explanation Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'th' ? 'ทำไม Firestore จึงห้ามใช้อักขระ / \\ . # $ [ ] ?' : 'Firestore Document ID Constraints & Rules'}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <code className="text-red-600 font-bold">/ (Forward Slash)</code>
            <p className="mt-1 text-2xs">
              {lang === 'th'
                ? 'Firestore ใช้ / เป็นตัวคั่นระดับ Collection/Doc/Subcollection จึงห้ามใช้ในชื่อ ID'
                : 'Used by Firestore SDK to delineate hierarchy levels (collection/doc/subcollection).'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <code className="text-red-600 font-bold">. (Dot) & .. (Double Dot)</code>
            <p className="mt-1 text-2xs">
              {lang === 'th'
                ? 'ชื่อเอกสารไม่สามารถเป็น . หรือ .. ได้เนื่องจากเป็นสัญลักษณ์อ้างอิง path ในระบบคลาวด์'
                : 'Document IDs cannot consist solely of a single period (.) or double periods (..).'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <code className="text-red-600 font-bold"># $ [ ] (Regex & URL Reserved)</code>
            <p className="mt-1 text-2xs">
              {lang === 'th'
                ? 'ป้องกันข้อผิดพลาดในการ encode URL และการทำ Regex matching ใน REST API'
                : 'Prevents URL encoding collisions and parsing errors in Firestore REST/gRPC endpoints.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
