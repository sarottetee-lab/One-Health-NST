import React from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  MapPin,
  Users,
  MessageSquare,
  Sparkles,
  PhoneCall,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Syringe,
  Home,
  RotateCcw,
  X,
  Map as MapIcon
} from 'lucide-react';
import { ActiveNavTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  onRefreshData?: () => void;
  onPullIncrementalUpdate?: () => void;
  totalRecordsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'gis', label: 'แผนที่ GIS', icon: MapIcon },
    { id: 'zones', label: 'จำแนกพื้นที่ (Zone Map)', icon: Layers },
    { id: 'animal', label: 'ประชากรสัตว์ & วัคซีน', icon: Activity },
    { id: 'rabies', label: 'สถานการณ์โรคในสัตว์', icon: ShieldAlert },
    { id: 'pep', label: 'การดูแลผู้สัมผัสโรค (PEP)', icon: Syringe },
    { id: 'kap', label: 'KAP Survey ชุมชน', icon: Users },
    { id: 'qualitative', label: 'One Health เชิงคุณภาพ', icon: MessageSquare },
    { id: 'situation', label: 'วิเคราะห์ 3 มิติ', icon: Sparkles },
    { id: 'risk', label: 'พยากรณ์ความเสี่ยง (RRI)', icon: ShieldAlert },
    { id: 'sync_hub', label: 'Sync & Data Hub', icon: RefreshCw },
  ];

  return (
    <header id="onehealth-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Identity */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                One Health Rabies Dashboard
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                นครศรีธรรมราช
              </span>
            </div>
            <p className="text-sm text-slate-500 hidden sm:block">
              ระบบเฝ้าระวังโรคพิษสุนัขบ้าแบบบูรณาการ
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="border-t border-slate-100 px-4 sm:px-6 lg:px-8 bg-slate-50/50 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

