import React, { useState } from 'react';
import {
  ActiveNavTab,
  SheetMappingConfig,
  SheetDataMap,
  AppsScriptSettings,
  Dog2025Row,
  RabiesRow,
  KapRow,
  InterviewRow,
  PepVacRow
} from './types';
import {
  DEFAULT_SHEETS_CONFIG,
  INITIAL_DOG2025_DATA,
  INITIAL_RABIES_DATA,
  INITIAL_KAP_DATA,
  INITIAL_INTERVIEW_DATA,
  INITIAL_PEP_VAC_DATA,
} from './data/mockSurveillanceData';
import {
  buildFullSurveillanceDataMap,
  generateIncrementalBatch,
  TOTAL_SYSTEM_RECORDS,
  TARGET_ROW_COUNTS,
} from './data/surveillanceDataEngine';
import { FilterProvider } from './context/FilterContext';
import { Header } from './components/common/Header';

// One Health Surveillance Views
import { ExecutiveDashboard } from './components/views/ExecutiveDashboard';
import { GisMapView } from './components/views/GisMapView';
import { DistrictZoneView } from './components/views/DistrictZoneView';
import { AnimalPopulationView } from './components/views/AnimalPopulationView';
import { RabiesSituationView } from './components/views/RabiesSituationView';
import { PepAnalysisView } from './components/views/PepAnalysisView';
import { KapSurveyView } from './components/views/KapSurveyView';
import { QualitativeView } from './components/views/QualitativeView';
import { SituationTriangulationView } from './components/views/SituationTriangulationView';
import { RiskForecastingView } from './components/views/RiskForecastingView';

// Sync Hub Components
import { SyncOverview } from './components/SyncOverview';
import { AppsScriptStudio } from './components/AppsScriptStudio';
import { SurveillanceDataManager } from './components/SurveillanceDataManager';
import { SyncSimulator } from './components/SyncSimulator';
import { DocIdTester } from './components/DocIdTester';
import { TemplateExporter } from './components/TemplateExporter';

import {
  LayoutDashboard,
  Code2,
  Table,
  PlayCircle,
  Binary,
  Download,
  CheckCircle2,
  RefreshCw,
  Layers,
  Database
} from 'lucide-react';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isFullscreenRoute = urlParams.get('fullscreen') === 'true';
  const initialTab = (urlParams.get('tab') as ActiveNavTab) || 'executive';

  const [activeTab, setActiveTab] = useState<ActiveNavTab>(initialTab);
  const [syncSubTab, setSyncSubTab] = useState<string>('overview');
  const [lang, setLang] = useState<'th' | 'en'>('th');

  const [sheets, setSheets] = useState<SheetMappingConfig[]>(DEFAULT_SHEETS_CONFIG);
  // Initialize with full 18,983 Google Sheets data (KAP: 4469, DOG2025: 1013, RABIES: 2232, Interview: 2387, PEP_VAC: 8882)
  const [dataMap, setDataMap] = useState<SheetDataMap>(() => buildFullSurveillanceDataMap());
  const [globalToast, setGlobalToast] = useState<{ message: string; sub?: string } | null>(null);

  const [settings, setSettings] = useState<AppsScriptSettings>({
    projectId: 'one-health-3dd4f',
    serviceAccountEmail: 'your-service-account@one-health-3dd4f.iam.gserviceaccount.com',
    privateKeySnippet: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----',
    useScriptProperties: true,
    libraryId: '1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw',
    autoTimestampField: '_syncedAt',
    addSanitization: true,
  });

  const [rabiesImportMeta, setRabiesImportMeta] = useState<{
    isImported: boolean;
    sourceName?: string;
    importDate?: string;
    recordCount?: number;
    positiveCount?: number;
  } | null>(null);

  const dogData = dataMap.DOG2025 as Dog2025Row[];
  const rabiesData = dataMap.RABIES as RabiesRow[];
  const kapData = dataMap.KAP as KapRow[];
  const interviewData = dataMap.Interview as InterviewRow[];
  const pepData = dataMap.PEP_VAC as PepVacRow[];

  const totalRecordsCount = (Object.values(dataMap) as unknown[][]).reduce(
    (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
    0
  );

  const syncNavItems = [
    { id: 'overview', labelTh: 'ภาพรวมการซิงก์', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'script', labelTh: 'โค้ด Apps Script (.gs)', labelEn: 'Apps Script Studio', icon: Code2 },
    { id: 'data', labelTh: 'ตารางข้อมูล 5 ชีต', labelEn: 'Surveillance Data', icon: Table, badge: totalRecordsCount },
    { id: 'simulator', labelTh: 'จำลองการซิงก์ Firestore', labelEn: 'Sync Simulator', icon: PlayCircle },
    { id: 'slugTester', labelTh: 'ทดสอบสร้าง Doc ID', labelEn: 'Doc ID Sandbox', icon: Binary },
    { id: 'templates', labelTh: 'แม่แบบ Google Sheets', labelEn: 'Templates', icon: Download },
  ];

  const handleRefreshAllData = () => {
    const timestamp = new Date().toISOString();
    setDataMap((prev) => {
      const nextMap: SheetDataMap = {
        DOG2025: (prev.DOG2025 || []).map((r) => ({ ...r, _syncedAt: timestamp })),
        RABIES: (prev.RABIES || []).map((r) => ({ ...r, _syncedAt: timestamp })),
        KAP: (prev.KAP || []).map((r) => ({ ...r, _syncedAt: timestamp })),
        Interview: (prev.Interview || []).map((r) => ({ ...r, _syncedAt: timestamp })),
        PEP_VAC: (prev.PEP_VAC || []).map((r) => ({ ...r, _syncedAt: timestamp })),
      };
      return nextMap;
    });
    setGlobalToast({
      message: 'รีเฟรชประทับเวลาการซิงก์ (_syncedAt) สำเร็จ',
      sub: `อัปเดตสถานะข้อมูลทุกชีตรวม ${totalRecordsCount.toLocaleString()} แถว`,
    });
    setTimeout(() => setGlobalToast(null), 4500);
  };

  // Pull Incremental Update (+New records from field teams)
  const handlePullIncrementalUpdate = () => {
    const { updatedMap, addedCounts } = generateIncrementalBatch(dataMap, 35);
    setDataMap(updatedMap);
    const newTotal = (Object.values(updatedMap) as unknown[][]).reduce(
      (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
      0
    );
    setGlobalToast({
      message: `ดึงข้อมูลเข้าเพิ่มสำเร็จ! (+${addedCounts.total} แถวใหม่)`,
      sub: `PEP: +${addedCounts.PEP_VAC}, KAP: +${addedCounts.KAP}, RABIES: +${addedCounts.RABIES}, Interview: +${addedCounts.Interview}, DOG: +${addedCounts.DOG2025} (รวมทั้งหมด: ${newTotal.toLocaleString()} แถว)`,
    });
    setTimeout(() => setGlobalToast(null), 5000);
  };

  // MOPH Open Data API Update (s_rebies_overview ปี 2568 - ปัจจุบัน)
  const handleMophDataUpdate = (
    newPepRows: PepVacRow[],
    newInterviewRows?: InterviewRow[],
    summaryText?: string
  ) => {
    setDataMap((prev) => {
      const existingPep = prev.PEP_VAC || [];
      const existingInterviews = prev.Interview || [];

      // Prepend the new MOPH verified records
      return {
        ...prev,
        PEP_VAC: [...newPepRows, ...existingPep],
        Interview: newInterviewRows ? [...newInterviewRows, ...existingInterviews] : existingInterviews,
      };
    });

    setGlobalToast({
      message: 'ปรับปรุงข้อมูล MOPH Open Data (s_rebies_overview) สำเร็จ!',
      sub: summaryText || `อัปเดตข้อมูลการฉีดวัคซีนในคนครอบคลุม 23 อำเภอ นครศรีธรรมราช (ปี 2568 - ปัจจุบัน)`,
    });
    setTimeout(() => setGlobalToast(null), 5000);
  };

  // Animal Rabies Data Import (Thai Rabies Net / Lab Matrix / CSV / TSV)
  const handleUpdateRabiesData = (
    newRows: RabiesRow[],
    mode: 'replace' | 'append',
    summaryText: string,
    fileName?: string
  ) => {
    setDataMap((prev) => {
      const existing = prev.RABIES || [];
      const updated = mode === 'replace' ? newRows : [...newRows, ...existing];
      return {
        ...prev,
        RABIES: updated,
      };
    });

    const posCount = newRows.filter((r) => r.Result === 'Positive').length;
    setRabiesImportMeta({
      isImported: true,
      sourceName: fileName || 'ไฟล์นำเข้า (Thai Rabies Net)',
      importDate: new Date().toISOString(),
      recordCount: newRows.length,
      positiveCount: posCount,
    });

    setGlobalToast({
      message: 'นำเข้าข้อมูลผลตรวจโรคในสัตว์สำเร็จ!',
      sub: summaryText,
    });
    setTimeout(() => setGlobalToast(null), 6000);
  };

  const handleResetRabiesData = () => {
    const defaultRabies = buildFullSurveillanceDataMap().RABIES as RabiesRow[];
    setDataMap((prev) => ({
      ...prev,
      RABIES: defaultRabies,
    }));
    setRabiesImportMeta(null);
    setGlobalToast({
      message: 'รีเซ็ตข้อมูลผลตรวจโรคในสัตว์เป็นฐานข้อมูลมาตรฐานระบบแล้ว',
      sub: `คืนค่าข้อมูลเป็น 2,232 ตัวอย่าง (พ.ศ. 2555 - 2569)`,
    });
    setTimeout(() => setGlobalToast(null), 4000);
  };

  if (isFullscreenRoute && activeTab === 'gis') {
    return (
      <FilterProvider>
        <GisMapView
          dogData={dogData}
          rabiesData={rabiesData}
          pepData={pepData}
          forceFullscreen={true}
        />
      </FilterProvider>
    );
  }

  return (
    <FilterProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Global Toast Notification */}
        {globalToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-white">{globalToast.message}</div>
              {globalToast.sub && <div className="text-2xs text-slate-300">{globalToast.sub}</div>}
            </div>
            <button
              onClick={() => setGlobalToast(null)}
              className="text-slate-400 hover:text-white text-sm p-0.5 cursor-pointer ml-auto"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          {/* 1. Executive Dashboard */}
          {activeTab === 'executive' && (
            <ExecutiveDashboard
              dogData={dogData}
              rabiesData={rabiesData}
              kapData={kapData}
              interviewData={interviewData}
              pepData={pepData}
              onNavigate={setActiveTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* 2. Interactive GIS Map */}
          {activeTab === 'gis' && (
            <GisMapView
              dogData={dogData}
              rabiesData={rabiesData}
              pepData={pepData}
            />
          )}

          {/* 3. District Zone Classification */}
          {activeTab === 'zones' && (
            <DistrictZoneView
              dogData={dogData}
              rabiesData={rabiesData}
              pepData={pepData}
            />
          )}

          {/* 4. Animal Population & Vaccine Herd Immunity */}
          {activeTab === 'animal' && <AnimalPopulationView dogData={dogData} />}

          {/* 5. Rabies Surveillance Situation */}
          {activeTab === 'rabies' && (
            <RabiesSituationView
              rabiesData={rabiesData}
              onUpdateRabiesData={handleUpdateRabiesData}
              onResetRabiesData={handleResetRabiesData}
              importMeta={rabiesImportMeta}
            />
          )}

          {/* 6. Human PEP Care & Vaccine Tracking */}
          {activeTab === 'pep' && (
            <PepAnalysisView
              pepData={pepData}
              interviewData={interviewData}
              onUpdatePepData={handleMophDataUpdate}
            />
          )}

          {/* 7. KAP Community Survey Assessment */}
          {activeTab === 'kap' && <KapSurveyView kapData={kapData} />}

          {/* 8. Qualitative Insights & Policy Lessons */}
          {activeTab === 'qualitative' && <QualitativeView />}

          {/* 9. 3-Dimensional Triangulation */}
          {activeTab === 'situation' && (
            <SituationTriangulationView
              dogData={dogData}
              rabiesData={rabiesData}
              kapData={kapData}
              interviewData={interviewData}
              pepData={pepData}
            />
          )}

          {/* 10. Risk Forecasting Index (RRI) */}
          {activeTab === 'risk' && (
            <RiskForecastingView
              dogData={dogData}
              rabiesData={rabiesData}
              pepData={pepData}
            />
          )}

          {/* 11. Sync Hub (Google Sheets & Cloud Firestore) */}
          {activeTab === 'sync_hub' && (
            <div className="space-y-6">
              {/* Sync Hub Sub-Navigation Bar */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs">
                <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {syncNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = syncSubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSyncSubTab(item.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{item.labelTh}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-2xs font-mono ${
                              isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sync Sub-Tab Views */}
              <div className="transition-all duration-200">
                {syncSubTab === 'overview' && (
                  <SyncOverview
                    sheets={sheets}
                    totalRecordsCount={totalRecordsCount}
                    lang={lang}
                    onNavigateTab={(tab) => setSyncSubTab(tab)}
                  />
                )}

                {syncSubTab === 'script' && (
                  <AppsScriptStudio
                    sheets={sheets}
                    setSheets={setSheets}
                    settings={settings}
                    setSettings={setSettings}
                    lang={lang}
                  />
                )}

                {syncSubTab === 'data' && (
                  <SurveillanceDataManager
                    sheets={sheets}
                    dataMap={dataMap}
                    setDataMap={setDataMap}
                    lang={lang}
                  />
                )}

                {syncSubTab === 'simulator' && (
                  <SyncSimulator
                    sheets={sheets}
                    dataMap={dataMap}
                    projectId={settings.projectId}
                    lang={lang}
                  />
                )}

                {syncSubTab === 'slugTester' && <DocIdTester lang={lang} />}

                {syncSubTab === 'templates' && (
                  <TemplateExporter
                    sheets={sheets}
                    dataMap={dataMap}
                    lang={lang}
                  />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white dark:bg-slate-900 py-6 mt-auto no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-xs text-slate-500 dark:text-slate-400">
            {/* Top Row: System Name & Developer Credit */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">
                  One Health Rabies Dashboard — จังหวัดนครศรีธรรมราช
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">| โครงการสัตว์ปลอดโรค คนปลอดภัย</span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200">ปรับปรุงพัฒนาโดย:</span>{' '}
                <span className="text-slate-900 dark:text-white font-medium">สาโรจน์ ธีระกุล</span>{' '}
                <span className="text-slate-500 dark:text-slate-400">งานควบคุมโรคติดต่อ สำนักงานสาธารณสุขจังหวัดนครศรีธรรมราช</span>
              </div>
            </div>

            {/* Bottom Row: Inter-Agency Collaboration */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-2 text-xs leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                ความร่วมมือ:
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  รพ.สต./สสอ./รพ.ศ./ รพท. /รพช. /สสจ.นครศรีธรรมราช
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  ปศุสัตว์อำเภอ /ปศุสัตว์จังหวัดนครศรีธรรมราช /สำนักงานปศุสัตว์เขต 8
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  อปท. 23 อำเภอ / ท้องถิ่นจังหวัดนครศรีธรรมราช
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
