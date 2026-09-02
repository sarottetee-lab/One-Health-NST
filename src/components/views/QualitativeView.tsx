import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Quote,
  ShieldCheck,
  Building,
  Heart,
  Trees,
  Search,
  Filter,
  CheckCircle,
  Lightbulb,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { QUALITATIVE_INSIGHTS } from '../../data/mockSurveillanceData';
import { QualitativeInsight } from '../../types';
import { DataSource } from '../common/DataSource';

export const QualitativeView: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<'All' | 'Human' | 'Animal' | 'Environment'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allTags = Array.from(new Set(QUALITATIVE_INSIGHTS.flatMap((q) => q.tags)));

  const filteredInsights = QUALITATIVE_INSIGHTS.filter((item) => {
    const matchPillar = selectedPillar === 'All' || item.pillar === selectedPillar;
    const matchTag = selectedTag === 'All' || item.tags.includes(selectedTag);
    const matchSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keyInformant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPillar && matchTag && matchSearch;
  });

  const wordCloudWords = [
    { word: 'สุนัขจรจัด', weight: 36, color: '#f97316' },
    { word: 'วัคซีน 80%', weight: 32, color: '#10b981' },
    { word: 'ล้างแผลสบู่ 15 นาที', weight: 28, color: '#3b82f6' },
    { word: 'งบประมาณ อปท.', weight: 26, color: '#8b5cf6' },
    { word: 'แผลลูกสุนัข', weight: 24, color: '#ef4444' },
    { word: 'One Health ทีมเคลื่อนที่เร็ว', weight: 22, color: '#0d9488' },
    { word: 'ขยะเศษอาหารตลาด', weight: 20, color: '#d97706' },
    { word: 'PEP เข็ม 14/28 Drop-out', weight: 20, color: '#ec4899' },
    { word: 'อสม. เคาะประตูบ้าน', weight: 18, color: '#6366f1' },
    { word: 'ทำหมันสุนัข', weight: 18, color: '#14b8a6' },
    { word: 'กักสัตว์ 10 วัน', weight: 16, color: '#64748b' },
  ];

  return (
    <div id="qualitative-view" className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              One Health Framework & Qualitative Synthesis
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            ข้อมูลเชิงคุณภาพและการสัมภาษณ์เชิงลึก (Qualitative Insights)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ถอดบทเรียนจากผู้มีส่วนได้ส่วนเสีย (Key Informants) ในระบบสาธารณสุข ปศุสัตว์ อปท. และชุมชน
          </p>
        </div>

        {/* 3 Pillars Badge */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => setSelectedPillar('All')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedPillar === 'All' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setSelectedPillar('Human')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedPillar === 'Human' ? 'bg-pink-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> ด้านคน
          </button>
          <button
            onClick={() => setSelectedPillar('Animal')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedPillar === 'Animal' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> ด้านสัตว์
          </button>
          <button
            onClick={() => setSelectedPillar('Environment')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedPillar === 'Environment' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-3.5 h-3.5" /> ด้านสิ่งแวดล้อม
          </button>
        </div>
      </div>

      {/* One Health Thematic Triad Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50/40 p-5 rounded-2xl border border-pink-200">
          <div className="flex items-center gap-2 text-pink-700 font-bold text-sm mb-2 font-heading">
            <Heart className="w-4 h-4" /> สุขภาพคน (Human Dimension)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            จุดเน้นคือการสร้างความตระหนักรู้แก่เด็กและผู้ปกครอง การจัดการบาดแผลฉุกเฉิน และการลด Drop-out Rate ของวัคซีน PEP เข็มที่ 14 และ 28
          </p>
          <div className="mt-3 text-[11px] text-pink-800 font-semibold bg-pink-100/70 px-2.5 py-1 rounded-lg inline-block">
            เป้าหมาย: 0 Human Rabies Death ตลอดไป
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2 font-heading">
            <ShieldCheck className="w-4 h-4" /> สุขภาพสัตว์ (Animal Dimension)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            การควบคุมประชากรสุนัขจรจัดในวัด/ตลาด การฉีดวัคซีนป้องกันให้ครอบคลุม ≥80% และการสนับสนุนทีมยิงยาสลบเพื่อจับสัตว์จรจัด
          </p>
          <div className="mt-3 text-[11px] text-amber-800 font-semibold bg-amber-100/70 px-2.5 py-1 rounded-lg inline-block">
            เป้าหมาย: Herd Immunity ≥ 80% ทุกตำบล
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2 font-heading">
            <Trees className="w-4 h-4" /> สิ่งแวดล้อม (Environmental Dimension)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            การจัดการขยะอินทรีย์และเศษอาหารจากตลาดสด โรงฆ่าสัตว์ และแหล่งท่องเที่ยว เพื่อตัดวงจรแหล่งอาหารของฝูงสุนัขจรจัด
          </p>
          <div className="mt-3 text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-lg inline-block">
            เป้าหมาย: สุขาภิบาลตลาดสดและชุมชนสะอาด
          </div>
        </div>
      </div>

      {/* Interactive Thematic Word Cloud & Tags */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Thematic Keyword Cloud (ประเด็นสำคัญจากการสัมภาษณ์เชิงลึก)
        </h4>

        {/* Word Cloud Visual Canvas */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-center gap-3">
          {wordCloudWords.map((w, idx) => (
            <span
              key={idx}
              className="font-bold cursor-pointer transition-transform hover:scale-110 select-none px-2 py-0.5 rounded-md hover:bg-white/80"
              style={{
                fontSize: `${Math.max(12, w.weight * 0.65)}px`,
                color: w.color,
              }}
              onClick={() => {
                const matchedTag = allTags.find((t) => w.word.includes(t) || t.includes(w.word));
                if (matchedTag) setSelectedTag(matchedTag);
              }}
              title={`ความถี่/น้ำหนัก: ${w.weight}`}
            >
              {w.word}
            </span>
          ))}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-xs text-slate-500 font-medium">ตัวกรองป้ายกำกับ:</span>
          <button
            onClick={() => setSelectedTag('All')}
            className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all ${
              selectedTag === 'All' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                selectedTag === tag ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Key Informant Quotes & System Gaps List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-2">
          <Quote className="w-4 h-4 text-indigo-600" />
          บทสัมภาษณ์เชิงลึก ปัญหาคอขวด และข้อเสนอแนะเชิงนโยบาย ({filteredInsights.length} รายการ)
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {filteredInsights.map((insight) => {
            const pillarColor =
              insight.pillar === 'Human'
                ? 'border-pink-300 bg-pink-50/20'
                : insight.pillar === 'Animal'
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-emerald-300 bg-emerald-50/20';

            const pillarBadge =
              insight.pillar === 'Human'
                ? 'bg-pink-100 text-pink-800'
                : insight.pillar === 'Animal'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl border shadow-xs bg-white space-y-4 hover:shadow-md transition-all ${pillarColor}`}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${pillarBadge}`}>
                      {insight.pillar === 'Human' ? 'มิติด้านคน' : insight.pillar === 'Animal' ? 'มิติด้านสัตว์' : 'มิติด้านสิ่งแวดล้อม'}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 font-heading">{insight.title}</h5>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    พื้นที่: <span className="text-slate-800 font-bold">อำเภอ{insight.district}</span>
                  </div>
                </div>

                {/* Direct Quote Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs italic leading-relaxed relative">
                  <Quote className="w-6 h-6 text-slate-300 absolute right-3 top-3 -scale-x-100 pointer-events-none" />
                  <p className="relative z-10">{insight.quote}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-600 not-italic flex items-center justify-between">
                    <span>— {insight.keyInformant}</span>
                    <span className="text-slate-400 font-normal">{insight.informantRole}</span>
                  </div>
                </div>

                {/* 2-Column: System Gap vs Policy Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* System Gap */}
                  <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      ปัญหาคอขวดในระบบ (System Gap):
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">{insight.systemGap}</p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                      ข้อเสนอแนะเชิงนโยบาย (Recommendation):
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">{insight.recommendation}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {insight.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DataSource source="โครงการวิจัยสังเคราะห์ข้อมูลเชิงคุณภาพ One Health นครศรีธรรมราช" />
      </div>
    </div>
  );
};
