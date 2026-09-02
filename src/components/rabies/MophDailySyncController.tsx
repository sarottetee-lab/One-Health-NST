import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Calendar,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Info
} from 'lucide-react';
import {
  MophAutoSyncConfig,
  MophSyncLogEntry,
  getMophAutoSyncConfig,
  saveMophAutoSyncConfig,
  getMophSyncLogs,
  executeMophDailySync,
} from '../../utils/mophAutoSyncService';
import { PepVacRow, InterviewRow } from '../../types';

interface MophDailySyncControllerProps {
  onSyncSuccess?: (pepRows: PepVacRow[], interviewRows: InterviewRow[], summaryMsg: string) => void;
  compact?: boolean;
}

export const MophDailySyncController: React.FC<MophDailySyncControllerProps> = ({
  onSyncSuccess,
  compact = false,
}) => {
  const [config, setConfig] = useState<MophAutoSyncConfig>(getMophAutoSyncConfig());
  const [logs, setLogs] = useState<MophSyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  useEffect(() => {
    setLogs(getMophSyncLogs());
  }, []);

  const handleToggleAutoSync = () => {
    const updated = saveMophAutoSyncConfig({ enabled: !config.enabled });
    setConfig(updated);
  };

  const handleIntervalChange = (hours: number) => {
    const updated = saveMophAutoSyncConfig({ intervalHours: hours });
    setConfig(updated);
  };

  const handleYearChange = (year: string) => {
    const updated = saveMophAutoSyncConfig({ targetYear: year });
    setConfig(updated);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setLastMessage(null);
    try {
      const result = await executeMophDailySync('manual', config.targetYear);
      setConfig(getMophAutoSyncConfig());
      setLogs(getMophSyncLogs());
      setLastMessage(result.summaryText);

      if (onSyncSuccess) {
        onSyncSuccess(result.pepRows, result.interviewRows, result.summaryText);
      }
    } catch (err: any) {
      setLastMessage(`เกิดข้อผิดพลาด: ${err?.message || 'ไม่สามารถเชื่อมต่อได้'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Compact badge mode (e.g. for header or card widgets)
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-slate-300 font-medium">MOPH Auto-Sync:</span>
          <span className={`font-bold ${config.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
            {config.enabled ? 'อัตโนมัติทุกวัน' : 'ปิดใช้งาน'}
          </span>
        </div>
        <button
          onClick={handleManualSyncNow}
          disabled={isSyncing}
          className="ml-1 px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'กำลังซิงก์...' : 'ซิงก์เดี๋ยวนี้'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 shadow-lg space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-heading">
                ระบบดึงข้อมูลวัคซีนและเซรุ่มอัตโนมัติประจำวัน (MOPH HDC Auto-Sync)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
              }`}>
                {config.enabled ? '● เปิดทำงานอัตโนมัติ (Active)' : '○ ปิดการทำงาน'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              เชื่อมต่อฐานข้อมูล HDC Open Data กระทรวงสาธารณสุข (ตาราง s_rebies_overview) เพื่อปรับปรุงข้อมูล 23 อำเภอ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ตั้งค่ารอบเวลา</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติซิงก์ ({logs.length})</span>
          </button>

          <button
            type="button"
            onClick={handleManualSyncNow}
            disabled={isSyncing}
            className="px-4 py-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'กำลังดึงข้อมูล MOPH...' : 'ดึงข้อมูลและอัปเดตเดี๋ยวนี้'}</span>
          </button>
        </div>
      </div>

      {/* Status & Last Sync Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>รอบเวลาการซิงก์</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {config.enabled ? `ทุกๆ ${config.intervalHours} ชม. (ประจำวัน)` : 'ปิดการทำงาน'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">ทำงานเบื้องหลังอัตโนมัติ</div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>ซิงก์ล่าสุดเมื่อ</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            {config.lastSyncTimestamp ? new Date(config.lastSyncTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'ยังไม่เคยซิงก์'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {config.lastSyncDate ? `วันที่ ${config.lastSyncDate}` : 'รอการทำงานรอบถัดไป'}
          </div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-400" />
            <span>เป้าหมายข้อมูล</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            ปี พ.ศ. {config.targetYear} (สสจ. 80)
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">นครศรีธรรมราช 23 อำเภอ</div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>สถานะระบบ API</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>พร้อมใช้งาน 100%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live API + Authoritative Cache</div>
        </div>
      </div>

      {/* Result feedback */}
      {lastMessage && (
        <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{lastMessage}</span>
          </div>
          <button
            onClick={() => setLastMessage(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-xs space-y-3 animate-in fade-in duration-200">
          <div className="font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <span>กำหนดค่าการทำงานอัตโนมัติ (Auto-Sync Preferences)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">สถานะการทำงานอัตโนมัติ:</label>
              <button
                onClick={handleToggleAutoSync}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 cursor-pointer ${
                  config.enabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>{config.enabled ? '✓ เปิดใช้งาน (Enabled)' : '✕ ปิดใช้งาน (Disabled)'}</span>
              </button>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">ความถี่ในการดึงข้อมูล:</label>
              <select
                value={config.intervalHours}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-hidden w-full"
              >
                <option value={24}>ทุกๆ 24 ชั่วโมง (วันละ 1 ครั้งตามกำหนด HDC)</option>
                <option value={12}>ทุกๆ 12 ชั่วโมง</option>
                <option value={6}>ทุกๆ 6 ชั่วโมง</option>
                <option value={1}>ทุกๆ 1 ชั่วโมง (โหมดติดตามเข้มงวด)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">ปีงบประมาณเป้าหมาย:</label>
              <select
                value={config.targetYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-hidden w-full"
              >
                <option value="2569">ปี พ.ศ. 2569 (ปีปัจจุบัน)</option>
                <option value="2568">ปี พ.ศ. 2568 (ปีย้อนหลัง)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sync History Logs */}
      {showLogs && (
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>ประวัติการซิงก์ข้อมูล MOPH HDC (Sync History Logs)</span>
            </div>
            <span className="text-slate-400 text-[11px]">แสดงรายการล่าสุด 10 ครั้ง</span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-700/60 border border-slate-700 rounded-lg bg-slate-900/60">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-slate-400">ยังไม่มีบันทึกประวัติการซิงก์</div>
            ) : (
              logs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="font-bold text-white">{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 text-[10px]">
                      {log.trigger === 'auto_daily' ? 'Auto-Daily' : log.trigger === 'startup' ? 'Startup' : 'Manual'}
                    </span>
                    <span className="text-slate-300">ปี {log.year}</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    ผู้สัมผัส: <span className="font-bold text-white">{log.totalExposed.toLocaleString()}</span> ราย | เข็ม 5: <span className="font-bold text-emerald-400">{log.avgComp5Rate}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
