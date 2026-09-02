import React from 'react';
import { useFilter, AVAILABLE_YEARS_BE, FilterYear } from '../../context/FilterContext';
import { NAKHON_DISTRICTS } from '../../data/nakhonDistricts';
import {
  MapPin,
  Calendar,
  Layers,
  RotateCcw,
  Home,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { formatYearBE } from '../../utils/thaiYear';

interface CascadingLocationFilterProps {
  compact?: boolean;
  className?: string;
  showSpeciesFilter?: boolean;
  showSeverityFilter?: boolean;
}

export const CascadingLocationFilter: React.FC<CascadingLocationFilterProps> = ({
  compact = false,
  className = '',
  showSpeciesFilter = false,
  showSeverityFilter = false,
}) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    selectedSubDistrict,
    setSelectedSubDistrict,
    selectedVillage,
    setSelectedVillage,
    selectedSpecies,
    setSelectedSpecies,
    selectedSeverity,
    setSelectedSeverity,
    availableSubDistricts,
    availableVillages,
    resetFilters,
  } = useFilter();

  const isFiltered =
    selectedYear !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedSubDistrict !== 'all' ||
    selectedVillage !== 'all' ||
    selectedSpecies !== 'all' ||
    selectedSeverity !== 'all';

  return (
    <div
      id="cascading-location-filter"
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 sm:p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              ตัวกรองข้อมูลเชิงพื้นที่และเวลา (Spatial-Temporal Filters)
            </h3>
            <p className="text-xs text-slate-500">
              เชื่อมโยงระดับ จังหวัด &gt; อำเภอ &gt; ตำบล &gt; หมู่บ้าน ครอบคลุมทุกปีการเฝ้าระวัง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Primary Cascading Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Year Filter */}
        <div id="filter-year-wrapper">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>ปีข้อมูล (Surveillance Year)</span>
          </label>
          <div className="relative">
            <select
              id="select-filter-year"
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              {AVAILABLE_YEARS_BE.map((yr) => (
                <option key={yr} value={yr}>
                  {yr === 'all' ? '🌐 ทุกปี (ข้อมูลทั้งหมดทุกช่วงเวลา)' : `พ.ศ. ${yr} (${yr === 2569 ? '2026' : yr - 543})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. District Filter */}
        <div id="filter-district-wrapper">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>อำเภอ (District)</span>
          </label>
          <select
            id="select-filter-district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="all">📍 ทุกอำเภอในนครศรีธรรมราช ({NAKHON_DISTRICTS.length} อำเภอ)</option>
            {NAKHON_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameTh}>
                {d.nameTh} ({d.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* 3. SubDistrict Filter (Linked) */}
        <div id="filter-subdistrict-wrapper">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              ตำบล (Sub-district)
              {selectedDistrict !== 'all' && (
                <span className="text-[10px] text-emerald-600 font-normal ml-1">
                  (ใน อ.{selectedDistrict})
                </span>
              )}
            </span>
          </label>
          <select
            id="select-filter-subdistrict"
            value={selectedSubDistrict}
            onChange={(e) => setSelectedSubDistrict(e.target.value)}
            className="w-full text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="all">
              {selectedDistrict === 'all'
                ? '🏘️ ทุกตำบลในจังหวัด'
                : `🏘️ ทุกตำบลใน อ.${selectedDistrict} (${availableSubDistricts.length} ตำบล)`}
            </option>
            {availableSubDistricts.map((sub) => (
              <option key={sub} value={sub}>
                ต.{sub}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Village Filter (Linked) */}
        <div id="filter-village-wrapper">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              หมู่บ้าน / ชุมชน (Village)
              {selectedSubDistrict !== 'all' && (
                <span className="text-[10px] text-emerald-600 font-normal ml-1">
                  (ต.{selectedSubDistrict})
                </span>
              )}
            </span>
          </label>
          <select
            id="select-filter-village"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="all">
              {selectedSubDistrict === 'all'
                ? '🏡 ทุกหมู่บ้าน / ทุกชุมชน'
                : `🏡 ทุกหมู่บ้านใน ต.${selectedSubDistrict} (${availableVillages.length} แห่ง)`}
            </option>
            {availableVillages.map((vil) => (
              <option key={vil} value={vil}>
                {vil}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Species & Severity Filters if requested */}
      {(showSpeciesFilter || showSeverityFilter) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-slate-100">
          {showSpeciesFilter && (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                ชนิดสัตว์สัมผัส (Animal Species)
              </label>
              <select
                id="select-filter-species"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">🐾 สัตว์ทุกประเภท (สุนัข, แมว, โค, สุกร, ลิง ฯลฯ)</option>
                <option value="สุนัข">🐕 สุนัข (Dog)</option>
                <option value="แมว">🐈 แมว (Cat)</option>
                <option value="โค/กระบือ">🐂 โค / กระบือ (Cattle)</option>
                <option value="สุกร">🐖 สุกร (Pig)</option>
                <option value="อื่นๆ">🐒 สัตว์อื่นๆ (Other)</option>
              </select>
            </div>
          )}

          {showSeverityFilter && (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                ระดับความรุนแรงบาดแผล (WHO Exposure Category)
              </label>
              <select
                id="select-filter-severity"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">🛡️ ทุกระดับการสัมผัส (Category I, II, III)</option>
                <option value="Category 3">🔴 Category III (แผลเลือดออก / สัมผัสน้ำลายบนเยื่อบุ)</option>
                <option value="Category 2">🟡 Category II (รอยข่วนไม่มีเลือดออก / ถูกงับ)</option>
                <option value="Category 1">🟢 Category I (สัมผัสปกติ / ไม่มีความเสี่ยง)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Breadcrumbs & Summary */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
        <span className="text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          ขอบเขตการแสดงผล:
        </span>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
          <Calendar className="w-3 h-3 text-emerald-600" />
          {formatYearBE(selectedYear)}
        </span>

        <ChevronRight className="w-3 h-3 text-slate-300" />

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
          จ.นครศรีธรรมราช
        </span>

        {selectedDistrict !== 'all' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-medium border border-blue-200">
              อ.{selectedDistrict}
            </span>
          </>
        )}

        {selectedSubDistrict !== 'all' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-medium border border-purple-200">
              ต.{selectedSubDistrict}
            </span>
          </>
        )}

        {selectedVillage !== 'all' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
              {selectedVillage}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
