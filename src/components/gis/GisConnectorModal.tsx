import React, { useState, useMemo } from 'react';
import {
  Layers,
  Database,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Globe2,
  FileCode,
  Table as TableIcon,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  RefreshCw,
  Info,
  Building2,
  Home,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  AVAILABLE_GIS_SOURCES,
  convertPolygonsToGeoJson,
  parseGeoJsonToBoundaryPolygons,
  downloadGeoJsonFile,
  GisDataSourceInfo,
} from '../../utils/gisGeoJsonConnector';
import {
  getProvinceGeoJson,
  getDistrictsGeoJson,
  getSubdistrictsGeoJson,
  getCompleteAdministrativeGeoJson,
  NAKHON_GEOJSON_METADATA,
} from '../../data/nakhonGeoJsonLayer';
import { BoundaryPolygon, PolygonLevel } from '../../data/nakhonGeoPolygons';

interface GisConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  boundaryPolygons: BoundaryPolygon[];
  currentLevel: PolygonLevel;
  onLevelChange: (level: PolygonLevel) => void;
  onImportCustomPolygons?: (imported: BoundaryPolygon[]) => void;
  onSelectPolygon?: (poly: BoundaryPolygon) => void;
}

export const GisConnectorModal: React.FC<GisConnectorModalProps> = ({
  isOpen,
  onClose,
  boundaryPolygons,
  currentLevel,
  onLevelChange,
  onImportCustomPolygons,
  onSelectPolygon,
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'export' | 'geojson_preview' | 'table' | 'import'>('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [geoJsonInput, setGeoJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState<'districts' | 'subdistricts' | 'province' | 'master'>('districts');
  const [isCopied, setIsCopied] = useState(false);

  // Generate real preset GeoJSON based on active selection
  const activePresetGeoJson = useMemo(() => {
    switch (selectedPresetType) {
      case 'districts':
        return getDistrictsGeoJson();
      case 'subdistricts':
        return getSubdistrictsGeoJson();
      case 'province':
        return getProvinceGeoJson();
      case 'master':
        return getCompleteAdministrativeGeoJson();
    }
  }, [selectedPresetType]);

  const activePresetString = useMemo(() => {
    return JSON.stringify(activePresetGeoJson, null, 2);
  }, [activePresetGeoJson]);

  const handleCopyGeoJson = () => {
    navigator.clipboard.writeText(activePresetString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPreset = (type: 'districts' | 'subdistricts' | 'province' | 'master') => {
    let geoJsonData;
    let filename = '';
    if (type === 'districts') {
      geoJsonData = getDistrictsGeoJson();
      filename = 'nakhon_si_thammarat_23_districts_seamless.geojson';
    } else if (type === 'subdistricts') {
      geoJsonData = getSubdistrictsGeoJson();
      filename = 'nakhon_si_thammarat_154_subdistricts_seamless.geojson';
    } else if (type === 'province') {
      geoJsonData = getProvinceGeoJson();
      filename = 'nakhon_si_thammarat_province_boundary.geojson';
    } else {
      geoJsonData = getCompleteAdministrativeGeoJson();
      filename = 'nakhon_si_thammarat_master_administrative_all_levels.geojson';
    }
    downloadGeoJsonFile(geoJsonData, filename);
  };

  if (!isOpen) return null;

  // Filtered polygons for attribute table
  const filteredPolygons = useMemo(() => {
    return boundaryPolygons.filter((p) => {
      const matchSearch =
        searchQuery === '' ||
        p.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.parentDistrict && p.parentDistrict.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLevel = filterLevel === 'all' || p.level === filterLevel;
      const matchZone = filterZone === 'all' || p.stats?.zone === filterZone;

      return matchSearch && matchLevel && matchZone;
    });
  }, [boundaryPolygons, searchQuery, filterLevel, filterZone]);

  // Handle Export GeoJSON
  const handleExportGeoJson = () => {
    const geoJson = convertPolygonsToGeoJson(
      boundaryPolygons,
      `nakhon_gis_${currentLevel}_boundaries`
    );
    downloadGeoJsonFile(geoJson, `nakhon_gis_${currentLevel}_boundaries.geojson`);
  };

  // Handle Import GeoJSON text
  const handleProcessImport = () => {
    if (!geoJsonInput.trim()) {
      setImportStatus({ success: false, message: 'กรุณาวางโค้ด GeoJSON หรือเลือกไฟล์' });
      return;
    }
    setIsProcessing(true);
    const result = parseGeoJsonToBoundaryPolygons(geoJsonInput);
    setIsProcessing(false);

    if (result.success && result.polygons.length > 0) {
      setImportStatus({ success: true, message: result.message });
      if (onImportCustomPolygons) {
        onImportCustomPolygons(result.polygons);
      }
    } else {
      setImportStatus({ success: false, message: result.message });
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.zip')) {
      setIsProcessing(true);
      try {
        const shpModule = await import('shpjs');
        const shp = shpModule.default || shpModule;
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await (shp as any)(arrayBuffer);
        
        const content = JSON.stringify(geojson);
        setGeoJsonInput(content);
        const result = parseGeoJsonToBoundaryPolygons(content);
        if (result.success && result.polygons.length > 0) {
          setImportStatus({ success: true, message: `นำเข้า Shapefile สำเร็จ: ${result.message}` });
          if (onImportCustomPolygons) {
            onImportCustomPolygons(result.polygons);
          }
        } else {
          setImportStatus({ success: false, message: result.message });
        }
      } catch (err: any) {
        setImportStatus({ success: false, message: `เกิดข้อผิดพลาดในการอ่าน Shapefile: ${err.message}` });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setGeoJsonInput(content);
      const result = parseGeoJsonToBoundaryPolygons(content);
      if (result.success && result.polygons.length > 0) {
        setImportStatus({ success: true, message: result.message });
        if (onImportCustomPolygons) {
          onImportCustomPolygons(result.polygons);
        }
      } else {
        setImportStatus({ success: false, message: result.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ศูนย์เชื่อมโยงข้อมูล GIS &amp; สารสนเทศภูมิศาสตร์ (GIS GeoJSON Hub)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  High-Res Topology Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ขอบเขตการปกครองจริง (23 อำเภอ 154 ตำบล) โครงสร้าง Shared Vertices Topology 100% แนบสนิท ไร้รอยต่อ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'sources'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            แหล่งข้อมูล GIS ({AVAILABLE_GIS_SOURCES.length})
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'export'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            ดาวน์โหลด GeoJSON (Seamless)
          </button>

          <button
            onClick={() => setActiveTab('geojson_preview')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'geojson_preview'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            ตรวจสอบโค้ด GeoJSON (Live Inspector)
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'table'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            ตารางเชิงพื้นที่ ({boundaryPolygons.length} ขอบเขต)
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'import'
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-600" />
            นำเข้า GeoJSON / Shapefile
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          {/* TAB 1: GIS Sources */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <p className="font-bold text-sm">การเชื่อมโยงระบบ GIS ข้ามหน่วยงาน &amp; โครงสร้างเวกเตอร์ความละเอียดสูง</p>
                  <p className="mt-0.5 leading-relaxed text-indigo-800/90">
                    ระบบได้ผูกโยงข้อมูลเวกเตอร์ขอบเขตการปกครองจริง (Polygon Boundaries) ครบทั้ง <strong>23 อำเภอ 154 ตำบล</strong> ตามโครงสร้าง <strong>Shared Vertices Topology</strong> ซึ่งทำให้เส้นรอยต่อระหว่างพื้นที่ใช้จุดพิกัดเดียวกัน 100% ป้องกันปัญหาช่องว่าง (Gaps) และการทับซ้อน (Overlaps) ได้อย่างสมบูรณ์แบบ
                  </p>
                </div>
              </div>

              {/* High-Res Technical Specs Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">จำนวนอำเภอ (ADM2)</div>
                  <div className="text-base font-bold text-indigo-600">23 อำเภอ</div>
                  <div className="text-[10px] text-slate-400">833 จุดพิกัดต่อเชื่อม</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">จำนวนตำบล (ADM3)</div>
                  <div className="text-base font-bold text-emerald-600">154 ตำบล</div>
                  <div className="text-[10px] text-slate-400">6,729 จุดพิกัดแนบสนิท</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">ระบบพิกัดอ้างอิง</div>
                  <div className="text-base font-bold text-slate-800">WGS84 / CRS84</div>
                  <div className="text-[10px] text-slate-400">EPSG:4326 (RFC 7946)</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">ความแม่นยำพิกัด</div>
                  <div className="text-base font-bold text-amber-600">5 ทศนิยม</div>
                  <div className="text-[10px] text-slate-400">~1.1 เมตรบนพื้นดิน</div>
                </div>
              </div>

              {/* Administrative Level Quick Switcher */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800">เลือกระดับชั้นขอบเขตที่ต้องการแสดงผล (Active Boundary Tier):</span>
                  <p className="text-[11px] text-slate-500">สลับการระบายสีตามระดับการปกครอง</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => onLevelChange('province')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      currentLevel === 'province'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    ระดับจังหวัด (1)
                  </button>
                  <button
                    onClick={() => onLevelChange('district')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      currentLevel === 'district'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    ระดับอำเภอ (23)
                  </button>
                  <button
                    onClick={() => onLevelChange('subdistrict')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      currentLevel === 'subdistrict'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    ระดับตำบล (154)
                  </button>
                  <button
                    onClick={() => onLevelChange('village')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      currentLevel === 'village'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    ระดับหมู่บ้าน/ชุมชน
                  </button>
                </div>
              </div>

              {/* GIS Sources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {AVAILABLE_GIS_SOURCES.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                            {src.format}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{src.nameTh}</h4>
                            <p className="text-[10px] text-slate-500">{src.organization}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          เชื่อมโยงแล้ว
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{src.description}</p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>จำนวนฟีเจอร์: <strong className="text-slate-800">{src.itemCount.toLocaleString()} ชิ้น</strong></span>
                      <span>อัปเดตล่าสุด: {src.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Seamless GeoJSON Download Center */}
          {activeTab === 'export' && (
            <div className="space-y-4 max-w-3xl mx-auto py-2">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  ศูนย์ดาวน์โหลดชั้นข้อมูลเวกเตอร์ GeoJSON (RFC 7946 High-Resolution)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ดาวน์โหลดไฟล์เวกเตอร์ขอบเขตพร้อมข้อมูลสถิติระบาดวิทยา One Health แบบ 100% Seamless Topology สำหรับนำเข้า QGIS, ArcGIS, Mapbox หรือระบบสารสนเทศสุขภาพ
                </p>
              </div>

              {/* 4 Preset Download Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. 23 Districts Seamless */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                        23 อำเภอ (ADM2)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Zero Gaps
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">ขอบเขต 23 อำเภอ จังหวัดนครศรีธรรมราช</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      พิกัด 23 อำเภอครบถ้วน พร้อมรอยต่อแบบ Shared Vertices แนบสนิท 100% พร้อม Attributes: DOPA Code, Zone ปศุสัตว์, RRI Risk Score
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPreset('districts')}
                    className="mt-3.5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลด 23 อำเภอ (.geojson)
                  </button>
                </div>

                {/* 2. 154 Sub-districts Seamless */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                        154 ตำบล (ADM3)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Shared Topology
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">ขอบเขต 154 ตำบล ครบทั้ง 23 อำเภอ</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ขอบเขตระดับตำบลครบถ้วน 154 ตำบล แบ่งพื้นที่แนบสนิทไร้ช่องว่าง พร้อมข้อมูลรายชื่อหมู่บ้าน, อำเภอสังกัด และสถิติระบาด
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPreset('subdistricts')}
                    className="mt-3.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลด 154 ตำบล (.geojson)
                  </button>
                </div>

                {/* 3. Province Perimeter */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                        ระดับจังหวัด (ADM1)
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Perimeter
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">เส้นขอบเขตจังหวัดนครศรีธรรมราช</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      เส้นรอบรูปจังหวัดนครศรีธรรมราช (ชายฝั่งอ่าวไทย แหลมตะลุมพุก และแนวเทือกเขานครศรีธรรมราช)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPreset('province')}
                    className="mt-3.5 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลด ขอบเขตจังหวัด (.geojson)
                  </button>
                </div>

                {/* 4. Complete Master Hierarchy */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                        Master Dataset (All Levels)
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        178 Features
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">รวมทุกระดับการปกครอง (จังหวัด + อำเภอ + ตำบล)</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ชุดข้อมูลสมบูรณ์แบบ 1 จังหวัด + 23 อำเภอ + 154 ตำบล บรรจุใน FeatureCollection เดียวกันพร้อม Metadata
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPreset('master')}
                    className="mt-3.5 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลด Master GeoJSON (.geojson)
                  </button>
                </div>
              </div>

              {/* Current Active View Export */}
              <div className="mt-4 p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-indigo-900">ส่งออกข้อมูลจากมุมมองปัจจุบันบนหน้าจอ</div>
                  <div className="text-[11px] text-indigo-700">ขอบเขตที่กำลังแสดงบนแผนที่ ({boundaryPolygons.length} โพลิกอน ระดับ {currentLevel})</div>
                </div>
                <button
                  onClick={handleExportGeoJson}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  ส่งออกมุมมองปัจจุบัน
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Live GeoJSON Code Inspector */}
          {activeTab === 'geojson_preview' && (
            <div className="space-y-3.5">
              {/* Preset Selector & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">เลือกชุดข้อมูลเพื่อตรวจสอบ:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs">
                    <button
                      onClick={() => setSelectedPresetType('districts')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        selectedPresetType === 'districts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      23 อำเภอ
                    </button>
                    <button
                      onClick={() => setSelectedPresetType('subdistricts')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        selectedPresetType === 'subdistricts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      154 ตำบล
                    </button>
                    <button
                      onClick={() => setSelectedPresetType('province')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        selectedPresetType === 'province' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      จังหวัด
                    </button>
                    <button
                      onClick={() => setSelectedPresetType('master')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        selectedPresetType === 'master' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Master รวม
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    ฟีเจอร์: <strong>{activePresetGeoJson.features.length} ชิ้น</strong>
                  </span>
                  <button
                    onClick={handleCopyGeoJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอก GeoJSON'}
                  </button>
                  <button
                    onClick={() => handleDownloadPreset(selectedPresetType)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ดาวน์โหลดไฟล์
                  </button>
                </div>
              </div>

              {/* GeoJSON Code Viewer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-400 p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre leading-relaxed">{activePresetString.slice(0, 10000)}
                  {activePresetString.length > 10000 && `\n\n... (ข้อมูลมีความยาว ${activePresetString.length.toLocaleString()} ตัวอักษร แสดงตัวอย่าง 10,000 ตัวอักษรแรก)`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Attribute Table */}
          {activeTab === 'table' && (
            <div className="space-y-3.5">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่ออำเภอ, ตำบล, หรือรหัส DOPA..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="all">ทุกระดับชั้น (All Tiers)</option>
                    <option value="province">ระดับจังหวัด</option>
                    <option value="district">ระดับอำเภอ (23)</option>
                    <option value="subdistrict">ระดับตำบล (154)</option>
                    <option value="village">ระดับหมู่บ้าน</option>
                  </select>

                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="all">ทุกโซนความเสี่ยง (All Zones)</option>
                    <option value="C">Zone C (เสี่ยงสูงมาก/ระบาด)</option>
                    <option value="B_PLUS">Zone B+ (เฝ้าระวังเข้มข้น)</option>
                    <option value="B">Zone B (เฝ้าระวังทั่วไป)</option>
                    <option value="A_FREE">Zone A-Free (ปลอดโรค)</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">ชื่อพื้นที่ (Area Name)</th>
                        <th className="p-2.5">ระดับ (Tier)</th>
                        <th className="p-2.5">อำเภอสังกัด</th>
                        <th className="p-2.5 text-center">โซนปศุสัตว์</th>
                        <th className="p-2.5 text-right">ครอบคลุมวัคซีน</th>
                        <th className="p-2.5 text-right">คะแนน RRI</th>
                        <th className="p-2.5 text-right">สัตว์ติดเชื้อ</th>
                        <th className="p-2.5 text-center">พิกัด Centroid</th>
                        <th className="p-2.5 text-center">การกระทำ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPolygons.map((poly) => {
                        const zone = poly.stats?.zone || 'B';
                        const zoneBadge =
                          zone === 'C'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : zone === 'B'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                        return (
                          <tr key={poly.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-2.5 font-bold text-slate-900">
                              {poly.nameTh}
                              <span className="block text-[10px] font-normal text-slate-400">{poly.nameEn}</span>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              {poly.level === 'province'
                                ? '🏛️ จังหวัด'
                                : poly.level === 'district'
                                ? '📍 อำเภอ'
                                : poly.level === 'subdistrict'
                                ? '🏘️ ตำบล'
                                : '🏡 หมู่บ้าน'}
                            </td>
                            <td className="p-2.5 text-slate-600">{poly.parentDistrict || '-'}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${zoneBadge}`}>
                                Zone {zone}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-medium text-slate-700">
                              {poly.stats?.animalVaccineRate.toFixed(1)}%
                            </td>
                            <td className="p-2.5 text-right font-bold text-indigo-700">
                              {poly.stats?.rriScore.toFixed(0)}
                            </td>
                            <td className="p-2.5 text-right font-bold text-rose-600">
                              {poly.stats?.positiveCases || 0} ตัว
                            </td>
                            <td className="p-2.5 text-center font-mono text-[10px] text-slate-500">
                              {poly.center[0].toFixed(3)}, {poly.center[1].toFixed(3)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  if (onSelectPolygon) onSelectPolygon(poly);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Eye className="w-3 h-3" />
                                ซูมดูพื้นที่
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPolygons.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-slate-400">
                            ไม่พบข้อมูลขอบเขตพื้นที่ที่ตรงกับเงื่อนไขการค้นหา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Import GeoJSON */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  นำเข้าไฟล์เส้นขอบเขต GIS จากภายนอก (Custom GeoJSON Layer)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รองรับไฟล์ <code>.geojson</code> หรือ <code>.json</code> จากระบบ GIS ของ อปท., สสจ., หรือสำนักงานปศุสัตว์
                </p>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 bg-slate-50/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">คลิกเพื่อเลือกไฟล์ GeoJSON หรือลากไฟล์มาวางที่นี่</p>
                <p className="text-[11px] text-slate-400 mt-1">รองรับไฟล์ .geojson, .json, .zip (Shapefile)</p>
                <input
                  type="file"
                  accept=".geojson,.json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="gis-file-upload-input"
                />
                <label
                  htmlFor="gis-file-upload-input"
                  className="mt-3 inline-block px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  เลือกไฟล์จากเครื่อง
                </label>
              </div>

              {/* GeoJSON Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">หรือวางโค้ด JSON / GeoJSON โดยตรง:</label>
                <textarea
                  rows={5}
                  value={geoJsonInput}
                  onChange={(e) => setGeoJsonInput(e.target.value)}
                  placeholder='{"type": "FeatureCollection", "features": [...]}'
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Info className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <button
                onClick={handleProcessImport}
                disabled={isProcessing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                ประมวลผลและแสดงผลบนแผนที่ทันที
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ระบบพิกัด: WGS84 / EPSG:4326 | 100% Shared Vertices Topology Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
