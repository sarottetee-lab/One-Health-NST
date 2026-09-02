// GIS Administrative GeoJSON Connector & Integration Engine for Nakhon Si Thammarat
// Supports Province (ระดับจังหวัด), District (ระดับอำเภอ), Sub-district (ระดับตำบล), and Village (ระดับหมู่บ้าน)
import { BoundaryPolygon } from '../data/nakhonGeoPolygons';
import { NAKHON_DISTRICTS, SUBDISTRICT_GEODATA } from '../data/nakhonDistricts';
import { ZoneCategory } from '../types';

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string | number;
  properties: {
    nameTh: string;
    nameEn: string;
    level: 'province' | 'district' | 'subdistrict' | 'village';
    dopaCode?: string;
    parentDistrict?: string;
    parentSubDistrict?: string;
    areaKm2?: number;
    population?: number;
    dldZone?: ZoneCategory;
    riskStatus?: string;
    animalVaccineRate?: number;
    rriScore?: number;
    positiveCases?: number;
    strayDogs?: number;
    totalDogs?: number;
    dataSource?: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point';
    coordinates: any;
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  name?: string;
  crs?: {
    type: 'name';
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}

export interface GisDataSourceInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  organization: string;
  layerType: 'boundary' | 'epidemiology' | 'facilities' | 'landuse';
  level: 'all' | 'province' | 'district' | 'subdistrict' | 'village';
  format: 'GeoJSON' | 'WMS' | 'REST' | 'Shapefile';
  status: 'connected' | 'online' | 'ready';
  itemCount: number;
  description: string;
  lastUpdated: string;
}

/**
 * Standard Available GIS Data Sources for Linkage
 */
export const AVAILABLE_GIS_SOURCES: GisDataSourceInfo[] = [
  {
    id: 'dopa-admin-boundaries',
    nameTh: 'เส้นขอบเขตการปกครอง กรมการปกครอง (DOPA GIS)',
    nameEn: 'Department of Provincial Administration Boundaries',
    organization: 'กรมการปกครอง กระทรวงมหาดไทย (DOPA / GISTDA)',
    layerType: 'boundary',
    level: 'all',
    format: 'GeoJSON',
    status: 'connected',
    itemCount: 189, // 1 Province + 23 Districts + 165 Subdistricts
    description: 'เส้นขอบเขตแนวการปกครองตามกฎหมายระดับจังหวัด 23 อำเภอ และ 165 ตำบลในจังหวัดนครศรีธรรมราช',
    lastUpdated: '2025-01-15',
  },
  {
    id: 'dld-rabies-gis',
    nameTh: 'ระบบสารสนเทศภูมิศาสตร์โรคพิษสุนัขบ้า กรมปศุสัตว์ (DLD GIS)',
    nameEn: 'Department of Livestock Development Rabies GIS',
    organization: 'กรมปศุสัตว์ กระทรวงเกษตรและสหกรณ์',
    layerType: 'epidemiology',
    level: 'district',
    format: 'GeoJSON',
    status: 'connected',
    itemCount: 23,
    description: 'ข้อมูลสถิติการเฝ้าระวังโรค, การรับรองพื้นที่ปลอดโรค 4 ระดับ (Zone C/B/A/A-Free) และจุดพบสัตว์ติดเชื้อสะสม',
    lastUpdated: '2025-02-28',
  },
  {
    id: 'moph-health-gis',
    nameTh: 'ระบบสารสนเทศเขตสุขภาพและ รพ.สต. นครศรีธรรมราช (MOPH GIS)',
    nameEn: 'Ministry of Public Health Subdistrict Health Network GIS',
    organization: 'สำนักงานสาธารณสุขจังหวัดนครศรีธรรมราช (สสจ.)',
    layerType: 'facilities',
    level: 'subdistrict',
    format: 'GeoJSON',
    status: 'connected',
    itemCount: 165,
    description: 'เครือข่าย รพช. 23 แห่ง, รพ.สต. 165 แห่ง และจุดบริการวัคซีนป้องกันโรคพิษสุนัขบ้าในคน (PEP)',
    lastUpdated: '2025-02-20',
  },
  {
    id: 'osm-hdx-thailand',
    nameTh: 'OpenStreetMap & HDX Thailand Administrative Boundary GIS',
    nameEn: 'Humanitarian Data Exchange (HDX) / UN OCHA / OSM Thailand',
    organization: 'UN OCHA & OpenStreetMap GIS Community',
    layerType: 'boundary',
    level: 'all',
    format: 'GeoJSON',
    status: 'connected',
    itemCount: 1540,
    description: 'พิกัดแนวเขตระดับหมู่บ้าน (ADM4), แม่น้ำ, คลองสายหลัก และชุมชนท้องถิ่นนครศรีธรรมราช',
    lastUpdated: '2025-01-30',
  },
];

/**
 * Convert internal BoundaryPolygon items into RFC 7946 Standard GeoJSON FeatureCollection
 */
export function convertPolygonsToGeoJson(
  polygons: BoundaryPolygon[],
  collectionName: string = 'nakhon_epidemiology_boundaries'
): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = polygons.map((poly) => {
    // Determine whether poly.coordinates is a single ring [lat, lng][] or multiple rings [lat, lng][][]
    const rawCoords = poly.coordinates;
    let geometryType: 'Polygon' | 'MultiPolygon' = 'Polygon';
    let geoJsonCoords: any;

    if (Array.isArray(rawCoords) && rawCoords.length > 0) {
      if (Array.isArray(rawCoords[0]) && typeof rawCoords[0][0] === 'number') {
        // Single polygon ring [lat, lng][]
        const ring = (rawCoords as [number, number][]).map(([lat, lng]) => [
          Number(lng.toFixed(5)),
          Number(lat.toFixed(5)),
        ]);
        if (
          ring.length > 0 &&
          (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
        ) {
          ring.push([...ring[0]]);
        }
        geoJsonCoords = [ring];
        geometryType = 'Polygon';
      } else if (Array.isArray(rawCoords[0]) && Array.isArray(rawCoords[0][0])) {
        // Multi-ring / MultiPolygon [ [ [lat, lng], ... ] ]
        geoJsonCoords = (rawCoords as [number, number][][]).map((ring) => {
          const r = ring.map(([lat, lng]) => [
            Number(lng.toFixed(5)),
            Number(lat.toFixed(5)),
          ]);
          if (
            r.length > 0 &&
            (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])
          ) {
            r.push([...r[0]]);
          }
          return r;
        });
        geometryType = geoJsonCoords.length > 1 ? 'MultiPolygon' : 'Polygon';
        if (geometryType === 'Polygon') {
          // Keep standard single polygon format [ [ [lng, lat], ... ] ]
          geoJsonCoords = geoJsonCoords;
        } else {
          // MultiPolygon format [ [ [ [lng, lat], ... ] ] ]
          geoJsonCoords = geoJsonCoords.map((rg: any) => [rg]);
        }
      }
    }

    const distInfo = NAKHON_DISTRICTS.find(
      (d) => d.nameTh.includes(poly.nameTh) || poly.nameTh.includes(d.nameTh)
    );

    return {
      type: 'Feature',
      id: poly.id,
      properties: {
        nameTh: poly.nameTh,
        nameEn: poly.nameEn,
        level: poly.level,
        dopaCode: distInfo?.code || '',
        parentDistrict: poly.parentDistrict,
        parentSubDistrict: poly.parentSubDistrict,
        areaKm2: poly.areaKm2,
        population: distInfo?.humanPopulation,
        dldZone: poly.stats?.zone || 'B',
        riskStatus: poly.stats?.rriLevel || 'MODERATE',
        animalVaccineRate: poly.stats?.animalVaccineRate ?? 0,
        rriScore: poly.stats?.rriScore ?? 0,
        positiveCases: poly.stats?.positiveCases ?? 0,
        strayDogs: poly.stats?.strayRatio ? Math.round(((poly.stats.totalDogs || 1000) * poly.stats.strayRatio) / 100) : 0,
        totalDogs: poly.stats?.totalDogs ?? 0,
        dataSource: 'Nakhon One Health GIS Hub / DLD-DOPA Integrated 2025',
      },
      geometry: {
        type: geometryType,
        coordinates: geoJsonCoords || [],
      },
    };
  });

  return {
    type: 'FeatureCollection',
    name: collectionName,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };
}

/**
 * Parse an uploaded or pasted GeoJSON object into internal BoundaryPolygon array
 */
export function parseGeoJsonToBoundaryPolygons(geoJsonData: any): {
  success: boolean;
  polygons: BoundaryPolygon[];
  message: string;
  featureCount: number;
} {
  try {
    let root = geoJsonData;
    if (typeof geoJsonData === 'string') {
      root = JSON.parse(geoJsonData);
    }

    if (!root) {
      return { success: false, polygons: [], message: 'ไม่พบข้อมูล GeoJSON', featureCount: 0 };
    }

    const rawFeatures: any[] =
      root.type === 'FeatureCollection'
        ? root.features || []
        : root.type === 'Feature'
        ? [root]
        : [];

    if (rawFeatures.length === 0) {
      return { success: false, polygons: [], message: 'ไม่พบ Features หรือ Geometry ในไฟล์ที่ระบุ', featureCount: 0 };
    }

    const convertedPolygons: BoundaryPolygon[] = [];

    rawFeatures.forEach((feat, index) => {
      const geom = feat.geometry;
      if (!geom) return;

      const props = feat.properties || {};
      const nameTh = props.nameTh || props.name_th || props.NAME_TH || props.name || props.ADM2_TH || props.ADM3_TH || props.ADM4_TH || `พื้นที่นำเข้า ${index + 1}`;
      const nameEn = props.nameEn || props.name_en || props.NAME_EN || props.ADM2_EN || props.ADM3_EN || `Imported Area ${index + 1}`;
      
      let level: 'province' | 'district' | 'subdistrict' | 'village' = 'district';
      if (props.level === 'province' || props.ADM1_TH) level = 'province';
      else if (props.level === 'subdistrict' || props.ADM3_TH || nameTh.startsWith('ต.') || nameTh.includes('ตำบล')) level = 'subdistrict';
      else if (props.level === 'village' || props.ADM4_TH || nameTh.startsWith('หมู่') || nameTh.includes('บ้าน')) level = 'village';

      // Extract coordinates: GeoJSON gives [lng, lat], convert to Leaflet [lat, lng]
      let ringCoordinates: [number, number][] = [];

      if (geom.type === 'Polygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
        const outerRing = geom.coordinates[0];
        ringCoordinates = outerRing.map((pt: any) => [Number(pt[1]), Number(pt[0])]);
      } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
        // Take largest polygon ring
        const largestPoly = geom.coordinates.reduce((max: any[], cur: any[]) => (cur[0]?.length > max[0]?.length ? cur : max), geom.coordinates[0]);
        if (largestPoly && largestPoly[0]) {
          ringCoordinates = largestPoly[0].map((pt: any) => [Number(pt[1]), Number(pt[0])]);
        }
      }

      if (ringCoordinates.length >= 3) {
        // Calculate center centroid
        const avgLat = ringCoordinates.reduce((s, p) => s + p[0], 0) / ringCoordinates.length;
        const avgLng = ringCoordinates.reduce((s, p) => s + p[1], 0) / ringCoordinates.length;

        convertedPolygons.push({
          id: feat.id ? String(feat.id) : `imported-gis-${index + 1}`,
          nameTh,
          nameEn,
          level,
          parentDistrict: props.parentDistrict || props.ADM2_TH || props.district,
          parentSubDistrict: props.parentSubDistrict || props.ADM3_TH || props.subdistrict,
          center: [Number(avgLat.toFixed(5)), Number(avgLng.toFixed(5))],
          coordinates: ringCoordinates,
          areaKm2: props.areaKm2 || props.area_km2 || 50.0,
          stats: {
            zone: props.dldZone || props.zone || 'B',
            rriScore: props.rriScore || 45,
            rriLevel: props.rriScore >= 70 ? 'VERY_HIGH' : props.rriScore >= 50 ? 'HIGH' : props.rriScore >= 30 ? 'MODERATE' : 'LOW',
            animalVaccineRate: props.animalVaccineRate || 75.0,
            humanPepRate: props.humanPepRate || 85.0,
            dogCatDensity: props.dogCatDensity || 60,
            positiveCases: props.positiveCases || 0,
            strayRatio: props.strayRatio || 15,
            totalDogs: props.totalDogs || 2000,
          },
        });
      }
    });

    return {
      success: convertedPolygons.length > 0,
      polygons: convertedPolygons,
      message: `นำเข้าข้อมูล GIS สำเร็จ ${convertedPolygons.length} ขอบเขตพื้นที่`,
      featureCount: convertedPolygons.length,
    };
  } catch (error: any) {
    return {
      success: false,
      polygons: [],
      message: `เกิดข้อผิดพลาดในการแปลงไฟล์ GeoJSON: ${error?.message || error}`,
      featureCount: 0,
    };
  }
}

/**
 * Trigger browser download of GeoJSON file
 */
export function downloadGeoJsonFile(geoJson: GeoJsonFeatureCollection, filename: string = 'nakhon_gis_boundaries.geojson') {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
