export type ZoneCategory = 'C' | 'B_PLUS' | 'B' | 'A' | 'A_FREE' | 'NO_DATA';

export interface DistrictInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  code: string;
  subDistricts: string[];
  lat: number;
  lng: number;
  svgPath?: string;
  approxAreaKm2?: number;
  humanPopulation?: number;
}

export interface HumanDeathCase {
  id: string;
  yearBE: number;
  yearAD: number;
  district: string;
  subDistrict: string;
  age?: number;
  gender?: 'ชาย' | 'หญิง';
  deathDate?: string;
  animalType?: string;
  pepHistory?: string;
  notes: string;
}

export interface Dog2025Row {
  Year: number | string;
  District: string;
  Sub_District: string;
  agency: string;
  Total_Dogs: number;
  Owned_Dogs: number;
  Stray_Dogs: number;
  Total_Cats?: number;
  Owned_Cats?: number;
  Stray_Cats?: number;
  Vaccinated_Count: number;
  Neutered_Count: number;
  Survey_Date: string;
  _syncedAt?: string;
  [key: string]: any;
}

export interface RabiesRow {
  Registration_ID: string;
  Animal_Species: string;
  Breed: string;
  Owner_Type: string;
  Submission_Date: string; // ISO YYYY-MM-DD
  Test_Method: string;
  Result: 'Positive' | 'Negative' | 'Inconclusive' | 'Pending';
  Province: string;
  District: string;
  Sub_District: string;
  Lat: number;
  Lng: number;
  // Official Thai Rabies Net Extended Fields
  Sample_No?: string;           // เลขที่ตัวอย่าง (เช่น 69J02750)
  Receipt_No?: string;          // เลขทะเบียนรับ (เช่น 61817631)
  Animal_Name?: string;         // ชื่อสัตว์ (เช่น โคล่า, โชค, เผือก, น้ำตาล)
  Gender?: string;              // เพศ (ผู้, เมีย)
  Color?: string;               // สี (น้ำตาล, ขาว-น้ำตาล, ขาว)
  Age_Years?: number | string;  // อายุ (ปี)
  Age_Months?: number | string; // อายุ (เดือน)
  Housing_Type?: string;        // ลักษณะการเลี้ยง (เลี้ยงปล่อยนอกบริเวณบ้านตลอด, เลี้ยงปล่อยในบริเวณบ้านเท่านั้น ฯลฯ)
  Vaccine_History?: string;     // ประวัติการฉีดวัคซีน (ไม่เคยฉีด, เคยฉีด)
  Vaccine_Doses?: number | string; // จำนวนเข็มที่เคยฉีด
  Last_Vaccine_Date?: string;   // วันที่ฉีดครั้งสุดท้าย
  Sick_Date?: string;           // วันที่เริ่มป่วย/มีอาการ
  Symptoms?: string[];          // รายการอาการทางคลินิก (เดินโซเซ, ตาวาวหรือขวาง, ดุร้าย, น้ำลายไหล ฯลฯ)
  Human_Bitten_Status?: string; // ข้อมูลผู้ถูกกัด (กัดคน, ไม่กัดคน)
  Human_Bitten_Count?: number;  // จำนวนคนถูกกัด
  Human_Saliva_Status?: string; // ข้อมูลผู้สัมผัสน้ำลาย (มีคนสัมผัสน้ำลาย, ไม่มีคนสัมผัสน้ำลาย)
  Human_Saliva_Count?: number;  // จำนวนคนสัมผัสน้ำลาย
  Animal_Bitten_Info?: string;  // ข้อมูลสัตว์อื่นถูกกัด
  Animal_Saliva_Info?: string;  // ข้อมูลสัตว์สัมผัสน้ำลาย
  Death_Cause?: string;         // สาเหตุการตาย (ตายเอง, ทำให้ตาย)
  Death_Date?: string;          // วันที่ตาย
  Diagnosis_Result?: string;    // ผลการวินิจฉัยภาษาไทย (ผลบวก, ผลลบ)
  Test_Date?: string;           // วันที่ตรวจ
  Result_Date?: string;         // วันที่แจ้งผล
  Lab_Name?: string;            // ชื่อห้องปฏิบัติการ (เช่น ศวพ.ภาคใต้ นครศรีธรรมราช)
  Examiner?: string;            // ผู้ตรวจ / ผู้รับรองผล
  Agency?: string;              // ชื่อหน่วยงานที่ส่ง (เช่น ทต. นาสาร, ปศุสัตว์จังหวัด)
  Owner_Name?: string;          // ชื่อเจ้าของ / ผู้ส่งตัวอย่าง
  Owner_Phone?: string;         // โทรศัพท์
  Incident_Place?: string;      // ชื่อสถานที่เกิดเหตุ / ที่อยู่อาศัยของสัตว์
  House_No?: string;            // บ้านเลขที่
  Village_No?: string;          // หมู่ที่
  Road?: string;                // ถนน / ซอย
  Zipcode?: string;             // รหัสไปรษณีย์
  Coordinate_Type?: string;     // ประเภทพิกัด (พิกัดจริง)
  Submission_Date_Raw?: string; // วันที่ดิบจากไฟล์
  Submission_Year_BE?: number;  // ปี พ.ศ. ที่รับตัวอย่าง
  _syncedAt?: string;
  [key: string]: any;
}

export interface KapRow {
  id: string;
  Respondent_Age: number;
  Gender: string;
  Occupation: string;
  Pet_Owner: string;
  Knowledge_Score: number; // 0-10 or scaled to 100
  Attitude_Score: number;  // 0-10
  Practice_Score: number;  // 0-10
  Last_Bite_Action: string;
  Survey_Village: string;
  District: string;
  Sub_District?: string;
  _syncedAt?: string;
  [key: string]: any;
}

export interface InterviewRow {
  Timestamp: string;
  Case_ID: string;
  Victim_Age: number;
  Gender: string;
  Exposure_Date: string;
  Exposure_Type: string;
  Severity_Category: 'Category I' | 'Category II' | 'Category III';
  Animal_Status: string;
  Received_RIG: string;
  Health_Station: string;
  District?: string;
  Sub_District?: string;
  _syncedAt?: string;
  [key: string]: any;
}

export interface PepVacRow {
  Year: number | string;
  District: string;
  SubDistrict: string;
  Village: string;
  Patient_HN: string;
  Victim_Age?: number;
  Gender?: string;
  Severity_Category?: 'Category I' | 'Category II' | 'Category III';
  Dose_0_Date: string;
  Dose_3_Date: string;
  Dose_7_Date: string;
  Dose_14_Date: string;
  Dose_28_Date: string;
  Completed_Course: 'Yes' | 'No' | 'In Progress';
  Drop_Out_Reason?: string;
  Health_Station?: string;
  _syncedAt?: string;
  [key: string]: any;
}

export interface QualitativeInsight {
  id: string;
  pillar: 'Human' | 'Animal' | 'Environment';
  title: string;
  category: string;
  keyInformant: string;
  informantRole: string;
  district: string;
  quote: string;
  systemGap: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
}

export type HabitatCategory =
  | 'market'            // ตลาดสด / ตลาดนัด / ตลาดโต้รุ่ง (Fresh & Night Markets)
  | 'waste_landfill'    // บ่อขยะ / ศูนย์กำจัดขยะมูลฝอย / จุดทิ้งขยะชุมชน (Landfills & Dumpsters)
  | 'temple'            // วัด / ศาสนสถาน (Temples & Monasteries)
  | 'government_public' // สถานที่ราชการ / สวนสาธารณะ / มหาวิทยาลัย (Government, Parks, Campuses)
  | 'fishing_port'      // ท่าเทียบเรือประมง / แพปลา (Fishing Ports & Fish Markets)
  | 'community_slum';   // ชุมชนแออัด / ริมทางรถไฟ (Crowded Communities)

export type StrayRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type WasteManagementStatus = 
  | 'OPEN_DUMP'         // บ่อเปิด / กองขยะโล่ง (เสี่ยงสูงสุด)
  | 'CONTAINERIZED'     // ถังขยะปิดมิดชิด
  | 'DAILY_COLLECTED'   // จัดเก็บทุกวัน
  | 'IRREGULAR';        // จัดเก็บไม่สม่ำเสมอ

export interface StrayHabitatFoodSource {
  id: string;
  nameTh: string;
  nameEn: string;
  category: HabitatCategory;
  district: string;
  subDistrict: string;
  village?: string;
  lat: number;
  lng: number;
  estimatedDogs: number;
  estimatedCats: number;
  foodSourceType: string; // e.g. "เศษอาหารสด/เนื้อ/ปลา", "บ่อฝังกลบขยะมูลฝอย", "ข้าวก้นบาตร/ผู้ใจบุญ", "เศษอาหารโรงอาหาร", "เศษปลาแพปลา"
  riskLevel: StrayRiskLevel;
  wasteManagementStatus: WasteManagementStatus;
  vaccinationCoverage: number; // % of strays vaccinated in this hotspot
  neuteredRate: number; // % of strays neutered
  lastSurveyDate: string;
  responsibleAgency: string; // e.g. "เทศบาลนครนครศรีธรรมราช", "ปศุสัตว์อำเภอ", "อบต.ท่าศาลา"
  actionStatus: 'NEEDS_INTERVENTION' | 'MONITORED' | 'VACCINATED_CAMPAIGN' | 'RESOLVED';
  notes?: string;
  source?: string;
  isCustomAdded?: boolean;
}

export interface RabiesFreeCriteriaEvaluation {
  // Dimension 1: Human (20 pts)
  dim1HumanRabiesZero: boolean;
  dim1PepCoverageAdequate: boolean;
  dim1Score: number; // max 20

  // Dimension 2: Animal (25 pts)
  dim2AnimalRabiesZero2Yrs: boolean;
  dim2SurveillanceAdequate: boolean;
  dim2Score: number; // max 25

  // Dimension 3: Vaccination (25 pts)
  dim3VaccineCoveragePct: number;
  dim3ColdChainQuality: boolean;
  dim3Score: number; // max 25

  // Dimension 4: Census & Registration (15 pts)
  dim4CensusCoveragePct: number;
  dim4RegistrationPct: number;
  dim4Score: number; // max 15

  // Dimension 5: Population Control & Sustainability (15 pts)
  dim5SterilizationAdequate: boolean;
  dim5LocalOrdinanceAndBudget: boolean;
  dim5Score: number; // max 15

  // Total and Status
  totalAssessmentScore: number; // 0-100
  assessmentTier: 'FREE_CERTIFIED' | 'CONTROLLED_PROGRESS' | 'AT_RISK_FOCUS' | 'OUTBREAK_CRITICAL';
  statusLabelTh: string;
  mandatoryRequirementsMet: boolean;
  gapRecommendations: string[];
}

export interface RriBreakdown {
  // Pillar 1: Epidemiological Force (Max 35 pts)
  epiForceScore: number;
  activeOutbreakPts: number;
  temporalDecayPts: number;
  humanFatalityPts: number;

  // Pillar 2: Herd Immunity Gap (Max 25 pts)
  immunityGapScore: number;
  vaccineDeficitPts: number;
  nonLinearCollapsePenalty: number;

  // Pillar 3: Animal Ecology & Stray Density (Max 20 pts)
  animalEcologyScore: number;
  strayDensityPts: number;
  sterilizationGapPts: number;
  hotspotPenaltyPts: number;

  // Pillar 4: Human Interface & PEP Dropouts (Max 20 pts)
  humanInterfaceScore: number;
  pepDropoutPts: number;
  rigAccessibilityPts: number;

  // Spatial Spillover (Max 10 pts)
  spatialSpilloverScore: number;

  // Total raw score before clamp
  rawCalculatedScore: number;
  finalRriScore: number;
  riskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ต่ำ';
  primaryRiskDriver: string;
  recommendedInterventions: string[];
}

export interface RriForecastResult {
  currentRri: number;
  forecastRri1Year: number;
  forecastRri2Years: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  trendDelta: number;
  outbreakProbabilityPct: number;
  herdImmunityStatus: 'OPTIMAL' | 'VULNERABLE' | 'CRITICAL_COLLAPSE';
}

export interface AreaZoneSummary {
  areaId: string;
  areaNameTh: string;
  areaNameEn?: string;
  level: 'province' | 'district' | 'subdistrict' | 'village';
  parentDistrict?: string;
  parentSubDistrict?: string;
  zone: ZoneCategory;
  zoneReason: string;
  latestHumanDeathYearBE?: number;
  animalPositivesSelectedYear: number;
  animalPositivesPrevYear: number;
  animalPositives2YearsAgo: number;
  animalPositives3YearsAgo?: number;
  animalPositives4YearsAgo?: number;
  totalAnimalTested: number;
  vaccineCoverageRate: number; // 0-100%
  strayRatio: number; // percentage of strays
  sterilizationRate: number;
  pepComplianceRate: number;
  riskIndexScore: number; // 0-100
  riskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ต่ำ';
  subDistrictsCount?: number;
  evaluation?: RabiesFreeCriteriaEvaluation;
  rriBreakdown?: RriBreakdown;
  rriForecast?: RriForecastResult;
}

export interface DistrictZoneSummary extends AreaZoneSummary {
  districtId: string;
  districtNameTh: string;
  districtNameEn: string;
  level: 'district';
}

export interface SubDistrictZoneSummary extends AreaZoneSummary {
  subDistrictNameTh: string;
  parentDistrict: string;
  level: 'subdistrict';
}

export interface SheetMappingConfig {
  sheet: string;
  collection: string;
  keys: string[];
  description?: string;
  category?: 'animal' | 'disease' | 'survey' | 'clinical';
}

export type SheetDataMap = {
  DOG2025: Dog2025Row[];
  RABIES: RabiesRow[];
  KAP: KapRow[];
  Interview: InterviewRow[];
  PEP_VAC: PepVacRow[];
  [key: string]: any[];
};

export interface SyncSimulationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  sheet: string;
  collection: string;
  docId: string;
  action: 'create' | 'update' | 'skip' | 'error';
  message: string;
}

export interface SyncSimulationStats {
  created: number;
  updated: number;
  failed: number;
  totalProcessed: number;
  executionTimeMs: number;
  startTime: string;
  endTime: string;
}

export interface AppsScriptSettings {
  projectId: string;
  serviceAccountEmail: string;
  privateKeySnippet: string;
  useScriptProperties: boolean;
  libraryId: string;
  autoTimestampField: string;
  addSanitization: boolean;
}

export type ActiveNavTab =
  | 'executive'
  | 'animal'
  | 'rabies'
  | 'kap'
  | 'qualitative'
  | 'pep'
  | 'situation'
  | 'risk'
  | 'gis'
  | 'zones'
  | 'sync_hub';
