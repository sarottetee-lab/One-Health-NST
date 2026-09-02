import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  Building,
  Info,
  ArrowRight,
  Award,
  Layers,
  ChevronRight,
  CornerDownRight,
  RotateCcw,
  Sparkles,
  Map,
  Syringe,
  Activity,
} from 'lucide-react';
import {
  Dog2025Row,
  RabiesRow,
  PepVacRow,
  ZoneCategory,
  AreaZoneSummary,
  DistrictZoneSummary,
  SubDistrictZoneSummary,
} from '../../types';
import { NAKHON_DISTRICTS, HISTORICAL_HUMAN_DEATHS } from '../../data/nakhonDistricts';
import { useFilter } from '../../context/FilterContext';
import {
  calculateDistrictZoneSummaries,
  calculateSubDistrictZoneSummaries,
  calculateVillageZoneSummaries,
  calculateDynamicAreaZoneSummaries,
  getZoneBadgeConfig,
} from '../../utils/zoneClassifier';
import { formatNumber, formatPercent, toBE } from '../../utils/thaiYear';
import { DataSource } from '../common/DataSource';
import { RiskBadge } from '../common/RiskBadge';
import { CascadingLocationFilter } from '../common/CascadingLocationFilter';
import { RabiesFreeAssessmentPanel } from '../rabies/RabiesFreeAssessmentPanel';

interface DistrictZoneViewProps {
  dogData: Dog2025Row[];
  rabiesData: RabiesRow[];
  pepData: PepVacRow[];
}

export const DistrictZoneView: React.FC<DistrictZoneViewProps> = ({
  dogData,
  rabiesData,
  pepData,
}) => {
  const {
    selectedYear,
    selectedDistrict,
    setSelectedDistrict,
    selectedSubDistrict,
    setSelectedSubDistrict,
    selectedVillage,
    setSelectedVillage,
    searchQuery,
  } = useFilter();

  const [viewMode, setViewMode] = useState<'classic_zones' | 'assessment_5d'>('classic_zones');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const selectedYearBE = toBE(selectedYear);
  const prevYearBE = selectedYearBE - 1;

  // 1. คำนวณสรุปข้อมูลระดับอำเภอ 23 อำเภอ สำหรับภาพรวมและการประเมิน 5 มิติ
  const districtZoneSummaries = calculateDistrictZoneSummaries(selectedYear, dogData, rabiesData, pepData);

  // 2. คำนวณข้อมูลตามลำดับชั้นการเลือกพื้นที่ (เชื่อมโยงกันอย่างสมบูรณ์)
  const dynamicScope = calculateDynamicAreaZoneSummaries(
    selectedDistrict,
    selectedSubDistrict,
    selectedYear,
    dogData,
    rabiesData,
    pepData
  );

  const currentLevel = dynamicScope.level; // 'district' | 'subdistrict' | 'village'
  const currentSummaries = dynamicScope.summaries;

  // กรองตามคำค้นหาและระดับสี
  const filteredSummaries = currentSummaries.filter((d) => {
    const matchZone = zoneFilter === 'all' || d.zone === zoneFilter;
    const matchSearch =
      searchQuery === '' ||
      d.areaNameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.areaNameEn && d.areaNameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchZone && matchSearch;
  });

  const countC = currentSummaries.filter((z) => z.zone === 'C').length;
  const countBPlus = currentSummaries.filter((z) => z.zone === 'B_PLUS').length;
  const countB = currentSummaries.filter((z) => z.zone === 'B').length;
  const countAFree = currentSummaries.filter((z) => z.zone === 'A_FREE' || z.zone === 'A').length;

  const unitLabel =
    currentLevel === 'district' ? 'อำเภอ' : currentLevel === 'subdistrict' ? 'ตำบล' : 'หมู่บ้าน';

  return (
    <div id="district-zone-view" className="space-y-6">
      {/* Cascading Location Filter */}
      <CascadingLocationFilter />

      {/* Dynamic Breadcrumbs Navigation */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-emerald-400" />
            ระดับการวิเคราะห์พื้นที่:
          </span>

          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedSubDistrict('all');
              setSelectedVillage('all');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedDistrict === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ทั้งจังหวัด (23 อำเภอ)
          </button>

          {selectedDistrict !== 'all' && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => {
                  setSelectedSubDistrict('all');
                  setSelectedVillage('all');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedSubDistrict === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                อ.{selectedDistrict} (รายตำบล)
              </button>
            </>
          )}

          {selectedSubDistrict !== 'all' && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-600 text-white shadow-xs">
                ต.{selectedSubDistrict} (รายหมู่บ้าน)
              </span>
            </>
          )}
        </div>

        {selectedDistrict !== 'all' && (
          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedSubDistrict('all');
              setSelectedVillage('all');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            กลับสู่มุมมองทั้งจังหวัด
          </button>
        )}
      </div>

      {/* Main View Mode Selector */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('classic_zones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'classic_zones'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>การจำแนก 4 ระดับสีทางระบาดวิทยา (แดง/ส้ม/เหลือง/เขียว)</span>
          </button>

          <button
            onClick={() => setViewMode('assessment_5d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'assessment_5d'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>เกณฑ์ประเมินพื้นที่ปลอดโรค 5 มิติ (DDC/DLD)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-2">
          ปีประเมินหลัก: <span className="font-bold text-slate-900">พ.ศ. {toBE(selectedYear)}</span> (ย้อนหลัง 5 ปี)
        </div>
      </div>

      {/* Mode 1: 4-Tier Epidemiological Zones Breakdown */}
      {viewMode === 'classic_zones' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Banner Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  National Rabies Free Zone Certification (Zone C / B+ / B / A)
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  ปีอ้างอิง พ.ศ. {selectedYearBE}
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                {dynamicScope.scopeTitleTh}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLevel === 'district'
                  ? 'วิเคราะห์ข้อมูลระดับ 23 อำเภอ เชื่อมโยงผลแล็บย้อนหลัง 1-5 ปี ความครอบคลุมวัคซีน และการประเมินรอยต่อโรค'
                  : currentLevel === 'subdistrict'
                  ? `วิเคราะห์เจาะลึกระดับตำบลทุกตำบลใน อ.${selectedDistrict} จำแนกตามประวัติพบเชื้อรอบ 1-5 ปี`
                  : `วิเคราะห์เจาะลึกระดับหมู่บ้านใน ต.${selectedSubDistrict} (อ.${selectedDistrict})`}
              </p>
            </div>

            <div className="text-xs text-slate-500 text-right">
              <div>
                จำนวนพื้นที่วิเคราะห์:{' '}
                <span className="font-bold text-slate-900">
                  {currentSummaries.length} {unitLabel}
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                ปลอดโรค 100% รวม {countAFree} {unitLabel}
              </div>
            </div>
          </div>

          {/* 4 Zone Definition Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Zone C - Red */}
            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs hover:border-red-300 transition-all">
              <div className="flex items-center justify-between text-xs text-red-700 font-bold mb-1">
                <span>🔴 สีแดง (Zone C / ระบาด)</span>
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {countC} <span className="text-xs text-slate-500 font-normal">{unitLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                พบสัตว์ติดเชื้อยืนยันผลแล็บ (Positive) / ระบาดซ้ำซ้อนในรอบ 1-2 ปี (พ.ศ. {selectedYearBE}, {prevYearBE}){' '}
                <span className="text-red-700 font-semibold">(บังคับวงรอบควบคุมโรค 3 กม. / ฉีดวัคซีน 5 กม.)</span>
              </p>
            </div>

            {/* Zone B+ - Orange */}
            <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between text-xs text-orange-700 font-bold mb-1">
                <span>🟠 สีส้ม (Zone B+ / เฝ้าระวังเข้มข้น)</span>
                <span className="w-3 h-3 rounded-full bg-[#F97316]" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {countBPlus} <span className="text-xs text-slate-500 font-normal">{unitLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                มีประวัติพบเชื้อในรอบ 2-3 ปี หรือเป็นพื้นที่รอยต่อสัมผัสโรค (Buffer Zone) ติดกับเขตระบาดสีแดง
              </p>
            </div>

            {/* Zone B - Yellow */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between text-xs text-amber-700 font-bold mb-1">
                <span>🟡 สีเหลือง (Zone B / เฝ้าระวังทั่วไป)</span>
                <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {countB} <span className="text-xs text-slate-500 font-normal">{unitLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                ไม่พบเชื้อในรอบ 3-5 ปี แต่มีชุมชนหนาแน่น/ตลาดสด/ชุมทางคมนาคม หรือฉีดวัคซีนสัตว์ &lt; 80%
              </p>
            </div>

            {/* Zone A / A Free - Green */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                <span>🟢 สีเขียว (Zone A / ปลอดโรค 100%)</span>
                <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {countAFree} <span className="text-xs text-slate-500 font-normal">{unitLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                ปลอดเชื้อติดต่อกันเกิน 5 ปี (ไม่มีรายงานสัตว์บวกตั้งแต่ พ.ศ. {selectedYearBE - 4} ย้อนไป) ฉีดวัคซีนสัตว์ ≥ 80% (Herd Immunity)
              </p>
            </div>
          </div>

          {/* Filter and Grid of Areas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-600" />
                  รายการ{unitLabel} ({filteredSummaries.length} {unitLabel})
                </h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  คลิกที่การ์ดเพื่อเจาะลึกระดับพื้นที่ย่อย (อำเภอ ➔ ตำบล ➔ หมู่บ้าน)
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
                >
                  <option value="all">ทุกระดับสีระบาดวิทยา ({currentSummaries.length} {unitLabel})</option>
                  <option value="C">เฉพาะ 🔴 สีแดง (Zone C / ระบาด)</option>
                  <option value="B_PLUS">เฉพาะ 🟠 สีส้ม (Zone B+ / เฝ้าระวังเข้มข้น)</option>
                  <option value="B">เฉพาะ 🟡 สีเหลือง (Zone B / เฝ้าระวังทั่วไป)</option>
                  <option value="A_FREE">เฉพาะ 🟢 สีเขียว (Zone A / ปลอดโรค 100%)</option>
                </select>
              </div>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSummaries.map((summary) => {
                const zoneCfg = getZoneBadgeConfig(summary.zone);
                const isSelected =
                  currentLevel === 'district'
                    ? selectedDistrict === summary.areaNameTh
                    : currentLevel === 'subdistrict'
                    ? selectedSubDistrict === summary.areaNameTh.replace('ต.', '')
                    : selectedVillage === summary.areaNameTh;

                return (
                  <div
                    key={summary.areaId}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {summary.areaNameTh}
                          {summary.subDistrictsCount ? (
                            <span className="text-[10px] font-normal px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {summary.subDistrictsCount} ตำบล
                            </span>
                          ) : null}
                        </h5>
                        <div className="text-[11px] text-slate-400">
                          {summary.areaNameEn ? `${summary.areaNameEn} • ` : ''}
                          {summary.parentDistrict ? `อ.${summary.parentDistrict}` : 'จ.นครศรีธรรมราช'}
                        </div>
                      </div>
                      <RiskBadge zone={summary.zone} />
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {summary.zoneReason}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                          ความครอบคลุมวัคซีนในสัตว์:
                        </span>
                        <span
                          className={`font-bold ${
                            summary.vaccineCoverageRate >= 80 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {formatPercent(summary.vaccineCoverageRate)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          สัตว์พบเชื้อปี {selectedYearBE}:
                        </span>
                        <span
                          className={`font-bold ${
                            summary.animalPositivesSelectedYear > 0 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {summary.animalPositivesSelectedYear} ตัวอย่าง
                          {summary.animalPositivesPrevYear > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              (ปี {prevYearBE}: {summary.animalPositivesPrevYear})
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          ดัชนีความเสี่ยง RRI:
                        </span>
                        <span className="font-bold text-slate-900">
                          {summary.riskIndexScore} / 100 ({summary.riskLevel})
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>สัดส่วนสุนัขจรจัด:</span>
                        <span className="font-medium text-slate-700">{formatPercent(summary.strayRatio)}</span>
                      </div>
                    </div>

                    {/* Drill-down Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {currentLevel === 'district' ? (
                        <button
                          onClick={() => setSelectedDistrict(summary.areaNameTh)}
                          className="w-full text-center text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg transition-colors"
                        >
                          <span>เจาะลึกรายตำบลใน อ.{summary.areaNameTh}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : currentLevel === 'subdistrict' ? (
                        <button
                          onClick={() => setSelectedSubDistrict(summary.areaNameTh.replace('ต.', ''))}
                          className="w-full text-center text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg transition-colors"
                        >
                          <span>เจาะลึกรายหมู่บ้านใน {summary.areaNameTh}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-center w-full">ระดับหมู่บ้านย่อยสุด</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DataSource source="ระบบสารสนเทศโรคพิษสุนัขบ้า (Thai Rabies Net) กรมปศุสัตว์ / คณะกรรมการโรคติดต่อจังหวัดนครศรีธรรมราช / ประกาศเขตพื้นที่ตาม พ.ร.บ.โรคพิษสุนัขบ้า พ.ศ. 2535" />
          </div>
        </div>
      )}

      {/* Mode 2: 5-Dimension Rabies-Free Assessment Panel */}
      {viewMode === 'assessment_5d' && (
        <RabiesFreeAssessmentPanel
          zoneSummaries={districtZoneSummaries}
          selectedDistrict={
            selectedDistrict === 'all'
              ? districtZoneSummaries[0]?.districtNameTh
              : selectedDistrict
          }
          onSelectDistrict={(distName) => setSelectedDistrict(distName)}
        />
      )}
    </div>
  );
};
