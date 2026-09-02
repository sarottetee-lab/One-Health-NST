import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { AreaZoneSummary } from '../../types';
import { calculateDetailedRri } from '../../utils/rriCalculator';

interface RriWhatIfSimulatorProps {
  summaries: AreaZoneSummary[];
  levelLabel: string;
}

export const RriWhatIfSimulator: React.FC<RriWhatIfSimulatorProps> = ({ summaries, levelLabel }) => {
  // Intervention sliders
  const [vaccineBoost, setVaccineBoost] = useState<number>(10); // +10% vaccine coverage
  const [strayReduction, setStrayReduction] = useState<number>(20); // -20% stray ratio
  const [pepImprovement, setPepImprovement] = useState<number>(10); // +10% PEP compliance
  const [sterilizationBoost, setSterilizationBoost] = useState<number>(25); // +25% sterilization rate

  // Original baseline stats
  const baselineCritical = summaries.filter((s) => s.riskLevel === 'วิกฤต').length;
  const baselineHigh = summaries.filter((s) => s.riskLevel === 'สูง').length;
  const baselineAvgRri = summaries.length > 0
    ? Math.round(summaries.reduce((sum, s) => sum + s.riskIndexScore, 0) / summaries.length)
    : 0;

  // Compute simulated results
  const simulatedSummaries = summaries.map((item) => {
    const newVaccine = Math.min(100, item.vaccineCoverageRate + vaccineBoost);
    const newStray = Math.max(0, item.strayRatio * (1 - strayReduction / 100));
    const newPep = Math.min(100, item.pepComplianceRate + pepImprovement);
    const newSterilization = Math.min(100, item.sterilizationRate + sterilizationBoost);

    const breakdown = calculateDetailedRri({
      positivesCurrentYear: item.animalPositivesSelectedYear,
      positivesPrevYear: (item as any).animalPositivesPrevYear || 0,
      vaccineCoverageRate: newVaccine,
      strayRatio: newStray,
      sterilizationRate: newSterilization,
      pepComplianceRate: newPep,
      isAdjacentToOutbreakZone: item.zone === 'B_PLUS',
      hasHighRiskHotspots: false,
    });

    return {
      ...item,
      simulatedScore: breakdown.finalRriScore,
      simulatedLevel: breakdown.riskLevel,
      scoreDiff: breakdown.finalRriScore - item.riskIndexScore,
    };
  });

  const simCritical = simulatedSummaries.filter((s) => s.simulatedLevel === 'วิกฤต').length;
  const simHigh = simulatedSummaries.filter((s) => s.simulatedLevel === 'สูง').length;
  const simAvgRri = simulatedSummaries.length > 0
    ? Math.round(simulatedSummaries.reduce((sum, s) => sum + s.simulatedScore, 0) / simulatedSummaries.length)
    : 0;

  const scoreReduction = baselineAvgRri - simAvgRri;
  const criticalReduction = baselineCritical - simCritical;

  const resetDefaults = () => {
    setVaccineBoost(10);
    setStrayReduction(20);
    setPepImprovement(10);
    setSterilizationBoost(25);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800/40 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Policy Simulation Sandbox
              </span>
              <span className="text-xs text-indigo-300">
                จำลองผลลัพธ์ตามแบบจำลอง RRI
              </span>
            </div>
            <h3 className="text-lg font-bold">
              ห้องปฏิบัติการจำลองมาตรการแทรกแซง (What-If Intervention Simulator)
            </h3>
          </div>
        </div>

        <button
          onClick={resetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-semibold rounded-lg border border-indigo-700/50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          รีเซ็ตค่าเริ่มต้น
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Slider 1: Vaccine Coverage */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-indigo-200">เพิ่มการฉีดวัคซีนสัตว์</span>
            <span className="text-emerald-400 font-bold">+{vaccineBoost}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={vaccineBoost}
            onChange={(e) => setVaccineBoost(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>+15% (เป้าหมาย 80%)</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Slider 2: Stray Animal Reduction */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-indigo-200">ลดสัดส่วนสุนัขจรจัด</span>
            <span className="text-amber-400 font-bold">-{strayReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="10"
            value={strayReduction}
            onChange={(e) => setStrayReduction(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>-30% (จัดระเบียบ)</span>
            <span>-60%</span>
          </div>
        </div>

        {/* Slider 3: PEP Compliance */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-indigo-200">เพิ่มการฉีด PEP คนครบชุด</span>
            <span className="text-purple-400 font-bold">+{pepImprovement}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="5"
            value={pepImprovement}
            onChange={(e) => setPepImprovement(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>+10% (ติดตามครบ)</span>
            <span>+25%</span>
          </div>
        </div>

        {/* Slider 4: Sterilization Boost */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-indigo-200">เพิ่มการผ่าตัดทำหมัน</span>
            <span className="text-cyan-400 font-bold">+{sterilizationBoost}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={sterilizationBoost}
            onChange={(e) => setSterilizationBoost(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>+25% (หน่วยเคลื่อนที่)</span>
            <span>+50%</span>
          </div>
        </div>
      </div>

      {/* Impact KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-indigo-950/70 p-4 rounded-xl border border-indigo-700/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-indigo-300">คะแนนความเสี่ยงเฉลี่ยทั้งพื้นที่</div>
            <div className="text-2xl font-bold text-white flex items-baseline gap-2 mt-1">
              <span>{simAvgRri}</span>
              <span className="text-xs text-slate-400 font-normal">เดิม: {baselineAvgRri}</span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            ลดลง {scoreReduction} แต้ม
          </div>
        </div>

        <div className="bg-indigo-950/70 p-4 rounded-xl border border-indigo-700/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-indigo-300">พื้นที่ระดับวิกฤต (≥70)</div>
            <div className="text-2xl font-bold text-rose-300 flex items-baseline gap-2 mt-1">
              <span>{simCritical} {levelLabel}</span>
              <span className="text-xs text-slate-400 font-normal">เดิม: {baselineCritical}</span>
            </div>
          </div>
          {criticalReduction > 0 ? (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-bold">
              ลดลง {criticalReduction} {levelLabel}
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs">
              เท่าเดิม
            </div>
          )}
        </div>

        <div className="bg-indigo-950/70 p-4 rounded-xl border border-indigo-700/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-indigo-300">พื้นที่ระดับเสี่ยงสูง (50-69)</div>
            <div className="text-2xl font-bold text-amber-300 flex items-baseline gap-2 mt-1">
              <span>{simHigh} {levelLabel}</span>
              <span className="text-xs text-slate-400 font-normal">เดิม: {baselineHigh}</span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            ยกระดับสู่โซนปลอดภัย
          </div>
        </div>
      </div>
    </div>
  );
};
