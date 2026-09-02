import React, { useState } from 'react';
import {
  Map as MapIcon,
  Layers,
  MapPin,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Syringe,
  Activity,
  Info,
  Compass,
  ArrowUpRight,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  Dog2025Row,
  RabiesRow,
  PepVacRow,
  DistrictInfo,
  AreaZoneSummary,
} from '../../types';
import { NAKHON_DISTRICTS, matchSubDistrict, matchVillage } from '../../data/nakhonDistricts';
import { useFilter } from '../../context/FilterContext';
import {
  calculateDistrictZoneSummaries,
  calculateDynamicAreaZoneSummaries,
  getZoneBadgeConfig,
} from '../../utils/zoneClassifier';
import { formatPercent, formatYearBE, toBE } from '../../utils/thaiYear';
import { DataSource } from '../common/DataSource';
import { RiskBadge } from '../common/RiskBadge';
import { CascadingLocationFilter } from '../common/CascadingLocationFilter';
import { LeafletGisMap } from '../map/LeafletGisMap';

interface GisMapViewProps {
  dogData: Dog2025Row[];
  rabiesData: RabiesRow[];
  pepData: PepVacRow[];
  forceFullscreen?: boolean;
}

export const GisMapView: React.FC<GisMapViewProps> = ({
  dogData,
  rabiesData,
  pepData,
  forceFullscreen = false,
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

  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(forceFullscreen);

  const selectedYearBE = toBE(selectedYear);

  // Dynamic area zone summaries based on cascade filters
  const dynamicAreaScope = calculateDynamicAreaZoneSummaries(
    selectedDistrict,
    selectedSubDistrict,
    selectedYear,
    dogData,
    rabiesData,
    pepData
  );

  const activeSummaries = dynamicAreaScope.summaries;
  const currentLevel = dynamicAreaScope.level;
  const unitLabel = currentLevel === 'district' ? 'อำเภอ' : currentLevel === 'subdistrict' ? 'ตำบล' : 'หมู่บ้าน';

  // Group dynamic summaries by epidemiological zones
  const zoneCAreas = activeSummaries.filter((z) => z.zone === 'C');
  const zoneBPlusAreas = activeSummaries.filter((z) => z.zone === 'B_PLUS');
  const zoneBAreas = activeSummaries.filter((z) => z.zone === 'B');
  const zoneAAreas = activeSummaries.filter((z) => z.zone === 'A_FREE' || z.zone === 'A');

  const formatAreaList = (list: AreaZoneSummary[]) => {
    if (list.length === 0) return 'ไม่มีพื้นที่ในเกณฑ์นี้สำหรับตัวกรองที่เลือก';
    return list
      .map((item) => item.areaNameTh.replace('นครศรีธรรมราช', '').replace('ต.', '').replace('อ.', ''))
      .join(', ');
  };

  const zoneSummaries = calculateDistrictZoneSummaries(selectedYear, dogData, rabiesData, pepData);

  // Overall Statistics for current selection
  const positiveCases = rabiesData.filter((r) => {
    if (r.Result !== 'Positive') return false;
    if (selectedYear !== 'all' && r.Submission_Date) {
      const yearBE = new Date(r.Submission_Date).getFullYear() + 543;
      if (yearBE !== selectedYear) return false;
    }
    if (selectedDistrict !== 'all' && r.District) {
      if (!r.District.includes(selectedDistrict) && !selectedDistrict.includes(r.District)) {
        return false;
      }
    }
    if (selectedSubDistrict !== 'all') {
      const subName = r.Sub_District || (r as any).SubDistrict;
      if (!matchSubDistrict(subName, selectedSubDistrict)) return false;
    }
    if (selectedVillage !== 'all') {
      const vilName = (r as any).Village || r.Sub_District;
      if (!matchVillage(vilName, selectedVillage)) return false;
    }
    return true;
  });

  const totalTested = rabiesData.filter((r) => {
    if (selectedYear !== 'all' && r.Submission_Date) {
      const yearBE = new Date(r.Submission_Date).getFullYear() + 543;
      if (yearBE !== selectedYear) return false;
    }
    if (selectedDistrict !== 'all' && r.District) {
      if (!r.District.includes(selectedDistrict) && !selectedDistrict.includes(r.District)) {
        return false;
      }
    }
    if (selectedSubDistrict !== 'all') {
      const subName = r.Sub_District || (r as any).SubDistrict;
      if (!matchSubDistrict(subName, selectedSubDistrict)) return false;
    }
    if (selectedVillage !== 'all') {
      const vilName = (r as any).Village || r.Sub_District;
      if (!matchVillage(vilName, selectedVillage)) return false;
    }
    return true;
  }).length;

  const handlePrint = () => {
    window.print();
  };

  if (forceFullscreen) {
    return (
      <div id="gis-map-view" className="w-screen h-screen m-0 p-0 overflow-hidden bg-slate-950">
        <LeafletGisMap
          dogData={dogData}
          rabiesData={rabiesData}
          pepData={pepData}
          isFullscreen={true}
          onDistrictSelect={(districtName) => setSelectedDistrict(districtName)}
        />
      </div>
    );
  }

  return (
    <div id="gis-map-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Interactive GIS Spatial Surveillance System (OpenStreetMap)
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {formatYearBE(selectedYear)}
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-600" />
            ระบบแผนที่และการลงสีตามขอบเขตพื้นที่ GIS (จังหวัด / 23 อำเภอ / ตำบล / หมู่บ้าน)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แผนที่ภูมิศาสตร์จริง OpenStreetMap พร้อมระบบลงสีจำแนกตามขอบเขตพื้นที่การปกครอง ระดับหมู่บ้าน ตำบล อำเภอ และจังหวัด เชื่อมโยงข้อมูล One Health ครบวงจร
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            id="gis-export-a4-btn"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>พิมพ์รายงาน A4 (Print/PDF)</span>
          </button>
        </div>
      </div>

      {/* Cascading Location Filter (Province -> District -> SubDistrict -> Village & Year) */}
      <CascadingLocationFilter />

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">จุดพบสัตว์ติดเชื้อ</div>
            <div className="text-lg font-bold text-rose-600">
              {positiveCases.length}{' '}
              <span className="text-xs font-normal text-slate-400">/ {totalTested} ตัวอย่าง</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">วงรอบควบคุมโรค 3/5 กม.</div>
            <div className="text-lg font-bold text-amber-700">
              {positiveCases.length > 0 ? `${positiveCases.length} วงรอบ` : 'ปลอดวงรอบฉุกเฉิน'}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">เป้าหมายวัคซีน WHO</div>
            <div className="text-lg font-bold text-emerald-700">&ge; 80% ทั่วทุกพื้นที่</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">ระดับการซูมแผนที่</div>
            <div className="text-lg font-bold text-blue-700">ตำบล / หมู่บ้าน / แม่น้ำ</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Leaflet OpenStreetMap */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Epidemiological Mapping Methodology Guide Card */}
        <div className="p-3.5 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl border border-slate-700 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  มาตรฐานงานระบาดวิทยา One Health
                </span>
                <span className="text-xs text-slate-300">
                  ปี พ.ศ. {selectedYearBE} • {dynamicAreaScope.scopeTitleTh}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                การระบายสีตามขอบเขตพื้นที่ (Polygon Fill) &amp; การแบ่งกลุ่มข้อมูลด้วยสี (Epidemiological Color Coding)
              </h3>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>เติมเต็มสีตามแนวเส้นขอบเขตการปกครองจริง รวม {activeSummaries.length} {unitLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5 text-xs">
            {/* Red Zone C */}
            <div className="p-2.5 bg-rose-950/50 rounded-lg border border-rose-600/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-rose-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shrink-0"></span>
                    <span>🔴 สีแดง (Zone C / พื้นที่ระบาด {zoneCAreas.length} {unitLabel})</span>
                  </div>
                </div>
                <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
                  พบสัตว์ติดเชื้อยืนยันผลแล็บ (Positive) / ระบาดซ้ำซ้อนในรอบ 1-2 ปี:
                  <strong className="block font-semibold text-rose-200 mt-0.5">
                    {formatAreaList(zoneCAreas)}
                  </strong>
                </p>
              </div>
              <div className="text-[10px] text-rose-300/80 mt-1.5 pt-1 border-t border-rose-800/50">
                ⚠️ บังคับวงรอบควบคุมโรค 3 กม. / ฉีดวัคซีน 5 กม.
              </div>
            </div>

            {/* Orange Zone B+ */}
            <div className="p-2.5 bg-amber-950/50 rounded-lg border border-orange-600/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-orange-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shrink-0"></span>
                    <span>🟠 สีส้ม (Zone B+ / เฝ้าระวังเข้มข้น {zoneBPlusAreas.length} {unitLabel})</span>
                  </div>
                </div>
                <p className="text-[11px] text-orange-200/90 mt-1 leading-relaxed">
                  มีประวัติพบเชื้อรอบ 2-3 ปี หรือเป็นรอยต่อสัมผัสโรค (Buffer Zone):
                  <strong className="block font-semibold text-orange-200 mt-0.5">
                    {formatAreaList(zoneBPlusAreas)}
                  </strong>
                </p>
              </div>
              <div className="text-[10px] text-orange-300/80 mt-1.5 pt-1 border-t border-orange-800/50">
                🛡️ ปูพรมฉีดวัคซีนเชิงรุก / เฝ้าระวังแนวเชื่อมต่อ
              </div>
            </div>

            {/* Yellow Zone B */}
            <div className="p-2.5 bg-yellow-950/50 rounded-lg border border-yellow-600/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-yellow-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white shrink-0"></span>
                    <span>🟡 สีเหลือง (Zone B / เฝ้าระวังทั่วไป {zoneBAreas.length} {unitLabel})</span>
                  </div>
                </div>
                <p className="text-[11px] text-yellow-200/90 mt-1 leading-relaxed">
                  ไม่พบเชื้อ 3-5 ปี แต่มีชุมชนหนาแน่น/ตลาดสด หรือวัคซีน &lt; 80%:
                  <strong className="block font-semibold text-yellow-200 mt-0.5">
                    {formatAreaList(zoneBAreas)}
                  </strong>
                </p>
              </div>
              <div className="text-[10px] text-yellow-300/80 mt-1.5 pt-1 border-t border-yellow-800/50">
                💉 เร่งรัดวัคซีนแตะ 80% / จัดหน่วยทำหมันสุนัขจรจัด
              </div>
            </div>

            {/* Green Zone A */}
            <div className="p-2.5 bg-emerald-950/50 rounded-lg border border-emerald-600/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0"></span>
                    <span>🟢 สีเขียว (Zone A / ปลอดโรค {zoneAAreas.length} {unitLabel})</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-200/90 mt-1 leading-relaxed">
                  ปลอดเชื้อติดต่อกันเกิน 5 ปี ฉีดวัคซีนสัตว์ &ge; 80% (Herd Immunity):
                  <strong className="block font-semibold text-emerald-200 mt-0.5">
                    {formatAreaList(zoneAAreas)}
                  </strong>
                </p>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1.5 pt-1 border-t border-emerald-800/50">
                ✅ คงสถานะวัคซีน ≥ 80% / เฝ้าระวังทางห้องปฏิบัติการ
              </div>
            </div>
          </div>
        </div>

        <LeafletGisMap
          dogData={dogData}
          rabiesData={rabiesData}
          pepData={pepData}
          isFullscreen={isMapFullscreen}
          onToggleFullscreen={setIsMapFullscreen}
          onDistrictSelect={(districtName) => setSelectedDistrict(districtName)}
        />
      </div>

      {/* District & SubDistrict Spatial Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Spatial Status Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                สถานะเชิงพื้นที่ ({activeSummaries.length} {unitLabel})
              </h3>
              <p className="text-xs text-slate-500">
                {dynamicAreaScope.scopeTitleTh} • คลิกเลือกพื้นที่เพื่อเจาะลึก
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              ปี พ.ศ. {selectedYearBE}
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ชื่อ{unitLabel}</th>
                  <th className="py-2.5 px-2 font-semibold">Zone</th>
                  <th className="py-2.5 px-2 font-semibold text-right">สัตว์ติดเชื้อ</th>
                  <th className="py-2.5 px-2 font-semibold text-right">วัคซีนสัตว์</th>
                  <th className="py-2.5 px-2 font-semibold text-right">สุนัขจรจัด</th>
                  <th className="py-2.5 px-2 font-semibold text-right">คะแนน RRI</th>
                  <th className="py-2.5 px-3 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSummaries.map((s) => {
                  const cleanName = s.areaNameTh.replace('ต.', '').replace('อ.', '').trim();
                  const isSelected =
                    (currentLevel === 'district' && (selectedDistrict === s.areaNameTh || selectedDistrict.includes(cleanName))) ||
                    (currentLevel === 'subdistrict' && selectedSubDistrict === cleanName);

                  return (
                    <tr
                      key={s.areaId}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                      }`}
                      onClick={() => {
                        if (currentLevel === 'district') {
                          setSelectedDistrict(cleanName);
                        } else if (currentLevel === 'subdistrict') {
                          setSelectedSubDistrict(cleanName);
                        }
                      }}
                    >
                      <td className="py-2 px-3 text-slate-900 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            s.zone === 'C'
                              ? 'bg-rose-600'
                              : s.zone === 'B_PLUS'
                              ? 'bg-orange-500'
                              : s.zone === 'B'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>{s.areaNameTh}</span>
                        {s.parentDistrict && currentLevel !== 'district' && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (อ.{s.parentDistrict})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <RiskBadge zone={s.zone} size="xs" />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span
                          className={`font-semibold ${
                            s.animalPositivesSelectedYear > 0 ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {s.animalPositivesSelectedYear}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span
                          className={`font-medium ${
                            s.vaccineCoverageRate >= 80 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {formatPercent(s.vaccineCoverageRate)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-slate-600">
                        {formatPercent(s.strayRatio)}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-900">
                        {s.riskIndexScore}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition-colors"
                        >
                          {currentLevel === 'district' ? 'ดูตำบล ➔' : currentLevel === 'subdistrict' ? 'ดูหมู่บ้าน ➔' : 'ซูม 🔍'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected District/SubDistrict Inspector Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              การเจาะลึกเชิงพื้นที่ (Location Inspector)
            </h3>
          </div>

          {(() => {
            const currentDistName = selectedDistrict === 'all' ? 'เมืองนครศรีธรรมราช' : selectedDistrict;
            const distObj =
              NAKHON_DISTRICTS.find((d) => d.nameTh.includes(currentDistName)) || NAKHON_DISTRICTS[0];
            const summary = zoneSummaries.find((z) => z.districtNameTh.includes(distObj.nameTh));
            const zone = summary ? summary.zone : 'A_FREE';

            return (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>อ.{distObj.nameTh}</span>
                    {selectedSubDistrict !== 'all' && (
                      <span className="text-sm font-medium text-emerald-700">
                        &gt; ต.{selectedSubDistrict}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {distObj.nameEn} | รหัส {distObj.code}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">ระดับความเสี่ยง:</span>
                  <RiskBadge zone={zone} />
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>ประชากรมนุษย์:</span>
                    <span className="font-bold text-slate-800">
                      {distObj.humanPopulation?.toLocaleString()} คน
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความครอบคลุมวัคซีนในสัตว์:</span>
                    <span className="font-bold text-emerald-600">
                      {formatPercent(summary?.vaccineCoverageRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>สัตว์ตรวจพบเชื้อ:</span>
                    <span className="font-bold text-rose-600">
                      {summary?.animalPositivesSelectedYear || 0} ตัวอย่าง
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ดัชนีความเสี่ยง RRI:</span>
                    <span className="font-bold text-slate-900">
                      {summary?.riskIndexScore}/100 ({summary?.riskLevel})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-slate-700">
                  <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    ตำบลในสังกัด ({distObj.subDistricts.length} ตำบล):
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {distObj.subDistricts.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubDistrict(sub)}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          selectedSubDistrict === sub
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        ต.{sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <DataSource source="ระบบสารสนเทศภูมิศาสตร์ GIS และแผนที่ OpenStreetMap ร่วมกับฐานข้อมูลเฝ้าระวังโรคพิษสุนัขบ้า (Thai Rabies Net & กรมควบคุมโรค)" />
    </div>
  );
};
