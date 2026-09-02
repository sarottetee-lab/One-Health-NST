import React from 'react';
import {
  X,
  BookOpen,
  Calculator,
  ShieldCheck,
  Activity,
  Zap,
  Globe,
  Award,
  Layers,
  FileText,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { RRI_THEORY_SPEC } from '../../utils/rriCalculator';

interface RriTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RriTheoryModal: React.FC<RriTheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Scientific & Theoretical Framework
              </div>
              <h3 className="text-lg font-bold">
                ทฤษฎีและการพัฒนาแบบจำลองดัชนีความเสี่ยงโรคพิษสุนัขบ้า (Rabies Risk Index - RRI)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Executive Rationale Banner */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/50">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-base mb-1">
                  กรอบแนวคิดสุขภาพหนึ่งเดียว (One Health Triangulation Model)
                </h4>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80">
                  แบบจำลอง RRI พัฒนาขึ้นเพื่อผสานรวมข้อมูล 3 มิติหลัก: ระบาดวิทยาและการตรวจพบเชื้อในสัตว์ (Animal Surveillance), ภูมิคุ้มกันฝูงและประชากรสัตว์จรจัด (Ecology & Immunity), และการสัมผัสโรคและการป้องกันในมนุษย์ (Human Exposure & PEP) เพื่อให้ได้ค่าดัชนีความเสี่ยงที่แม่นยำ สอดคล้องกับมาตรฐานสากล WHO และ WOAH
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Display */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-inner">
            <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              สมการคณิตศาสตร์แบบจำลองความเสี่ยงรวม (Unified RRI Equation)
            </div>
            <div className="font-mono text-sm bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto my-2 text-center">
              RRI = min(100, max(5, round( S_Epi(35) + S_Herd(25) + S_Eco(20) + S_Pep(20) + P_Spillover(10) )))
            </div>
            <p className="text-xs text-slate-400 mt-2">
              โดยที่ผลรวมถ่วงน้ำหนักมาตรฐานมีค่า 0 - 100 คะแนน และรวมผลกระทบการแพร่กระจายข้ามแดนเชิงพื้นที่ (Spatial Buffer Spillover) เมื่ออยู่ติดกับพื้นที่สีแดง
            </p>
          </div>

          {/* 4 Pillars Breakdown Grid */}
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              องค์ประกอบ 4 เสาหลักทางระบาดวิทยา (4 Multi-Pillar Components)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RRI_THEORY_SPEC.scientificBasis.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.pillar}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                      สูงสุด {item.maxPoints} คะแนน ({item.weight})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {item.theory}
                  </p>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200">
                    ตัวแปร: {item.variables}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    <strong>แหล่งอ้างอิง:</strong> {item.standardSource}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classification Thresholds */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              เกณฑ์จำแนกระดับความเสี่ยงและการสั่งการเชิงนโยบาย
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-rose-100/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg">
                <div className="font-bold text-rose-900 dark:text-rose-200">🔴 ระดับวิกฤต (≥ 70 คะแนน)</div>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  พบการระบาดหรือมีความเสี่ยงสูงยิ่งยวด บังคับประกาศเขตโรคระบาดชั่วคราว รัศมี 3-5 กม. กักสัตว์ และปูพรมฉีดวัคซีน 100%
                </p>
              </div>
              <div className="p-3 bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 rounded-lg">
                <div className="font-bold text-orange-900 dark:text-orange-200">🟠 ระดับสูง (50 - 69 คะแนน)</div>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  มีประวัติพบเชื้อหรือเป็นพื้นที่รอยต่อสัมผัสโรค ต้องเฝ้าระวังเข้มข้น เร่งรัดวัคซีนสัตว์ให้เกิน 80% และติดตามผู้สัมผัสโรคครบ 100%
                </p>
              </div>
              <div className="p-3 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg">
                <div className="font-bold text-amber-900 dark:text-amber-200">🟡 ระดับปานกลาง (30 - 49 คะแนน)</div>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  ไม่มีเชื้อแต่ภูมิคุ้มกันฝูงยังไม่เสถียร หรือสุนัขจรจัดหนาแน่น เร่งรัดทำหมันและจัดระเบียบสัตว์เลี้ยง
                </p>
              </div>
              <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">🟢 ระดับต่ำ / ปลอดโรค (&lt; 30 คะแนน)</div>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  มีภูมิคุ้มกันฝูงสูง ปลอดเชื้อต่อเนื่อง รักษามาตรฐานการเฝ้าระวังเชิงรุกและการขึ้นทะเบียนสัตว์
                </p>
              </div>
            </div>
          </div>

          {/* Academic Citations */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="font-semibold text-slate-700 dark:text-slate-300">เอกสารอ้างอิงและมาตรฐานที่เกี่ยวข้อง:</div>
            <div>1. WHO Expert Consultation on Rabies: Third Report. WHO Technical Report Series 1012, World Health Organization (2018).</div>
            <div>2. WOAH (OIE) Terrestrial Manual: Rabies (infection with rabies virus and other lyssaviruses), Chapter 3.1.18 (2022).</div>
            <div>3. ยุทธศาสตร์โครงการสัตว์ปลอดโรค คนปลอดภัย จากโรคพิษสุนัขบ้า ตามพระปณิธาน ศาสตราจารย์ ดร.สมเด็จเจ้าฟ้าฯ กรมพระศรีสวางควัฒน วรขัตติยราชนารี.</div>
            <div>4. คู่มือแนวทางการดำเนินงานประเมินพื้นที่ปลอดโรคพิษสุนัขบ้า กรมปศุสัตว์ และกรมควบคุมโรค กระทรวงสาธารณสุข.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
