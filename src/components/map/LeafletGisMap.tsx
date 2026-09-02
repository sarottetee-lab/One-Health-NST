import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon URL issues in bundled environments
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('Leaflet icon initialization note:', e);
}
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Syringe,
  Building,
  Info,
  Maximize2,
  LocateFixed,
  Minimize2,
  Sparkles,
  Compass,
  Eye,
  AlertTriangle,
  Shield,
  Droplet,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Database,
  Globe2,
  Building2,
  Home,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Dog2025Row,
  RabiesRow,
  PepVacRow,
  DistrictInfo,
  StrayHabitatFoodSource,
  HabitatCategory,
  StrayRiskLevel,
} from '../../types';
import {
  NAKHON_DISTRICTS,
  SUBDISTRICT_GEODATA,
  getLocationCoordinates,
  matchSubDistrict,
  matchVillage,
} from '../../data/nakhonDistricts';
import {
  getStrayHabitats,
  saveCustomStrayHabitat,
  deleteCustomStrayHabitat,
  HABITAT_CATEGORY_CONFIGS,
  STRAY_RISK_CONFIGS,
} from '../../data/strayHabitatsData';
import { StrayHabitatManagerModal } from './StrayHabitatManagerModal';
import { GisConnectorModal } from '../gis/GisConnectorModal';
import {
  PolygonLevel,
  ThematicMetric,
  BoundaryPolygon,
  THEMATIC_METRIC_CONFIGS,
  generateBoundariesForScope,
} from '../../data/nakhonGeoPolygons';
import { useFilter } from '../../context/FilterContext';
import {
  calculateDistrictZoneSummaries,
  getZoneBadgeConfig,
} from '../../utils/zoneClassifier';
import { formatPercent, formatYearBE } from '../../utils/thaiYear';

// Base Tile Layer Providers
export type MapTileStyle = 'osm' | 'satellite' | 'topo' | 'hot' | 'light' | 'dark';

interface TileConfig {
  id: MapTileStyle;
  name: string;
  nameEn: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const TILE_CONFIGS: Record<MapTileStyle, TileConfig> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap มาตรฐาน',
    nameEn: 'OSM Standard (ถนน/หมู่บ้าน/แม่น้ำ)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'ภาพถ่ายดาวเทียมความคมชัดสูง',
    nameEn: 'Esri World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  topo: {
    id: 'topo',
    name: 'แผนที่ภูมิประเทศ / สันเขาและแม่น้ำ',
    nameEn: 'OpenTopoMap (Topographic Terrain)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  hot: {
    id: 'hot',
    name: 'แผนที่สาธารณสุขและชุมชน',
    nameEn: 'Humanitarian OSM (HOT)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team',
    maxZoom: 19,
  },
  light: {
    id: 'light',
    name: 'โทนสว่าง คลีนตา',
    nameEn: 'CartoDB Positron (Clean Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    name: 'โหมดมืด (Dark GIS Laboratory)',
    nameEn: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

// Major Hospitals and Emergency PEP Clinics
const HOSPITALS_DATA = [
  { name: 'รพ.มหาราชนครศรีธรรมราช (ศูนย์ตติยภูมิ)', lat: 8.4195, lng: 99.9634, type: 'ศูนย์เชี่ยวชาญระดับสูง', beds: 800, district: 'เมืองนครศรีธรรมราช' },
  { name: 'รพ.ทุ่งสง (ศูนย์การแพทย์ตอนใต้)', lat: 8.1648, lng: 99.6805, type: 'รพ.ทั่วไป M1', beds: 350, district: 'ทุ่งสง' },
  { name: 'รพ.ท่าศาลา (ศูนย์การแพทย์มหาวิทยาลัยวลัยลักษณ์)', lat: 8.6653, lng: 99.9239, type: 'รพ.ศูนย์การแพทย์มหาวิทยาลัย', beds: 400, district: 'ท่าศาลา' },
  { name: 'รพ.สิชล (ศูนย์ตติยภูมิโซนเหนือ)', lat: 9.0017, lng: 99.9044, type: 'รพ.ทั่วไป M2', beds: 300, district: 'สิชล' },
  { name: 'รพ.สมเด็จพระยุพราชฉวาง', lat: 8.4239, lng: 99.5019, type: 'รพ.ชุมชน F1', beds: 120, district: 'ฉวาง' },
  { name: 'รพ.ปากพนัง', lat: 8.3517, lng: 100.2025, type: 'รพ.ชุมชน F1', beds: 120, district: 'ปากพนัง' },
  { name: 'รพ.ร่อนพิบูลย์', lat: 8.1794, lng: 99.8544, type: 'รพ.ชุมชน F2', beds: 90, district: 'ร่อนพิบูลย์' },
  { name: 'รพ.ชะอวด', lat: 7.9686, lng: 99.9983, type: 'รพ.ชุมชน F2', beds: 90, district: 'ชะอวด' },
  { name: 'รพ.ขนอม', lat: 9.2017, lng: 99.8603, type: 'รพ.ชุมชน F2', beds: 60, district: 'ขนอม' },
  { name: 'รพ.ลานสกา', lat: 8.3417, lng: 99.7786, type: 'รพ.ชุมชน F2', beds: 60, district: 'ลานสกา' },
  { name: 'รพ.พรหมคีรี', lat: 8.5303, lng: 99.8164, type: 'รพ.ชุมชน F2', beds: 60, district: 'พรหมคีรี' },
  { name: 'รพ.นบพิตำ', lat: 8.7189, lng: 99.7542, type: 'รพ.ชุมชน F3', beds: 30, district: 'นบพิตำ' },
];

// Major Rivers, Waterways, and Ecological Landmarks
const WATERWAYS_DATA = [
  { name: 'แม่น้ำตาปี (ตอนบน - ต้นน้ำเทือกเขาหลวง)', lat: 8.5833, lng: 99.6000, type: 'แม่น้ำสายหลัก' },
  { name: 'แม่น้ำปากพนัง (ลุ่มน้ำปากพนังอันเนื่องมาจากพระราชดำริ)', lat: 8.3517, lng: 100.2025, type: 'แม่น้ำสายหลัก' },
  { name: 'คลองท่าดี (ไหลผ่านหมู่บ้านคีรีวง อ.ลานสกา)', lat: 8.3680, lng: 99.7890, type: 'ลำน้ำธรรมชาติ' },
  { name: 'คลองกลาย (ลุ่มน้ำนบพิตำ-ท่าศาลา)', lat: 8.7450, lng: 99.8850, type: 'ลำน้ำธรรมชาติ' },
  { name: 'อ่างเก็บน้ำกะทูน (สวิสเซอร์แลนด์แดนใต้ อ.พิปูน)', lat: 8.6250, lng: 99.5650, type: 'อ่างเก็บน้ำขนาดใหญ่' },
  { name: 'แหลมตะลุมพุก (อ่าวไทย)', lat: 8.5120, lng: 100.1450, type: 'ชายฝั่งทะเล' },
];

interface LeafletGisMapProps {
  dogData: Dog2025Row[];
  rabiesData: RabiesRow[];
  pepData: PepVacRow[];
  className?: string;
  onDistrictSelect?: (districtName: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: (fullscreen: boolean) => void;
}

export const LeafletGisMap: React.FC<LeafletGisMapProps> = ({
  dogData,
  rabiesData,
  pepData,
  className = '',
  onDistrictSelect,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen,
}) => {
  const {
    selectedYear,
    selectedDistrict,
    setSelectedDistrict,
    selectedSubDistrict,
    setSelectedSubDistrict,
    selectedVillage,
    setSelectedVillage,
  } = useFilter();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{
    positives: L.LayerGroup;
    buffers3k: L.LayerGroup;
    buffers5k: L.LayerGroup;
    polygons: L.LayerGroup;
    polygonLabels: L.LayerGroup;
    districts: L.LayerGroup;
    hospitals: L.LayerGroup;
    waterways: L.LayerGroup;
    strayHabitats: L.LayerGroup;
  }>({
    positives: L.layerGroup(),
    buffers3k: L.layerGroup(),
    buffers5k: L.layerGroup(),
    polygons: L.layerGroup(),
    polygonLabels: L.layerGroup(),
    districts: L.layerGroup(),
    hospitals: L.layerGroup(),
    waterways: L.layerGroup(),
    strayHabitats: L.layerGroup(),
  });

  // Layer Visibility & Polygon Thematic States
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('osm');
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showChoroplethLabels, setShowChoroplethLabels] = useState<boolean>(true);
  const [showStatsSummary, setShowStatsSummary] = useState<boolean>(true);
  const [polygonLevel, setPolygonLevel] = useState<PolygonLevel>('auto');
  const [thematicMetric, setThematicMetric] = useState<ThematicMetric>('rri');
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.50);
  const [showPositives, setShowPositives] = useState<boolean>(true);
  const [showBuffer3km, setShowBuffer3km] = useState<boolean>(true);
  const [showBuffer5km, setShowBuffer5km] = useState<boolean>(true);
  const [showDistricts, setShowDistricts] = useState<boolean>(false);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showWaterways, setShowWaterways] = useState<boolean>(false);

  // Stray Animal Habitats & Food Sources States
  const [showStrayHabitats, setShowStrayHabitats] = useState<boolean>(true);
  const [strayCategoryFilter, setStrayCategoryFilter] = useState<string>('all');
  const [strayRiskFilter, setStrayRiskFilter] = useState<string>('all');
  const [isPinDroppingMode, setIsPinDroppingMode] = useState<boolean>(false);
  const [showHabitatModal, setShowHabitatModal] = useState<boolean>(false);
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHabitatDetail, setSelectedHabitatDetail] = useState<StrayHabitatFoodSource | null>(null);
  const [habitatsVersion, setHabitatsVersion] = useState<number>(0);

  const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen;

  const toggleFullscreen = (val?: boolean) => {
    const nextVal = val !== undefined ? val : !isFullscreen;
    if (onToggleFullscreen) {
      onToggleFullscreen(nextVal);
    } else {
      setInternalFullscreen(nextVal);
    }
  };

  // Lock body scroll during fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'layers' | 'thematic' | 'basemap'>('layers');
  const [isLegendCollapsed, setIsLegendCollapsed] = useState<boolean>(false);
  const [showGisConnectorModal, setShowGisConnectorModal] = useState<boolean>(false);
  const [customPolygons, setCustomPolygons] = useState<BoundaryPolygon[]>([]);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPolygonDetail, setSelectedPolygonDetail] = useState<BoundaryPolygon | null>(null);

  // Compute Zone summaries
  const zoneSummaries = useMemo(() => {
    return calculateDistrictZoneSummaries(selectedYear, dogData, rabiesData, pepData);
  }, [selectedYear, dogData, rabiesData, pepData]);

  // Compute Active Boundary Polygons (including standard levels + custom imported GIS polygons)
  const boundaryPolygons = useMemo(() => {
    const generated = generateBoundariesForScope(
      polygonLevel,
      selectedDistrict,
      selectedSubDistrict,
      selectedVillage,
      selectedYear,
      dogData,
      rabiesData,
      pepData,
      zoneSummaries
    );

    if (customPolygons.length > 0) {
      return [...generated, ...customPolygons];
    }
    return generated;
  }, [
    polygonLevel,
    selectedDistrict,
    selectedSubDistrict,
    selectedVillage,
    selectedYear,
    dogData,
    rabiesData,
    pepData,
    zoneSummaries,
    customPolygons,
  ]);

  // Filter positive cases for selected year & location
  const filteredPositiveCases = useMemo(() => {
    const isAllYears = selectedYear === 'all';
    const yearBE = typeof selectedYear === 'number' ? selectedYear : 2568;

    return rabiesData.filter((r) => {
      if (r.Result !== 'Positive') return false;

      // Year filter
      if (!isAllYears && r.Submission_Date) {
        const rowYear = new Date(r.Submission_Date).getFullYear() + 543;
        if (rowYear !== yearBE) return false;
      }

      // District filter
      if (selectedDistrict !== 'all' && r.District) {
        if (!r.District.includes(selectedDistrict) && !selectedDistrict.includes(r.District)) {
          return false;
        }
      }

      // SubDistrict filter
      if (selectedSubDistrict !== 'all') {
        const subName = r.Sub_District || (r as any).SubDistrict;
        if (!matchSubDistrict(subName, selectedSubDistrict)) {
          return false;
        }
      }

      // Village filter
      if (selectedVillage !== 'all') {
        const vilName = (r as any).Village || r.Sub_District;
        if (!matchVillage(vilName, selectedVillage)) {
          return false;
        }
      }

      return true;
    });
  }, [rabiesData, selectedYear, selectedDistrict, selectedSubDistrict, selectedVillage]);

  // Compute Choropleth quantitative statistics across active polygons
  const choroplethStats = useMemo(() => {
    const metricConfig = THEMATIC_METRIC_CONFIGS[thematicMetric];
    const values: number[] = [];
    const classCounts: Record<number, number> = {};

    metricConfig.legends.forEach((_, idx) => {
      classCounts[idx] = 0;
    });

    let maxItem: { name: string; value: number } | null = null;
    let minItem: { name: string; value: number } | null = null;

    boundaryPolygons.forEach((poly) => {
      const rawVal = metricConfig.getValue(poly.stats);
      if (typeof rawVal === 'number' && !isNaN(rawVal)) {
        values.push(rawVal);
        if (!maxItem || rawVal > maxItem.value) {
          maxItem = { name: poly.nameTh, value: rawVal };
        }
        if (!minItem || rawVal < minItem.value) {
          minItem = { name: poly.nameTh, value: rawVal };
        }
      }

      const styleInfo = metricConfig.getColor(poly.stats, poly);
      const matchedIdx = metricConfig.legends.findIndex(
        (lg) => lg.color.toLowerCase() === styleInfo.color.toLowerCase() || styleInfo.label.includes(lg.label.slice(0, 5))
      );
      if (matchedIdx >= 0) {
        classCounts[matchedIdx] = (classCounts[matchedIdx] || 0) + 1;
      } else {
        classCounts[0] = (classCounts[0] || 0) + 1;
      }
    });

    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return {
      count: boundaryPolygons.length,
      avg,
      maxItem,
      minItem,
      classCounts,
      isNumeric: values.length > 0,
    };
  }, [boundaryPolygons, thematicMetric]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Clear any previous leaflet instance from container node if remounting
        const container = mapContainerRef.current as any;
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [8.4304, 99.9631], // Nakhon Si Thammarat Center
          zoom: 10,
          minZoom: 7,
          maxZoom: 19,
          zoomControl: false, // Custom control placement
          attributionControl: true,
        });

        // Add scale control (Metric kilometers / meters)
        L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

        // Track mouse coordinates
        map.on('mousemove', (e: L.LeafletMouseEvent) => {
          setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        // Initialize initial tile layer
        const config = TILE_CONFIGS[mapStyle];
        const tileLayer = L.tileLayer(config.url, {
          attribution: config.attribution,
          maxZoom: config.maxZoom,
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        // Dedicated Map Panes with ordered Z-Index for clean visual stacking
        if (!map.getPane('gisPolygonsPane')) {
          const polyPane = map.createPane('gisPolygonsPane');
          polyPane.style.zIndex = '350';
        }
        if (!map.getPane('gisBuffersPane')) {
          const bufPane = map.createPane('gisBuffersPane');
          bufPane.style.zIndex = '380';
        }
        if (!map.getPane('gisWaterwaysPane')) {
          const waterPane = map.createPane('gisWaterwaysPane');
          waterPane.style.zIndex = '400';
        }
        if (!map.getPane('gisStrayHabitatsPane')) {
          const strayPane = map.createPane('gisStrayHabitatsPane');
          strayPane.style.zIndex = '450';
        }
        if (!map.getPane('gisPositivesPane')) {
          const posPane = map.createPane('gisPositivesPane');
          posPane.style.zIndex = '500';
        }
        if (!map.getPane('gisLabelsPane')) {
          const labelPane = map.createPane('gisLabelsPane');
          labelPane.style.zIndex = '550';
        }

        // Add all layer groups to map (Polygon layer at base, labels & points on top)
        layerGroupsRef.current.polygons.addTo(map);
        layerGroupsRef.current.polygonLabels.addTo(map);
        layerGroupsRef.current.buffers5k.addTo(map);
        layerGroupsRef.current.buffers3k.addTo(map);
        layerGroupsRef.current.waterways.addTo(map);
        layerGroupsRef.current.districts.addTo(map);
        layerGroupsRef.current.hospitals.addTo(map);
        layerGroupsRef.current.strayHabitats.addTo(map);
        layerGroupsRef.current.positives.addTo(map);

        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.warn('Leaflet map initialization safe catch:', err);
    }

    return () => {
      // Cleanup on unmount
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (mapContainerRef.current) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }
      } catch (e) {
        console.warn('Leaflet map cleanup safe catch:', e);
      }
    };
  }, []);

  // Map Click Listener for Dropping Hotspot Pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPinDroppingMode) {
        setNewPinCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowHabitatModal(true);
        setIsPinDroppingMode(false);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPinDroppingMode]);

  // 2. Switch Map Tile Style (OSM, Satellite, Topo, HOT, Light, Dark)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = TILE_CONFIGS[mapStyle];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // 3. Auto-Zoom and Pan when selectedDistrict or selectedSubDistrict changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const target = getLocationCoordinates(selectedDistrict, selectedSubDistrict);
    map.flyTo([target.lat, target.lng], target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedDistrict, selectedSubDistrict, selectedVillage]);

  // 4. Render Layers: Polygons with Choropleth Thematic Coloring, Badges, Outbreaks, Buffers, Hospitals, Waterways
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const {
      polygons: polyGroup,
      polygonLabels: polyLabelGroup,
      positives: posGroup,
      buffers3k: b3Group,
      buffers5k: b5Group,
      districts: distGroup,
      hospitals: hospGroup,
      waterways: waterGroup,
      strayHabitats: strayGroup,
    } = layerGroupsRef.current;

    // Clear all layers before re-populating
    polyGroup.clearLayers();
    polyLabelGroup.clearLayers();
    posGroup.clearLayers();
    b3Group.clearLayers();
    b5Group.clearLayers();
    distGroup.clearLayers();
    hospGroup.clearLayers();
    waterGroup.clearLayers();
    strayGroup.clearLayers();

    const metricConfig = THEMATIC_METRIC_CONFIGS[thematicMetric];

    // A. Render Boundary Polygons with Thematic Metric Color Palette & Value Labels
    if (showPolygons) {
      boundaryPolygons.forEach((poly) => {
        const styleInfo = metricConfig.getColor(poly.stats, poly);
        const isFocusDistrict = selectedDistrict !== 'all' && (poly.nameTh.includes(selectedDistrict) || selectedDistrict.includes(poly.nameTh));
        const isFocusSub = selectedSubDistrict !== 'all' && (poly.nameTh.includes(selectedSubDistrict) || selectedSubDistrict.includes(poly.nameTh));
        const isHighlighted = isFocusDistrict || isFocusSub;

        // Custom stroke styling based on administrative hierarchy
        let strokeColor = isHighlighted ? '#ffffff' : (styleInfo.strokeColor || styleInfo.color);
        let strokeWeight = isHighlighted ? 4.0 : (thematicMetric === 'reference_map' ? 3.0 : 2.0);
        let dashArrayPattern: string | undefined = undefined;

        if (poly.level === 'province') {
          strokeWeight = isHighlighted ? 4.5 : 3.2;
          strokeColor = isHighlighted ? '#fde047' : '#1e1b4b';
        } else if (poly.level === 'district') {
          strokeWeight = isHighlighted ? 4.0 : (thematicMetric === 'reference_map' ? 3.0 : 2.2);
          strokeColor = isHighlighted ? '#ffffff' : (styleInfo.strokeColor || styleInfo.color);
        } else if (poly.level === 'subdistrict') {
          strokeWeight = isHighlighted ? 3.0 : 1.6;
          dashArrayPattern = '6, 4';
        } else if (poly.level === 'village') {
          strokeWeight = isHighlighted ? 2.5 : 1.2;
          dashArrayPattern = '3, 3';
        }

        const leafletPoly = L.polygon(poly.coordinates, {
          color: strokeColor,
          fillColor: styleInfo.color,
          fillOpacity: isHighlighted ? Math.min(0.85, polygonOpacity + 0.25) : polygonOpacity,
          weight: strokeWeight,
          dashArray: dashArrayPattern,
          lineCap: 'round',
          lineJoin: 'round',
          smoothFactor: 0,
          pane: 'gisPolygonsPane',
          className: `gis-district-polygon ${isHighlighted ? 'gis-polygon-highlighted' : ''}`,
        });

        // Hover Tooltip
        const stats = poly.stats;
        const levelLabel =
          poly.level === 'province'
            ? '🏛️ ขอบเขตระดับจังหวัด'
            : poly.level === 'district'
            ? '📍 ขอบเขตระดับอำเภอ'
            : poly.level === 'subdistrict'
            ? '🏘️ ขอบเขตระดับตำบล'
            : '🏡 ขอบเขตระดับหมู่บ้าน/ชุมชน';

        const rawVal = metricConfig.getValue(poly.stats);
        let valFormatted = '';
        if (typeof rawVal === 'number') {
          if (thematicMetric === 'rabies_cases' || thematicMetric === 'bite_cases') {
            valFormatted = `${rawVal.toLocaleString()} เคส`;
          } else if (thematicMetric === 'vaccine_animal' || thematicMetric === 'vaccine_human' || thematicMetric === 'stray_ratio') {
            valFormatted = `${rawVal.toFixed(1)}%`;
          } else if (thematicMetric === 'density_animal') {
            valFormatted = `${rawVal.toFixed(1)} ตัว/กม.²`;
          } else if (thematicMetric === 'rri') {
            valFormatted = `${rawVal.toFixed(0)} / 100`;
          } else {
            valFormatted = `${rawVal.toFixed(1)}`;
          }
        } else {
          valFormatted = styleInfo.label;
        }

        const tooltipContent = `
          <div style="font-family: 'Sarabun', sans-serif; font-size: 11px; padding: 2px;">
            <div style="font-weight: 700; font-size: 12px; color: ${styleInfo.color};">${poly.nameTh} (${levelLabel})</div>
            <div style="color: #334155; margin-top: 3px;">
              <strong>${metricConfig.titleTh}:</strong> <span style="color: ${styleInfo.color}; font-weight: bold;">${valFormatted}</span>
            </div>
            <div style="color: #475569; font-size: 10px; margin-top: 1px;">
              เกณฑ์จำแนก: <span style="font-weight: 600;">${styleInfo.label}</span>
            </div>
            <div style="color: #64748b; font-size: 10px; margin-top: 2px; border-top: 1px solid #e2e8f0; padding-top: 2px;">
              วัคซีนสัตว์: ${stats?.animalVaccineRate.toFixed(1)}% | ติดเชื้อ: ${stats?.positiveCases || 0} ตัว | สุนัข-แมว: ${(stats?.totalDogs || 0).toLocaleString()} ตัว
            </div>
          </div>
        `;

        leafletPoly.bindTooltip(tooltipContent, {
          sticky: true,
          direction: 'auto',
          opacity: 0.95,
        });

        // Interactive Click on Boundary Area (Drill down into area)
        leafletPoly.on('click', () => {
          setSelectedPolygonDetail(poly);
          if (poly.level === 'district') {
            setSelectedDistrict(poly.nameTh);
            if (onDistrictSelect) onDistrictSelect(poly.nameTh);
          } else if (poly.level === 'subdistrict') {
            const cleanSub = poly.nameTh.replace('ต.', '').trim();
            setSelectedSubDistrict(cleanSub);
          } else if (poly.level === 'village') {
            setSelectedVillage(poly.nameTh);
          }
        });

        // Mouse hover interaction highlight
        leafletPoly.on('mouseover', function () {
          this.setStyle({
            weight: strokeWeight + 1.8,
            fillOpacity: Math.min(0.9, polygonOpacity + 0.25),
          });
        });

        leafletPoly.on('mouseout', function () {
          this.setStyle({
            weight: isHighlighted ? 3.5 : strokeWeight,
            fillOpacity: isHighlighted ? Math.min(0.85, polygonOpacity + 0.25) : polygonOpacity,
          });
        });

        polyGroup.addLayer(leafletPoly);

        // B. Add Choropleth Value Badge on Polygon Centroid
        if (showChoroplethLabels && poly.center) {
          const cleanName = poly.nameTh.replace('อ.', '').replace('ต.', '');
          let badgeText = '';
          if (typeof rawVal === 'number') {
            if (thematicMetric === 'rabies_cases' || thematicMetric === 'bite_cases') {
              badgeText = `${rawVal} เคส`;
            } else if (thematicMetric === 'vaccine_animal' || thematicMetric === 'vaccine_human' || thematicMetric === 'stray_ratio') {
              badgeText = `${rawVal.toFixed(1)}%`;
            } else if (thematicMetric === 'density_animal') {
              badgeText = `${rawVal.toFixed(0)}/กม.²`;
            } else if (thematicMetric === 'rri') {
              badgeText = `RRI ${rawVal.toFixed(0)}`;
            } else {
              badgeText = `${rawVal.toFixed(1)}`;
            }
          } else {
            badgeText = styleInfo.label.slice(0, 8);
          }

          const labelHtml = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              transform: translate(-50%, -50%);
            ">
              <div style="
                background: rgba(15, 23, 42, 0.90);
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 6px;
                border-radius: 4px;
                border: 1px solid rgba(255,255,255,0.25);
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
                line-height: 1.2;
              ">
                ${cleanName}
              </div>
              <div style="
                background: ${styleInfo.color};
                color: #ffffff;
                font-size: 9px;
                font-weight: 800;
                padding: 0 5px;
                border-radius: 9999px;
                border: 1px solid #ffffff;
                margin-top: 1px;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.5);
              ">
                ${badgeText}
              </div>
            </div>
          `;

          const labelIcon = L.divIcon({
            html: labelHtml,
            className: 'choropleth-poly-label',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const labelMarker = L.marker(poly.center, { 
            icon: labelIcon, 
            interactive: false,
            pane: 'gisLabelsPane',
          });
          polyLabelGroup.addLayer(labelMarker);
        }
      });
    }

    // B. Render Positive Cases & 3km/5km Buffers
    if (showPositives || showBuffer3km || showBuffer5km) {
      filteredPositiveCases.forEach((c, idx) => {
        let lat = c.Latitude;
        let lng = c.Longitude;

        // Fallback coordinates with subtle jitter for identical locations
        if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat < 7.5 || lat > 9.8) {
          const subGeo = c.SubDistrict ? SUBDISTRICT_GEODATA[c.SubDistrict] : null;
          if (subGeo) {
            const jitterLat = ((idx * 17) % 100 - 50) * 0.0003;
            const jitterLng = ((idx * 31) % 100 - 50) * 0.0003;
            lat = subGeo.lat + jitterLat;
            lng = subGeo.lng + jitterLng;
          } else {
            const distInfo = NAKHON_DISTRICTS.find(
              (d) => c.District && (d.nameTh.includes(c.District) || c.District.includes(d.nameTh))
            );
            if (distInfo) {
              const jitterLat = ((idx * 17) % 100 - 50) * 0.0008;
              const jitterLng = ((idx * 31) % 100 - 50) * 0.0008;
              lat = distInfo.lat + jitterLat;
              lng = distInfo.lng + jitterLng;
            } else {
              lat = 8.4304;
              lng = 99.9631;
            }
          }
        }

        // 5km Ring Vaccination Buffer (Amber)
        if (showBuffer5km) {
          const c5k = L.circle([lat, lng], {
            radius: 5000,
            color: '#f59e0b',
            fillColor: '#fef3c7',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 4',
            pane: 'gisBuffersPane',
          }).bindTooltip(`รัศมีรณรงค์วัคซีน 5 กม. (${c.SubDistrict || c.District})`, {
            permanent: false,
            direction: 'top',
          });
          b5Group.addLayer(c5k);
        }

        // 3km Emergency Containment Buffer (Red)
        if (showBuffer3km) {
          const c3k = L.circle([lat, lng], {
            radius: 3000,
            color: '#ef4444',
            fillColor: '#fee2e2',
            fillOpacity: 0.22,
            weight: 2,
            pane: 'gisBuffersPane',
            className: 'gis-outbreak-buffer-3k',
          }).bindTooltip(`วงรอบควบคุมโรคฉุกเฉิน 3 กม. (${c.SubDistrict || c.District})`, {
            permanent: false,
            direction: 'top',
          });
          b3Group.addLayer(c3k);
        }

        // Outbreak Point Marker (Concentric Bullseye Target Rings matching reference image)
        if (showPositives) {
          const pulseHtml = `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <span class="animate-ping" style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(220, 38, 38, 0.45); top: 0; left: 0;"></span>
              <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: #dc2626; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; top: 3px; left: 3px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: pulseHtml,
            className: 'custom-target-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([lat, lng], { 
            icon: customIcon,
            pane: 'gisPositivesPane',
          });

          const popupContent = `
            <div style="font-family: 'Sarabun', sans-serif; min-width: 220px; font-size: 12px; line-height: 1.5;">
              <div style="background: #e11d48; color: white; padding: 6px 10px; border-radius: 6px 6px 0 0; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
                <span>🔴 ตรวจพบสัตว์ติดเชื้อ Rabies</span>
                <span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 4px;">ผลบวก Positive</span>
              </div>
              <div style="padding: 10px; background: #ffffff; border: 1px solid #fecdd3; border-top: none; border-radius: 0 0 6px 6px;">
                <div style="margin-bottom: 4px;"><strong>รหัสตัวอย่าง:</strong> ${c.Sample_ID || 'RAB-NK-POS'}</div>
                <div style="margin-bottom: 4px;"><strong>ชนิดสัตว์:</strong> ${c.Species || 'สุนัข'}</div>
                <div style="margin-bottom: 4px;"><strong>พื้นที่:</strong> ต.${c.SubDistrict || '-'} อ.${c.District || '-'}</div>
                <div style="margin-bottom: 4px;"><strong>วันที่เก็บ/ตรวจ:</strong> ${c.Submission_Date || '2025'}</div>
                <div style="margin-bottom: 4px;"><strong>พิกัด GPS:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #fda4af; color: #be123c; font-size: 11px;">
                  ⚠️ บังคับใช้วงรอบควบคุมโรค 3 กม. และฉีดวัคซีนวงแหวน 5 กม.
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          posGroup.addLayer(marker);
        }
      });
    }

    // C. Render District Name Pins
    if (showDistricts) {
      zoneSummaries.forEach((summary) => {
        const district =
          NAKHON_DISTRICTS.find((d) => d.id === summary.districtId) || NAKHON_DISTRICTS[0];
        const { zone, animalPositivesSelectedYear, vaccineCoverageRate } = summary;
        const positiveSamples = animalPositivesSelectedYear;

        let pinBg = '#10b981'; // green
        if (zone === 'C') pinBg = '#e11d48';
        else if (zone === 'B') pinBg = '#ea580c';
        else if (zone === 'A') pinBg = '#d97706';

        const isSelected = selectedDistrict === district.nameTh;

        const pinHtml = `
          <div style="
            background: ${pinBg};
            color: white;
            padding: ${isSelected ? '3px 8px' : '2px 6px'};
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            font-family: 'Prompt', 'Sarabun', sans-serif;
            border: 1.5px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ">
            ${district.nameTh}
          </div>
        `;

        const distIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-district-pin',
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        const marker = L.marker([district.lat, district.lng], { icon: distIcon });
        marker.on('click', () => {
          setSelectedDistrict(district.nameTh);
          if (onDistrictSelect) onDistrictSelect(district.nameTh);
        });

        distGroup.addLayer(marker);
      });
    }

    // D. Render Hospitals & PEP Centers
    if (showHospitals) {
      HOSPITALS_DATA.forEach((hosp) => {
        const hospHtml = `
          <div style="
            background: #2563eb;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 900;
            border: 1.5px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          ">
            ✚
          </div>
        `;

        const hospIcon = L.divIcon({
          html: hospHtml,
          className: 'custom-hosp-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon });
        marker.bindPopup(`
          <div style="font-family: 'Sarabun', sans-serif; min-width: 220px; font-size: 12px;">
            <div style="background: #1e40af; color: white; padding: 6px 10px; border-radius: 6px 6px 0 0; font-weight: bold;">
              🏥 ${hosp.name}
            </div>
            <div style="padding: 10px; background: white; border: 1px solid #bfdbfe; border-top: none; border-radius: 0 0 6px 6px;">
              <div><strong>ระดับบริการ:</strong> ${hosp.type}</div>
              <div><strong>จำนวนเตียง:</strong> ${hosp.beds} เตียง</div>
              <div><strong>พื้นที่:</strong> อ.${hosp.district}</div>
              <div style="margin-top: 6px; color: #1e40af; font-weight: bold;">💉 มีวัคซีนป้องกันโรคพิษสุนัขบ้า (PEP) และ RIG ตลอด 24 ชม.</div>
            </div>
          </div>
        `);
        hospGroup.addLayer(marker);
      });
    }

    // E. Render Rivers & Natural Waterways
    if (showWaterways) {
      WATERWAYS_DATA.forEach((river) => {
        const riverHtml = `
          <div style="
            background: #0284c7;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            font-family: 'Sarabun', sans-serif;
            border: 1px solid #bae6fd;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            white-space: nowrap;
          ">
            💧 ${river.name}
          </div>
        `;

        const riverIcon = L.divIcon({
          html: riverHtml,
          className: 'custom-river-marker',
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        });

        const marker = L.marker([river.lat, river.lng], { icon: riverIcon });
        marker.bindPopup(`
          <div style="font-family: 'Sarabun', sans-serif; font-size: 12px; padding: 6px;">
            <strong>💧 ${river.name}</strong>
            <p style="margin: 4px 0 0 0; color: #64748b;">${river.type} - ปัจจัยสิ่งแวดล้อมและเส้นทางธรรมชาติตามแนว One Health</p>
          </div>
        `);
        waterGroup.addLayer(marker);
      });
    }

    // F. Render Stray Animal Habitats & Food Sources (Markets, Dumps, Temples, Government Centers, Fishing Ports)
    if (showStrayHabitats) {
      const allHabitats = getStrayHabitats();
      const activeHabitats = allHabitats.filter((h) => {
        if (strayCategoryFilter !== 'all' && h.category !== strayCategoryFilter) return false;
        if (strayRiskFilter !== 'all' && h.riskLevel !== strayRiskFilter) return false;
        if (selectedDistrict !== 'all') {
          if (!h.district.includes(selectedDistrict) && !selectedDistrict.includes(h.district)) {
            return false;
          }
        }
        if (selectedSubDistrict !== 'all') {
          if (!matchSubDistrict(h.subDistrict, selectedSubDistrict)) {
            return false;
          }
        }
        return true;
      });

      activeHabitats.forEach((h) => {
        const catCfg = HABITAT_CATEGORY_CONFIGS[h.category] || HABITAT_CATEGORY_CONFIGS.market;
        const riskCfg = STRAY_RISK_CONFIGS[h.riskLevel] || STRAY_RISK_CONFIGS.MEDIUM;
        const isCritical = h.riskLevel === 'CRITICAL';
        const isHigh = h.riskLevel === 'HIGH';

        const habitatHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            cursor: pointer;
          ">
            ${
              isCritical
                ? `<span class="animate-ping" style="
                    position: absolute;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: ${riskCfg.haloColor};
                    opacity: 0.75;
                  "></span>`
                : isHigh
                ? `<span style="
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px dashed ${riskCfg.color};
                    opacity: 0.8;
                  "></span>`
                : ''
            }
            <div style="
              position: relative;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${catCfg.borderColor};
              box-shadow: 0 3px 8px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              transition: transform 0.2s;
            ">
              ${catCfg.icon}
            </div>
            <div style="
              position: absolute;
              bottom: -1px;
              right: -1px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${riskCfg.color};
              border: 1.5px solid #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            "></div>
          </div>
        `;

        const habitatIcon = L.divIcon({
          html: habitatHtml,
          className: 'custom-stray-habitat-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([h.lat, h.lng], { icon: habitatIcon });

        const popupHtml = `
          <div style="font-family: 'Sarabun', sans-serif; min-width: 250px; font-size: 12px; line-height: 1.45;">
            <div style="background: ${catCfg.color}; color: white; padding: 7px 10px; border-radius: 6px 6px 0 0; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 13px;">${catCfg.icon} ${h.nameTh}</span>
              <span style="font-size: 10px; background: rgba(0,0,0,0.25); padding: 1px 6px; border-radius: 4px;">${catCfg.labelTh}</span>
            </div>
            <div style="padding: 10px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 6px 6px;">
              <div style="color: #64748b; font-size: 11px; margin-bottom: 5px;">${h.nameEn}</div>
              <div style="margin-bottom: 4px;"><strong>📍 ที่ตั้ง:</strong> ต.${h.subDistrict} อ.${h.district} ${h.village ? `(${h.village})` : ''}</div>
              
              <div style="display: flex; gap: 8px; margin-bottom: 5px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
                <span style="color: #ea580c; font-weight: bold;">🐕 สุนัข ~${h.estimatedDogs} ตัว</span>
                <span style="color: #9333ea; font-weight: bold;">🐈 แมว ~${h.estimatedCats} ตัว</span>
              </div>

              <div style="margin-bottom: 4px; color: #334155;"><strong>🍲 แหล่งอาหาร:</strong> ${h.foodSourceType}</div>
              
              <div style="margin-bottom: 4px;">
                <strong>สถานะจัดการขยะ:</strong> 
                <span style="font-weight: 600; color: ${h.wasteManagementStatus === 'OPEN_DUMP' ? '#dc2626' : '#059669'};">
                  ${h.wasteManagementStatus === 'OPEN_DUMP' ? '⚠️ กองขยะเปิดโล่ง (เสี่ยงสะสมเชื้อ)' : '📦 มีการจัดเก็บสม่ำเสมอ'}
                </span>
              </div>

              <div style="margin-bottom: 4px; color: #475569;">
                <strong>ระดับความเสี่ยง:</strong> 
                <span style="color: ${riskCfg.color}; font-weight: bold;">${riskCfg.labelTh} (${h.riskLevel})</span>
              </div>

              <div style="margin-bottom: 4px; color: #475569;">
                <strong>ความครอบคลุมวัคซีน:</strong> <span style="color: #16a34a; font-weight: bold;">${h.vaccinationCoverage}%</span> (ทำหมัน ${h.neuteredRate}%)
              </div>

              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
                <span>🏛️ ${h.responsibleAgency}</span>
                <span style="font-size: 10px; color: #94a3b8;">${h.source || 'สำรวจพื้นที่ 2568'}</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          setSelectedHabitatDetail(h);
        });

        strayGroup.addLayer(marker);
      });
    }
  }, [
    boundaryPolygons,
    showPolygons,
    showChoroplethLabels,
    thematicMetric,
    polygonOpacity,
    filteredPositiveCases,
    zoneSummaries,
    showPositives,
    showBuffer3km,
    showBuffer5km,
    showDistricts,
    showHospitals,
    showWaterways,
    showStrayHabitats,
    strayCategoryFilter,
    strayRiskFilter,
    habitatsVersion,
    selectedDistrict,
    selectedSubDistrict,
    selectedVillage,
  ]);

  // Handle ResizeObserver and Fullscreen transitions for responsive map canvas updates
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Guarantee seamless tile rendering when toggling fullscreen
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const triggerResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    triggerResize();
    const t1 = setTimeout(triggerResize, 50);
    const t2 = setTimeout(triggerResize, 150);
    const t3 = setTimeout(triggerResize, 300);
    const t4 = setTimeout(triggerResize, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isFullscreen]);

  const activeMetricConfig = THEMATIC_METRIC_CONFIGS[thematicMetric];

  // Count active layers for badge
  const activeLayersCount = [
    showPositives,
    showBuffer3km,
    showBuffer5km,
    showStrayHabitats,
    showHospitals,
    showWaterways,
    showDistricts,
    showPolygons,
  ].filter(Boolean).length;

  return (
    <div
      id="leaflet-gis-map-root"
      className={`relative flex flex-col bg-slate-950 overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none m-0 p-0 border-none shadow-none'
          : 'w-full h-[680px] sm:h-[760px] rounded-2xl border border-slate-700 shadow-xl'
      } ${className}`}
    >
      {/* Left Side Panel (Thematic & Options) */}
      <div className={`absolute top-4 left-0 bottom-6 z-[1001] flex transition-transform duration-300 pointer-events-none ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-[256px]'}`}>
        <div className="bg-slate-900/95 backdrop-blur-md p-3 border-y border-r border-slate-700/80 shadow-2xl rounded-r-2xl pointer-events-auto flex flex-col gap-3 w-64 h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold px-1 pb-2 border-b border-slate-700/80">
            <Sparkles className="w-4 h-4" />
            <span>ชุดสีแผนที่ (Thematic)</span>
          </div>
          
          <button
            type="button"
            onClick={() => setThematicMetric('reference_map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'reference_map'
                ? 'bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-600 text-white font-bold ring-2 ring-white/50 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⭐ One Health
          </button>
          
          <button
            type="button"
            onClick={() => setThematicMetric('vaccine_animal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'vaccine_animal'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            💉 วัคซีนสัตว์ (&gt;=80%)
          </button>

          <button
            type="button"
            onClick={() => setThematicMetric('rri')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'rri'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚠️ ดัชนีความเสี่ยง RRI
          </button>

          <button
            type="button"
            onClick={() => setThematicMetric('rabies_cases')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'rabies_cases'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔴 จำนวนสัตว์ติดเชื้อที่พบ
          </button>

          <div className="pt-2 border-t border-slate-700/80 mt-1">
            <label className="text-[11px] text-slate-400 mb-1.5 block">ตัวเลือกชุดข้อมูลอื่น ๆ:</label>
            <select
              value={thematicMetric}
              onChange={(e) => setThematicMetric(e.target.value as ThematicMetric)}
              className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 border border-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
            >
              <option value="reference_map">⭐ One Health</option>
              <option value="vaccine_animal">💉 วัคซีนสัตว์</option>
              <option value="rri">⚠️ ความเสี่ยง RRI</option>
              <option value="rabies_cases">🔴 สัตว์ติดเชื้อที่พบ</option>
              <option value="zone">🛡️ โซนปศุสัตว์ C/B/A</option>
              <option value="vaccine_human">🧑‍⚕️ วัคซีนคน PEP</option>
              <option value="density_animal">🐕 ความหนาแน่นสัตว์</option>
              <option value="boundary_level">🏛️ ลำดับขอบเขต</option>
              <option value="boundary_area">🎨 แยก 23 อำเภออิสระ</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold px-1 pb-2 pt-4 border-b border-slate-700/80">
            <MapPin className="w-4 h-4" />
            <span>ระดับขอบเขตพื้นที่</span>
          </div>
          
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setPolygonLevel('auto')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'auto' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚡ อัตโนมัติ (ตามการซูม)
            </button>
            <button
              type="button"
              onClick={() => setPolygonLevel('district')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'district' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏛️ ระดับอำเภอ (23 อำเภอ)
            </button>
            <button
              type="button"
              onClick={() => setPolygonLevel('subdistrict')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'subdistrict' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏠 ระดับตำบล (165 ตำบล)
            </button>
          </div>
          
          {showStatsSummary && showPolygons && (
             <div className="mt-auto pt-4 border-t border-slate-700/80 text-[10px] text-slate-300">
               <div className="font-semibold text-emerald-400 mb-1 flex justify-between items-center">
                 <span>สรุปข้อมูล:</span>
                 <button onClick={() => setShowStatsSummary(false)}><X className="w-3 h-3 hover:text-white"/></button>
               </div>
               <div>{activeMetricConfig.titleTh}</div>
               {choroplethStats.isNumeric && (
                 <div className="mt-1">เฉลี่ย <strong className="text-white font-bold">{choroplethStats.avg.toFixed(1)}</strong> {activeMetricConfig.unit}</div>
               )}
               <div className="mt-1">จำนวน {choroplethStats.count} เขตพื้นที่</div>
             </div>
          )}

        </div>
        <div className="flex items-center pointer-events-none">
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="pointer-events-auto bg-slate-900/95 p-1 rounded-r-xl border-y border-r border-slate-700/80 text-white shadow-lg ml-[-1px] hover:bg-slate-800 transition-colors"
          >
            {isLeftPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Right Side Panel (Layers, Settings, Controls, Legend) */}
      <div className={`absolute top-4 right-0 bottom-6 z-[1001] flex transition-transform duration-300 pointer-events-none ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-[320px] sm:translate-x-[336px]'}`}>
        <div className="flex items-center pointer-events-none">
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="pointer-events-auto bg-slate-900/95 p-1 rounded-l-xl border-y border-l border-slate-700/80 text-white shadow-lg mr-[-1px] hover:bg-slate-800 transition-colors"
          >
            {isRightPanelOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <div className="bg-slate-900/95 backdrop-blur-md p-4 border-y border-l border-slate-700/80 shadow-2xl rounded-l-2xl pointer-events-auto flex flex-col gap-4 w-80 sm:w-84 h-full overflow-y-auto no-scrollbar">
          
          {/* Quick Actions Horizontal */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-700/80">
            <div className="text-emerald-400 font-semibold text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>การตั้งค่าแผนที่</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowGisConnectorModal(true)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="ศูนย์เชื่อมโยงข้อมูล GIS (GeoJSON)"
              >
                <Database className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = getLocationCoordinates(selectedDistrict, selectedSubDistrict);
                  mapInstanceRef.current?.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                title="เลื่อนแผนที่มาที่กึ่งกลาง"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedSubDistrict('all');
                  setSelectedVillage('all');
                  mapInstanceRef.current?.flyTo([8.4304, 99.9631], 10, { duration: 1 });
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="รีเซ็ตมุมมองทั้งจังหวัดนครศรีธรรมราช"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Tabs Content - Modified to fit nicely */}
          <div className="flex bg-slate-800 rounded-lg p-1 text-[11px] font-semibold text-slate-400 shrink-0">
            <button
              onClick={() => setActiveDrawerTab('layers')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'layers' ? 'bg-slate-950 text-emerald-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              เปิด/ปิด ชั้นข้อมูล
            </button>
            <button
              onClick={() => setActiveDrawerTab('thematic')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'thematic' ? 'bg-slate-950 text-amber-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              ตั้งค่าเรขาคณิต
            </button>
            <button
              onClick={() => setActiveDrawerTab('basemap')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'basemap' ? 'bg-slate-950 text-indigo-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              แผนที่ฐาน
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar text-xs">
            {activeDrawerTab === 'layers' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 mb-1">ชั้นข้อมูลระบาดวิทยา (Epidemiology Layers)</div>
                  
                  <label className="flex items-center justify-between p-2 rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      </div>
                      <span className="text-slate-200 group-hover:text-white font-medium">จุดพบสัตว์ติดเชื้อ (Positive Cases)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showPositives ? 'bg-rose-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showPositives ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showPositives} onChange={(e) => setShowPositives(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-rose-900/30 bg-rose-950/10 hover:bg-rose-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-rose-500/60 flex items-center justify-center">
                        <span className="text-[9px] text-rose-400 font-bold">3k</span>
                      </div>
                      <span className="text-slate-300 group-hover:text-white">รัศมีเฝ้าระวัง 3 กม. (Outbreak Area)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showBuffer3km ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showBuffer3km ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showBuffer3km} onChange={(e) => setShowBuffer3km(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-amber-900/30 bg-amber-950/10 hover:bg-amber-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                        <span className="text-[9px] text-amber-400 font-bold">5k</span>
                      </div>
                      <span className="text-slate-300 group-hover:text-white">รัศมีเฝ้าระวัง 5 กม. (Surveillance Area)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showBuffer5km ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showBuffer5km ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showBuffer5km} onChange={(e) => setShowBuffer5km(e.target.checked)} />
                  </label>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>จุดเสี่ยง & ทรัพยากร (Risk & Resources)</span>
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-amber-900/20 bg-amber-950/20 hover:bg-amber-900/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Home className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-200 group-hover:text-white font-medium">แหล่งพักพิงสุนัขจรจัด (Stray Habitats)</span>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showStrayHabitats ? 'bg-amber-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showStrayHabitats ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showStrayHabitats} onChange={(e) => setShowStrayHabitats(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-indigo-900/20 bg-indigo-950/10 hover:bg-indigo-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">สถานพยาบาล / รพ.สต. (Hospitals)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showHospitals ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showHospitals ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showHospitals} onChange={(e) => setShowHospitals(e.target.checked)} />
                  </label>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">ภูมิประเทศ & ขอบเขต (Geography)</div>
                  
                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-slate-500 bg-slate-800 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">แสดงเส้นขอบเขตระดับอำเภอทับซ้อน</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showDistricts ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showDistricts ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                        <Droplet className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">แหล่งน้ำ / แม่น้ำ (Waterways)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showWaterways ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showWaterways ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showWaterways} onChange={(e) => setShowWaterways(e.target.checked)} />
                  </label>
                </div>
              </div>
            )}

            {activeDrawerTab === 'thematic' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400">ความทึบแสงของพื้นที่ (Opacity: {Math.round(polygonOpacity * 100)}%)</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={polygonOpacity}
                    onChange={(e) => setPolygonOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>โปร่งใส (0%)</span>
                    <span>ทึบ (100%)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 group-hover:text-white">แสดงการลงสีพื้นที่ (Choropleth Polygons)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showPolygons ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showPolygons ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showPolygons} onChange={(e) => setShowPolygons(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 group-hover:text-white">แสดงชื่อพื้นที่ (Polygon Labels)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showChoroplethLabels ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showChoroplethLabels ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showChoroplethLabels} onChange={(e) => setShowChoroplethLabels(e.target.checked)} />
                  </label>
                </div>
              </div>
            )}

            {activeDrawerTab === 'basemap' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400 mb-1">เลือกสไตล์แผนที่ฐาน (Tile Layer):</div>
                <div className="space-y-1.5">
                  {(Object.keys(TILE_CONFIGS) as MapTileStyle[]).map((key) => {
                    const cfg = TILE_CONFIGS[key];
                    const isSelected = mapStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMapStyle(key)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-xs'
                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-inner overflow-hidden relative ${
                            key === 'dark' ? 'bg-slate-900' :
                            key === 'satellite' ? 'bg-emerald-900' :
                            key === 'light' ? 'bg-slate-100' :
                            key === 'hot' ? 'bg-orange-100' :
                            key === 'topo' ? 'bg-amber-100' : 'bg-blue-50'
                          }`}>
                            {key === 'satellite' ? <Globe2 className="w-4 h-4 text-emerald-400" /> : <MapPin className={`w-4 h-4 ${key === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {cfg.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Legend Area Moved Here */}
          {showPolygons && (
            <div className="mt-4 pt-3 border-t border-slate-700/80">
              <div className="flex justify-between items-center mb-2">
                 <div className="text-xs font-bold text-white flex items-center gap-1.5">
                   <Sliders className="w-3.5 h-3.5 text-slate-400" />
                   คำอธิบายสัญลักษณ์ (Legend)
                 </div>
              </div>
              <div className="text-[10px] text-slate-300 font-medium bg-slate-950/60 p-1.5 rounded-md mb-2 border border-slate-700/50">
                 {activeMetricConfig.titleTh}
              </div>
              <div className="space-y-1.5 text-xs pb-4">
                {activeMetricConfig.legends.map((lg, idx) => {
                  const count = choroplethStats.classCounts[idx] || 0;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-md shrink-0 border border-white/30 shadow-xs"
                          style={{ backgroundColor: lg.color }}
                        />
                        <span className="text-slate-300">{lg.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Interactive Leaflet Map Canvas */}
      <div
        id="leaflet-gis-map-canvas"
        ref={mapContainerRef}
        className="w-full flex-1 min-h-0 h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Coordinates Status */}
      {cursorCoords && (
        <div
          id="gis-map-bottom-coords"
          className="absolute bottom-1 left-3 z-[1000] text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700/60 pointer-events-none hidden sm:block"
        >
          พิกัด: {cursorCoords.lat.toFixed(4)}°N, {cursorCoords.lng.toFixed(4)}°E | นครศรีธรรมราช
        </div>
      )}
    </div>
  );
};


