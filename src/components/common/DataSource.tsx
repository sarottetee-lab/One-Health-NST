import React from 'react';
import { Database } from 'lucide-react';

interface DataSourceProps {
  source?: string;
  agency?: string;
  updatedAt?: string;
  className?: string;
}

export const DataSource: React.FC<DataSourceProps> = ({
  source = 'ระบบเฝ้าระวังโรคพิษสุนัขบ้า One Health นครศรีธรรมราช (DLD & DDC)',
  agency = 'กรมปศุสัตว์ / กรมควบคุมโรค / สำนักงานสาธารณสุขจังหวัดนครศรีธรรมราช',
  updatedAt,
  className = '',
}) => {
  return (
    <div
      id="data-source-citation"
      className={`flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-3 border-t border-slate-100 text-[11px] text-slate-500 font-sans ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-600">ที่มาของข้อมูล:</span>
        <span className="truncate text-slate-500">{source} ({agency})</span>
      </div>
      <div className="text-[10px] text-slate-400">
        {updatedAt ? `อัปเดต: ${updatedAt}` : 'เฝ้าระวังแบบ Real-time'}
      </div>
    </div>
  );
};
