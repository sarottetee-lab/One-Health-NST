import React, { useState } from 'react';
import { SheetMappingConfig, SheetDataMap, SyncSimulationLog, SyncSimulationStats } from '../types';
import { docIdFor } from '../utils/slugify';
import { Play, RefreshCw, Terminal, CheckCircle2, AlertCircle, Database, Layers, ArrowUpRight, ShieldCheck, Clock, FileText } from 'lucide-react';

interface SyncSimulatorProps {
  sheets: SheetMappingConfig[];
  dataMap: SheetDataMap;
  projectId: string;
  lang: 'th' | 'en';
}

export const SyncSimulator: React.FC<SyncSimulatorProps> = ({
  sheets,
  dataMap,
  projectId,
  lang,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<SyncSimulationLog[]>([]);
  const [stats, setStats] = useState<SyncSimulationStats | null>(null);
  const [simulatedFirestore, setSimulatedFirestore] = useState<Record<string, Record<string, any>>>({});
  const [selectedCollection, setSelectedCollection] = useState<string>(sheets[0]?.collection || 'DOG2025');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    const newLogs: SyncSimulationLog[] = [];
    const startTimeMs = Date.now();
    const startIso = new Date().toISOString();

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let totalRows = 0;

    sheets.forEach((s) => {
      totalRows += (dataMap[s.sheet] || []).length;
    });

    newLogs.push({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      sheet: 'SYSTEM',
      collection: 'SYSTEM',
      docId: '-',
      action: 'create',
      message: `[INIT] Connecting to Cloud Firestore via FirestoreApp.getFirestore(..., ..., "${projectId}")...`,
    });
    setLogs([...newLogs]);

    const updatedFirestore = { ...simulatedFirestore };
    let processedSoFar = 0;

    for (const sheetCfg of sheets) {
      const rows = dataMap[sheetCfg.sheet] || [];
      if (!updatedFirestore[sheetCfg.collection]) {
        updatedFirestore[sheetCfg.collection] = {};
      }

      newLogs.push({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        sheet: sheetCfg.sheet,
        collection: sheetCfg.collection,
        docId: '-',
        action: 'create',
        message: `Reading sheet "${sheetCfg.sheet}" (${rows.length} rows found). Target collection: ${sheetCfg.collection}/`,
      });

      for (let i = 0; i < rows.length; i++) {
        processedSoFar++;
        setProgress(Math.round((processedSoFar / Math.max(totalRows, 1)) * 100));

        // Simulated network latency
        await new Promise((r) => setTimeout(r, 60));

        const row = rows[i];
        const docId = docIdFor(row, sheetCfg.keys, i + 1);
        const path = `${sheetCfg.collection}/${docId}`;
        const docData = {
          ...row,
          _syncedAt: new Date().toISOString(),
        };

        try {
          const alreadyExists = !!updatedFirestore[sheetCfg.collection][docId];

          if (alreadyExists) {
            updatedFirestore[sheetCfg.collection][docId] = docData;
            updatedCount++;
            newLogs.push({
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'success',
              sheet: sheetCfg.sheet,
              collection: sheetCfg.collection,
              docId,
              action: 'update',
              message: `[UPDATE] firestore.updateDocument("${path}", doc) - Existing record overwritten.`,
            });
          } else {
            updatedFirestore[sheetCfg.collection][docId] = docData;
            createdCount++;
            newLogs.push({
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'success',
              sheet: sheetCfg.sheet,
              collection: sheetCfg.collection,
              docId,
              action: 'create',
              message: `[CREATE] firestore.createDocument("${path}", doc) - New record created.`,
            });
          }
        } catch (err) {
          failedCount++;
          newLogs.push({
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'error',
            sheet: sheetCfg.sheet,
            collection: sheetCfg.collection,
            docId,
            action: 'error',
            message: `[ERROR] Failed to upsert ${path}: ${String(err)}`,
          });
        }
      }
    }

    const endTimeMs = Date.now();
    const finishMessage = `ซิงก์เสร็จสิ้น — สร้างใหม่ ${createdCount} | อัปเดต ${updatedCount} | ผิดพลาด ${failedCount}`;
    newLogs.push({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      sheet: 'SUMMARY',
      collection: 'SUMMARY',
      docId: '-',
      action: 'create',
      message: `[DONE] ${finishMessage} (ใช้เวลา ${(endTimeMs - startTimeMs) / 1000} วินาที)`,
    });

    setSimulatedFirestore(updatedFirestore);
    setLogs([...newLogs]);
    setStats({
      created: createdCount,
      updated: updatedCount,
      failed: failedCount,
      totalProcessed: processedSoFar,
      executionTimeMs: endTimeMs - startTimeMs,
      startTime: startIso,
      endTime: new Date().toISOString(),
    });
    setIsRunning(false);
    setProgress(100);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setStats(null);
  };

  const handleResetFirestoreDB = () => {
    if (window.confirm(lang === 'th' ? 'ต้องการล้างฐานข้อมูลจำลอง Firestore หรือไม่?' : 'Clear simulated Firestore database?')) {
      setSimulatedFirestore({});
      setSelectedDocId(null);
      setStats(null);
    }
  };

  const currentCollectionDocs = simulatedFirestore[selectedCollection] || {};
  const currentCollectionDocKeys = Object.keys(currentCollectionDocs);

  return (
    <div className="space-y-6">
      {/* Simulation Controls Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'th' ? 'จำลองการทำงานของ Google Apps Script' : 'Google Apps Script Execution Simulator'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'ทดสอบตรรกะ Upsert (getDocument -> create/update) เสมือนกำลังรันบน Google Cloud Platform จริง'
                : 'Tests the idempotency, document ID generation, and create/update branching in real-time.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>
                {isRunning
                  ? lang === 'th' ? 'กำลังประมวลผล...' : 'Running Sync...'
                  : lang === 'th' ? 'เริ่มรัน syncAllSheets()' : 'Run syncAllSheets()'}
              </span>
            </button>

            <button
              onClick={handleClearLogs}
              disabled={isRunning || logs.length === 0}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-40"
            >
              {lang === 'th' ? 'ล้าง Logs' : 'Clear Logs'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-2xs text-slate-500 font-mono">
              <span>Syncing sheets to Cloud Firestore ({projectId})...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Summary Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3">
              <div className="text-emerald-700 font-medium text-2xs">
                {lang === 'th' ? 'สร้างใหม่ (Created)' : 'Created Docs'}
              </div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">
                +{stats.created}
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3">
              <div className="text-blue-700 font-medium text-2xs">
                {lang === 'th' ? 'อัปเดต (Updated)' : 'Updated Docs'}
              </div>
              <div className="text-xl font-bold text-blue-900 mt-0.5">
                {stats.updated}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-slate-600 font-medium text-2xs">
                {lang === 'th' ? 'แถวทั้งหมด (Total)' : 'Total Processed'}
              </div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {stats.totalProcessed}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-slate-600 font-medium text-2xs">
                {lang === 'th' ? 'เวลาที่ใช้ (Time)' : 'Execution Time'}
              </div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {(stats.executionTimeMs / 1000).toFixed(2)}s
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Logs Output */}
        <div className="bg-slate-950 rounded-2xl border border-slate-900 shadow-sm overflow-hidden flex flex-col h-[480px]">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apps Script Logger Stream</span>
            </div>
            <span className="text-2xs text-slate-400">
              {logs.length} {lang === 'th' ? 'รายการบันทึก' : 'log entries'}
            </span>
          </div>

          <div className="p-4 font-mono text-xs overflow-y-auto space-y-1.5 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            {logs.length === 0 ? (
              <div className="text-slate-400 text-center py-24 italic">
                {lang === 'th'
                  ? 'กดปุ่ม "เริ่มรัน syncAllSheets()" ด้านบนเพื่อดูการทำงานแบบเรียลไทม์'
                  : 'Click "Run syncAllSheets()" above to launch the simulation stream.'}
              </div>
            ) : (
              logs.map((log) => {
                let colorClass = 'text-slate-300';
                if (log.action === 'create') colorClass = 'text-emerald-400';
                if (log.action === 'update') colorClass = 'text-blue-400';
                if (log.action === 'error') colorClass = 'text-red-400 font-bold';

                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 text-2xs shrink-0 select-none">
                      [{log.timestamp}]
                    </span>
                    <span className={`break-all ${colorClass}`}>{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Cloud Firestore Database Inspector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[480px]">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'th' ? 'สำรวจคลังข้อมูล Firestore จำลอง' : 'Simulated Firestore Explorer'}</span>
            </div>
            <button
              onClick={handleResetFirestoreDB}
              className="text-2xs text-slate-500 hover:text-red-600"
            >
              {lang === 'th' ? 'ล้าง DB จำลอง' : 'Reset Database'}
            </button>
          </div>

          {/* Collection Pills */}
          <div className="px-4 py-2 border-b border-slate-100 flex gap-1.5 overflow-x-auto bg-white">
            {sheets.map((s) => {
              const count = Object.keys(simulatedFirestore[s.collection] || {}).length;
              return (
                <button
                  key={s.collection}
                  onClick={() => {
                    setSelectedCollection(s.collection);
                    setSelectedDocId(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedCollection === s.collection
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.collection}/ ({count})
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 flex-1 overflow-hidden divide-x divide-slate-100">
            {/* Document ID List */}
            <div className="p-3 overflow-y-auto space-y-1">
              <div className="text-2xs font-semibold text-slate-600 uppercase mb-2">
                Documents in {selectedCollection}/
              </div>
              {currentCollectionDocKeys.length === 0 ? (
                <div className="text-slate-600 text-xs py-8 text-center italic">
                  {lang === 'th' ? 'ยังไม่มีเอกสาร (กดรันซิงก์)' : 'No documents yet.'}
                </div>
              ) : (
                currentCollectionDocKeys.map((docId) => (
                  <button
                    key={docId}
                    onClick={() => setSelectedDocId(docId)}
                    className={`w-full text-left p-2 rounded-lg text-2xs font-mono truncate block transition-all ${
                      selectedDocId === docId
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {docId}
                  </button>
                ))
              )}
            </div>

            {/* Document JSON Viewer */}
            <div className="p-3 overflow-y-auto bg-slate-950 font-mono text-2xs text-emerald-300">
              <div className="text-2xs font-sans font-semibold text-slate-400 uppercase mb-2">
                {selectedDocId
                  ? `${selectedCollection}/${selectedDocId}`
                  : lang === 'th' ? 'เลือกเอกสารเพื่อดูข้อมูล' : 'Select a document'}
              </div>
              {selectedDocId && currentCollectionDocs[selectedDocId] ? (
                <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                  {JSON.stringify(currentCollectionDocs[selectedDocId], null, 2)}
                </pre>
              ) : (
                <div className="text-slate-400 italic py-12 text-center font-sans">
                  {lang === 'th' ? 'คลิกที่ชื่อ Document ID ด้านซ้าย' : 'Click a document ID on the left to inspect fields'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
