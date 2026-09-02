import React, { useState } from 'react';
import { SheetMappingConfig, AppsScriptSettings } from '../types';
import { generateGoogleAppsScript } from '../utils/scriptGenerator';
import { Code, Copy, Check, Download, Plus, Trash2, Sliders, Shield, BookOpen, Key, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

interface AppsScriptStudioProps {
  sheets: SheetMappingConfig[];
  setSheets: React.Dispatch<React.SetStateAction<SheetMappingConfig[]>>;
  settings: AppsScriptSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppsScriptSettings>>;
  lang: 'th' | 'en';
}

export const AppsScriptStudio: React.FC<AppsScriptStudioProps> = ({
  sheets,
  setSheets,
  settings,
  setSettings,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'code' | 'sheetsConfig' | 'credentials' | 'guide'>('code');
  const [newSheetName, setNewSheetName] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newKeysInput, setNewKeysInput] = useState('');

  const generatedScript = generateGoogleAppsScript(sheets, settings);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([generatedScript], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim() || !newCollectionName.trim()) return;

    const parsedKeys = newKeysInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    setSheets((prev) => [
      ...prev,
      {
        sheet: newSheetName.trim(),
        collection: newCollectionName.trim(),
        keys: parsedKeys,
        description: `Custom sync mapping for ${newSheetName.trim()}`,
      },
    ]);

    setNewSheetName('');
    setNewCollectionName('');
    setNewKeysInput('');
  };

  const handleRemoveSheet = (sheetName: string) => {
    setSheets((prev) => prev.filter((s) => s.sheet !== sheetName));
  };

  const handleResetToDefault = () => {
    if (window.confirm(lang === 'th' ? 'ต้องการคืนค่าเริ่มต้น 5 ชีตระบาดวิทยาหรือไม่?' : 'Reset to default 5 surveillance sheets?')) {
      setSheets([
        { sheet: 'DOG2025', collection: 'DOG2025', keys: ['Year', 'District', 'Sub_District', 'agency'] },
        { sheet: 'RABIES', collection: 'RABIES', keys: ['Registration_ID'] },
        { sheet: 'KAP', collection: 'KAP', keys: ['id'] },
        { sheet: 'Interview', collection: 'Interview', keys: ['Timestamp'] },
        { sheet: 'PEP_VAC', collection: 'PEP_VAC', keys: ['Year', 'District', 'SubDistrict', 'Village'] },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'code'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'th' ? 'โค้ด Google Apps Script (.gs)' : 'Generated Script (.gs)'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sheetsConfig')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'sheetsConfig'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'th' ? 'กำหนดค่าชีต & Composite Keys' : 'Sheet & Key Mappings'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-2xs">
              {sheets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'credentials'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'th' ? 'ตั้งค่า Service Account & Project' : 'Project & Credentials'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'guide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>{lang === 'th' ? 'ขั้นตอนการติดตั้ง' : 'Setup Guide'}</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'th' ? 'คัดลอกสำเร็จ!' : 'Copied!') : (lang === 'th' ? 'คัดลอกโค้ดทั้งหมด' : 'Copy Script')}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'th' ? 'ดาวน์โหลด Code.gs' : 'Download .gs'}</span>
          </button>
        </div>
      </div>

      {/* SUB TAB: CODE VIEWER */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl text-xs font-mono border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-200 font-semibold ml-2">Code.gs — Google Apps Script</span>
            </div>
            <div className="flex items-center gap-3 text-2xs text-slate-400">
              <span>Library: <strong className="text-emerald-400 font-mono">FirestoreApp</strong></span>
              <span>Project: <strong className="text-amber-400 font-mono">{settings.projectId}</strong></span>
              <span>Sheets: <strong className="text-blue-400">{sheets.length}</strong></span>
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-b-xl border border-slate-900 p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto max-h-[580px] leading-relaxed shadow-inner selection:bg-emerald-900 selection:text-emerald-200">
            <pre className="whitespace-pre">{generatedScript}</pre>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold">
                {lang === 'th' ? 'คำแนะนำด้านความปลอดภัย (Security Best Practice):' : 'Security Best Practice:'}
              </strong>{' '}
              {lang === 'th'
                ? 'แนะนำให้นำค่า FB_CLIENT_EMAIL, FB_PRIVATE_KEY, FB_PROJECT_ID ไปใส่ใน Apps Script > Project Settings (รูปเฟือง) > Script Properties เพื่อป้องกันไม่ให้ข้อมูล Private Key ปรากฏในโค้ด'
                : 'Store your Service Account credentials inside Google Apps Script > Project Settings > Script Properties rather than hardcoding them.'}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: SHEETS MAPPING CONFIG */}
      {activeSubTab === 'sheetsConfig' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'th' ? 'จัดการการแมปชีตและ Composite Primary Keys' : 'Sheet to Collection Key Mappings'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'th'
                  ? 'กำหนดชื่อชีตที่จะอ่าน ชื่อคอลเลกชันใน Firestore และคอลัมน์ที่จะนำมาสร้าง Document ID'
                  : 'Configure source sheets, target Firestore collections, and composite key columns.'}
              </p>
            </div>
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{lang === 'th' ? 'คืนค่าเริ่มต้น' : 'Reset Defaults'}</span>
            </button>
          </div>

          {/* List of current mappings */}
          <div className="space-y-3">
            {sheets.map((item, idx) => (
              <div
                key={item.sheet}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.sheet}</span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.collection}/
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">{lang === 'th' ? 'Primary Keys:' : 'Keys:'}</span>
                      {item.keys.length > 0 ? (
                        item.keys.map((k) => (
                          <span key={k} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-2xs font-mono">
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-2xs">row-&#123;index&#125; (Fallback)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveSheet(item.sheet)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={lang === 'th' ? 'ลบการแมปนี้' : 'Delete mapping'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Sheet Mapping Form */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'th' ? 'เพิ่มการแมปชีตใหม่ (Add Sheet Mapping)' : 'Add New Sheet Mapping'}</span>
            </h4>

            <form onSubmit={handleAddSheet} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'ชื่อแท็บชีตใน Google Sheets' : 'Sheet Tab Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. LAB_RESULTS"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'ชื่อ Firestore Collection' : 'Firestore Collection'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. LAB_RESULTS"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'คอลัมน์คีย์ (คั่นด้วยจุลภาค)' : 'Key Columns (Comma-separated)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Year, Lab_ID, Province"
                  value={newKeysInput}
                  onChange={(e) => setNewKeysInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end mt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'th' ? 'บันทึกการแมป' : 'Add Mapping'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB TAB: CREDENTIALS & PROJECT */}
      {activeSubTab === 'credentials' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'th' ? 'กำหนดค่าโปรเจกต์ & บัญชีบริการ (Service Account)' : 'Project & Service Account Settings'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'th'
                ? 'ค่าเหล่านี้จะถูกนำไปใช้อัตโนมัติใน Google Apps Script ทั้งแบบ Script Properties และค่าเริ่มต้น'
                : 'These values are integrated directly into the generated Google Apps Script code.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Google Cloud / Firebase Project ID
              </label>
              <input
                type="text"
                value={settings.projectId}
                onChange={(e) => setSettings({ ...settings, projectId: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-2xs text-slate-400 mt-1 block">
                Default: <code className="text-slate-600">one-health-3dd4f</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Service Account Client Email
              </label>
              <input
                type="text"
                value={settings.serviceAccountEmail}
                onChange={(e) => setSettings({ ...settings, serviceAccountEmail: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-2xs text-slate-400 mt-1 block">
                e.g. <code className="text-slate-600">firebase-adminsdk-xxx@one-health-3dd4f.iam.gserviceaccount.com</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                FirestoreApp Library Script ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.libraryId}
                  readOnly
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(settings.libraryId);
                    alert(lang === 'th' ? 'คัดลอก Library ID แล้ว!' : 'Library ID copied!');
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs rounded-lg font-medium shrink-0"
                >
                  {lang === 'th' ? 'คัดลอก' : 'Copy'}
                </button>
              </div>
              <span className="text-2xs text-slate-400 mt-1 block">
                Official Google Apps Script Firestore library by gsuitedevs
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Timestamp Field Name in Firestore
              </label>
              <input
                type="text"
                value={settings.autoTimestampField}
                onChange={(e) => setSettings({ ...settings, autoTimestampField: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-2xs text-slate-400 mt-1 block">
                Default: <code className="text-slate-600">_syncedAt</code> (Stores ISO Date string)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: SETUP GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'th' ? 'คู่มือติดตั้งใน Google Sheets ทีละขั้นตอน' : 'Step-by-Step Installation Guide'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'th'
                ? 'ทำตาม 4 ขั้นตอนนี้เพื่อเปิดใช้งานการซิงก์อัตโนมัติจาก Google Sheets ไปยัง Firebase Firestore'
                : 'Follow these 4 simple steps to automate syncing from your Google Sheets to Firebase Firestore.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {lang === 'th' ? 'เปิด Apps Script และเพิ่ม Library FirestoreApp' : 'Open Apps Script & Add FirestoreApp Library'}
                </h4>
                <p className="text-slate-600">
                  {lang === 'th'
                    ? 'ใน Google Sheets ไปที่เมนู ส่วนขยาย (Extensions) > Apps Script > ด้านซ้ายกดเครื่องหมาย + ที่หัวข้อ คลังข้อมูล (Libraries)'
                    : 'In your Google Sheet, go to Extensions > Apps Script > Click the "+" next to Libraries on the left panel.'}
                </p>
                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono flex items-center justify-between gap-2">
                  <span className="truncate">{settings.libraryId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(settings.libraryId);
                      alert(lang === 'th' ? 'คัดลอก Library ID แล้ว' : 'Library ID copied');
                    }}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-2xs rounded font-sans shrink-0"
                  >
                    {lang === 'th' ? 'คัดลอก ID' : 'Copy ID'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {lang === 'th' ? 'วางโค้ดลงใน Code.gs' : 'Paste the Code into Code.gs'}
                </h4>
                <p className="text-slate-600">
                  {lang === 'th'
                    ? 'ลบโค้ดเดิมใน Code.gs แล้วคัดลอกโค้ดจากแถบ "โค้ด Google Apps Script (.gs)" ด้านบนไปวาง แล้วกดบันทึก (Ctrl+S หรือ Command+S)'
                    : 'Replace everything in Code.gs with the generated script above and save.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {lang === 'th' ? 'เพิ่ม Script Properties (ปลอดภัย ไม่ต้องใส่ Key ในโค้ด)' : 'Add Script Properties'}
                </h4>
                <p className="text-slate-600">
                  {lang === 'th'
                    ? 'ไปที่ การตั้งค่าโครงการ (Project Settings - รูปเฟือง) > เลื่อนลงมาที่ คุณสมบัติของสคริปต์ (Script Properties) > Add Script Property:'
                    : 'Navigate to Project Settings (Gear icon) > Script Properties > Add Property:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-2xs bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <strong>FB_CLIENT_EMAIL:</strong> client email จาก service account JSON
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <strong>FB_PRIVATE_KEY:</strong> private key ทั้งหมดรวม header/footer
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <strong>FB_PROJECT_ID:</strong> {settings.projectId}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {lang === 'th' ? 'ตั้งค่า Trigger หรือกดซิงก์จากเมนูบน Google Sheets' : 'Set Automated Time Trigger or Use Menu'}
                </h4>
                <p className="text-slate-600">
                  {lang === 'th'
                    ? 'เมื่อรีเฟรชหน้า Google Sheets จะมีเมนู "🔥 Firebase Firestore" โผล่ขึ้นมา สามารถกด "ซิงก์ทุกชีต" หรือไปที่เมนู ทริกเกอร์ (Triggers - รูปนาฬิกา) เพื่อตั้งค่าให้รันอัตโนมัติทุกวัน'
                    : 'Reload your spreadsheet to see the "Firebase Firestore" menu item, or set up a Daily time-driven trigger for syncAllSheets.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
