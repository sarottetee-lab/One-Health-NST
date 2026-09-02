import React from 'react';
import { Database, FileSpreadsheet, Sparkles, ShieldCheck, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

interface HeaderProps {
  projectId: string;
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
  onQuickSimulate: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projectId,
  lang,
  setLang,
  onQuickSimulate,
  isSimulating,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Project info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg sm:text-xl tracking-tight text-slate-50 flex items-center gap-2">
                  <span>One Health Sync</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-medium">
                    Google Sheets → Firestore
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'th'
                  ? 'ระบบซิงก์ข้อมูลระบาดวิทยาและโรคพิษสุนัขบ้า (DOG2025, RABIES, KAP, Interview, PEP_VAC)'
                  : 'Rabies Surveillance & One Health Epidemiology Data Sync Hub'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/70 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-slate-400">Project:</span>
              <span className="font-mono text-amber-300 font-medium">{projectId}</span>
            </div>

            <button
              onClick={onQuickSimulate}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? (lang === 'th' ? 'กำลังซิงก์...' : 'Syncing...') : (lang === 'th' ? 'ทดสอบซิงก์ทันที' : 'Simulate Sync')}</span>
            </button>

            {/* Language Switcher */}
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setLang('th')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'th'
                    ? 'bg-slate-700 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'en'
                    ? 'bg-slate-700 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
