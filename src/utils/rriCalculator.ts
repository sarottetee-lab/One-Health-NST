import { RriBreakdown, RriForecastResult, ZoneCategory } from '../types';

/**
 * ============================================================================
 * ทฤษฎีและแบบจำลองการพยากรณ์ความเสี่ยงโรคพิษสุนัขบ้า (Rabies Risk Index - RRI)
 * ============================================================================
 *
 * อ้างอิงตามหลักการ One Health, องค์การอนามัยโลก (WHO TRS 1012),
 * องค์การสุขภาพสัตว์โลก (WOAH Terrestrial Animal Health Code), และ
 * แผนยุทธศาสตร์การกำจัดโรคพิษสุนัขบ้าแห่งประเทศไทย (โครงการสัตว์ปลอดโรค คนปลอดภัยฯ)
 *
 * กรอบแนวคิดเชิงคณิตศาสตร์และระบาดวิทยา (Mathematical Formulation):
 * ----------------------------------------------------------------------------
 * RRI รวมค่าคะแนน 0 - 100 จุด ประเมินจาก 4 เสาหลัก (Pillars) + 1 ปัจจัยการแพร่กระจายเชิงพื้นที่:
 *
 * 1. เสาหลักที่ 1: ความดันการระบาดและประวัติการพบเชื้อซ้ำ (Epidemiological Force & Recurrence - 35 คะแนน)
 *    - Active Outbreak Force ($C_0$): จำนวนสัตว์ติดเชื้อที่ยืนยันผลแล็บ (Positive) ในปีปัจจุบัน
 *    - Temporal Decay Recurrence ($\sum \omega_t C_t$): ประวัติการพบเชื้อย้อนหลัง 5 ปี ถ่วงน้ำหนักลดหลั่นแบบ Exponential Decay:
 *      $\omega_1 = 0.50$ (ปี $Y-1$), $\omega_2 = 0.25$ (ปี $Y-2$), $\omega_3 = 0.125$ (ปี $Y-3$), $\omega_4 = 0.06$ (ปี $Y-4$), $\omega_5 = 0.03$ (ปี $Y-5$)
 *    - Human Rabies Fatality Impact: การพบผู้เสียชีวิตในคนในรอบ 3 ปี (บทลงโทษสูงสุด +5 แต้ม)
 *
 * 2. เสาหลักที่ 2: ช่องว่างภูมิคุ้มกันฝูงในสัตว์ (Herd Immunity Deficit - 25 คะแนน)
 *    - อิงทฤษฎี Critical Vaccination Threshold ($V_c = 1 - 1/R_0$): สำหรับโรคพิษสุนัขบ้าในสุนัข ($R_0 \approx 1.2 - 2.0$)
 *      เกณฑ์ภูมิคุ้มกันฝูงขั้นต่ำคือ $70\% - 80\%$
 *    - หาก $V_{\text{cov}} \ge 80\% \rightarrow$ ค่าปรับเป็น 0 (มีภูมิคุ้มกันฝูงตัดวงจรไวรัส $R_e < 1$)
 *    - หาก $70\% \le V_{\text{cov}} < 80\% \rightarrow$ โซนเปราะบาง เพิ่มความเสี่ยงเชิงเส้น (Linear penalty 0 - 8 แต้ม)
 *    - หาก $V_{\text{cov}} < 70\% \rightarrow$ ภูมิคุ้มกันฝูงล่มสลาย เพิ่มความเสี่ยงแบบยกกำลัง (Non-linear exponential penalty สูงสุด 25 แต้ม)
 *
 * 3. เสาหลักที่ 3: นิเวศวิทยาสัตว์และประชากรสุนัขจรจัด (Animal Ecology & Stray Dynamics - 20 คะแนน)
 *    - สัดส่วนสุนัขจรจัด/ไร้เจ้าของ ($S_{\text{ratio}} = \text{Stray} / \text{Total}$): อัตราการสัมผัสและการกระจายตัวของฝูงสุนัข
 *    - ช่องว่างการผ่าตัดทำหมันคุมกำเนิด ($\text{Sterilization Gap} = \max(0, 50\% - \text{Sterilization Rate})$)
 *    - ปัจจัยพื้นที่เสี่ยงสะสมอาหาร (Hotspot: ตลาดสด/บ่อขยะ/วัด/ชุมทาง)
 *
 * 4. เสาหลักที่ 4: ความเสี่ยงการสัมผัสโรคในคนและการขาดนัด PEP (Human Interface & PEP Compliance - 20 คะแนน)
 *    - อัตราการฉีดวัคซีนไม่ครบชุดตามนัด (PEP Dropout Rate = $100\% - \text{PEP Compliance Rate}$)
 *    - ความเสี่ยงแผลระดับ Category III และการเข้าถึงเซรุ่ม RIG
 *
 * 5. ปัจจัยการแพร่กระจายข้ามแดนเชิงพื้นที่ (Spatial Contagion / Buffer Spillover - สูงสุด +10 คะแนน)
 *    - กฎข้อแรกของภูมิศาสตร์ของ Tobler (First Law of Geography): พื้นที่ติดกับโซนระบาดสีแดง (Zone C) มีแรงดันการระบาดสูงขึ้น
 *
 * การจำแนกระดับความเสี่ยง (Risk Stratification):
 * - วิกฤต (Critical / Red): RRI $\ge 70$ (บังคับวงรอบควบคุม 3 กม. / ฉีดวัคซีน 5 กม. / กักสัตว์ 6 เดือน)
 * - สูง (High / Orange): RRI $50 - 69$ (ปูพรมฉีดวัคซีนเพิ่ม / เฝ้าระวังรอยต่อเข้มข้น / สกัดสุนัขจรจัด)
 * - ปานกลาง (Moderate / Yellow): RRI $30 - 49$ (เร่งรัดฉีดวัคซีนแตะ $80\%$ / ทำหมันควบคุมประชากร)
 * - ต่ำ (Low / Green): RRI $< 30$ (รักษาภูมิคุ้มกันฝูง $\ge 80\%$ / เฝ้าระวังเชิงรุกอย่างยั่งยืน)
 */

export interface RriCalculationParams {
  positivesCurrentYear: number;
  positivesPrevYear?: number;
  positives2YearsAgo?: number;
  positives3YearsAgo?: number;
  positives4YearsAgo?: number;
  positives5YearsAgo?: number;
  hasHumanDeathPast3Years?: boolean;
  vaccineCoverageRate: number; // 0 - 100%
  strayRatio: number; // 0 - 100%
  sterilizationRate?: number; // 0 - 100%
  pepComplianceRate?: number; // 0 - 100%
  isAdjacentToOutbreakZone?: boolean;
  hasHighRiskHotspots?: boolean;
  totalAnimalTested?: number;
}

/**
 * คำนวณ Rabies Risk Index (RRI) และแจกแจงค่าคะแนนในแต่ละมิติ
 */
export function calculateDetailedRri(params: RriCalculationParams): RriBreakdown {
  const {
    positivesCurrentYear = 0,
    positivesPrevYear = 0,
    positives2YearsAgo = 0,
    positives3YearsAgo = 0,
    positives4YearsAgo = 0,
    positives5YearsAgo = 0,
    hasHumanDeathPast3Years = false,
    vaccineCoverageRate = 80,
    strayRatio = 15,
    sterilizationRate = 30,
    pepComplianceRate = 88,
    isAdjacentToOutbreakZone = false,
    hasHighRiskHotspots = false,
  } = params;

  // --------------------------------------------------------------------------
  // เสาหลักที่ 1: ความดันการระบาดและประวัติการพบเชื้อซ้ำ (Max 35 pts)
  // --------------------------------------------------------------------------
  // 1.1 Active Outbreak Points (Max 20 pts)
  const activeOutbreakPts = Math.min(20, positivesCurrentYear * 8);

  // 1.2 Temporal Decay Recurrence Points (Max 10 pts)
  const decaySum =
    positivesPrevYear * 0.50 +
    positives2YearsAgo * 0.25 +
    positives3YearsAgo * 0.125 +
    positives4YearsAgo * 0.06 +
    positives5YearsAgo * 0.03;
  const temporalDecayPts = Math.min(10, decaySum * 6);

  // 1.3 Human Fatality Impact (Max 5 pts)
  const humanFatalityPts = hasHumanDeathPast3Years ? 5 : 0;

  const epiForceScore = Math.min(35, activeOutbreakPts + temporalDecayPts + humanFatalityPts);

  // --------------------------------------------------------------------------
  // เสาหลักที่ 2: ช่องว่างภูมิคุ้มกันฝูงในสัตว์ (Max 25 pts)
  // --------------------------------------------------------------------------
  let vaccineDeficitPts = 0;
  let nonLinearCollapsePenalty = 0;

  if (vaccineCoverageRate < 80) {
    if (vaccineCoverageRate >= 70) {
      // 70-80%: Linear penalty
      vaccineDeficitPts = ((80 - vaccineCoverageRate) / 10) * 8;
    } else {
      // < 70%: Exponential penalty due to herd immunity collapse
      vaccineDeficitPts = 8;
      const deficitUnder70 = 70 - vaccineCoverageRate;
      nonLinearCollapsePenalty = Math.min(17, Math.pow(deficitUnder70 / 70, 1.15) * 17);
    }
  }
  const immunityGapScore = Math.min(25, vaccineDeficitPts + nonLinearCollapsePenalty);

  // --------------------------------------------------------------------------
  // เสาหลักที่ 3: นิเวศวิทยาสัตว์และประชากรสุนัขจรจัด (Max 20 pts)
  // --------------------------------------------------------------------------
  // 3.1 Stray Density Score (Max 12 pts)
  const strayDensityPts = Math.min(12, (strayRatio / 35) * 12);

  // 3.2 Sterilization Gap Score (Max 5 pts)
  const sterilDeficit = Math.max(0, 50 - sterilizationRate);
  const sterilizationGapPts = Math.min(5, (sterilDeficit / 50) * 5);

  // 3.3 High-Risk Gathering Hotspots (Max 3 pts)
  const hotspotPenaltyPts = hasHighRiskHotspots ? 3 : 0;

  const animalEcologyScore = Math.min(20, strayDensityPts + sterilizationGapPts + hotspotPenaltyPts);

  // --------------------------------------------------------------------------
  // เสาหลักที่ 4: ความเสี่ยงการสัมผัสโรคในคนและการขาดนัด PEP (Max 20 pts)
  // --------------------------------------------------------------------------
  // 4.1 PEP Dropout Rate (Max 15 pts)
  const pepDropoutRate = Math.max(0, 100 - pepComplianceRate);
  const pepDropoutPts = Math.min(15, (pepDropoutRate / 25) * 15);

  // 4.2 Severe Exposure / RIG Access Factor (Max 5 pts)
  const rigAccessibilityPts = pepComplianceRate < 75 ? 5 : pepComplianceRate < 85 ? 2.5 : 0;

  const humanInterfaceScore = Math.min(20, pepDropoutPts + rigAccessibilityPts);

  // --------------------------------------------------------------------------
  // ปัจจัยการแพร่กระจายเชิงพื้นที่ (Spatial Contagion / Buffer Spillover - Max 10 pts)
  // --------------------------------------------------------------------------
  let spatialSpilloverScore = 0;
  if (isAdjacentToOutbreakZone && positivesCurrentYear === 0) {
    spatialSpilloverScore = 7.5;
  } else if (isAdjacentToOutbreakZone) {
    spatialSpilloverScore = 4.0;
  }

  // --------------------------------------------------------------------------
  // คำนวณคะแนนรวม RRI รวม และจัดระดับความเสี่ยง
  // --------------------------------------------------------------------------
  const rawCalculatedScore =
    epiForceScore +
    immunityGapScore +
    animalEcologyScore +
    humanInterfaceScore +
    spatialSpilloverScore;

  const finalRriScore = Math.min(100, Math.max(5, Math.round(rawCalculatedScore)));

  let riskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ต่ำ' = 'ต่ำ';
  if (finalRriScore >= 70) riskLevel = 'วิกฤต';
  else if (finalRriScore >= 50) riskLevel = 'สูง';
  else if (finalRriScore >= 30) riskLevel = 'ปานกลาง';
  else riskLevel = 'ต่ำ';

  // หา Primary Risk Driver (สาเหตุหลักที่ผลักดันค่าความเสี่ยง)
  const drivers = [
    { name: 'การระบาดของเชื้อไวรัสในสัตว์ (Epidemiological Force)', score: (epiForceScore / 35) * 100 },
    { name: 'ช่องว่างความครอบคลุมวัคซีนต่ำกว่าเกณฑ์ภูมิคุ้มกันฝูง (Immunity Gap)', score: (immunityGapScore / 25) * 100 },
    { name: 'ประชากรสุนัขจรจัดหนาแน่นและการทำหมันต่ำ (Stray Animal Ecology)', score: (animalEcologyScore / 20) * 100 },
    { name: 'อัตราการขาดนัดรับวัคซีน PEP ในคน (PEP Non-Compliance)', score: (humanInterfaceScore / 20) * 100 },
  ];
  drivers.sort((a, b) => b.score - a.score);
  const primaryRiskDriver = drivers[0].name;

  // ข้อเสนอแนะมาตรการเชิงรุก (Actionable Interventions)
  const recommendedInterventions: string[] = [];
  if (positivesCurrentYear > 0) {
    recommendedInterventions.push('บังคับใช้มาตรการควบคุมโรคเข้มข้น รัศมี 3 กม. และปูพรมฉีดวัคซีนซ้ำในรัศมี 5 กม.');
  }
  if (vaccineCoverageRate < 80) {
    recommendedInterventions.push(
      `เร่งรัดการรณรงค์ฉีดวัคซีนสัตว์ให้บรรลุเป้าหมายภูมิคุ้มกันฝูง $\\ge 80\\%$ (ปัจจุบัน ${vaccineCoverageRate.toFixed(1)}%)`
    );
  }
  if (strayRatio > 20 || sterilizationRate < 35) {
    recommendedInterventions.push('จัดตั้งหน่วยสัตวแพทย์เคลื่อนที่เพื่อผ่าตัดทำหมันและฉีดวัคซีนสุนัขจรจัดในจุดเสี่ยง');
  }
  if (pepComplianceRate < 85) {
    recommendedInterventions.push('พัฒนาระบบติดตามผู้สัมผัสโรค (PEP Tracking) และประสาน อสม. ลงพื้นที่เคาะประตูบ้านติดตามผู้ขาดนัด');
  }
  if (isAdjacentToOutbreakZone) {
    recommendedInterventions.push('ตั้งจุดตรวจสกัดการเคลื่อนย้ายสัตว์ข้ามแนวเขตติดต่อ (Buffer Zone Ring) และเฝ้าระวังเชิงรุก');
  }

  return {
    epiForceScore: Number(epiForceScore.toFixed(1)),
    activeOutbreakPts: Number(activeOutbreakPts.toFixed(1)),
    temporalDecayPts: Number(temporalDecayPts.toFixed(1)),
    humanFatalityPts: Number(humanFatalityPts.toFixed(1)),

    immunityGapScore: Number(immunityGapScore.toFixed(1)),
    vaccineDeficitPts: Number(vaccineDeficitPts.toFixed(1)),
    nonLinearCollapsePenalty: Number(nonLinearCollapsePenalty.toFixed(1)),

    animalEcologyScore: Number(animalEcologyScore.toFixed(1)),
    strayDensityPts: Number(strayDensityPts.toFixed(1)),
    sterilizationGapPts: Number(sterilizationGapPts.toFixed(1)),
    hotspotPenaltyPts: Number(hotspotPenaltyPts.toFixed(1)),

    humanInterfaceScore: Number(humanInterfaceScore.toFixed(1)),
    pepDropoutPts: Number(pepDropoutPts.toFixed(1)),
    rigAccessibilityPts: Number(rigAccessibilityPts.toFixed(1)),

    spatialSpilloverScore: Number(spatialSpilloverScore.toFixed(1)),

    rawCalculatedScore: Number(rawCalculatedScore.toFixed(1)),
    finalRriScore,
    riskLevel,
    primaryRiskDriver,
    recommendedInterventions,
  };
}

/**
 * คำนวณการพยากรณ์ความเสี่ยงล่วงหน้า 1-2 ปี (RRI Trend Forecasting Engine)
 */
export function forecastRriTrend(
  currentRri: number,
  params: RriCalculationParams
): RriForecastResult {
  const {
    positivesCurrentYear = 0,
    positivesPrevYear = 0,
    vaccineCoverageRate = 80,
    strayRatio = 15,
    sterilizationRate = 30,
  } = params;

  // คำนวณความเปลี่ยนแปลงแนวโน้มโรค
  const caseDelta = positivesCurrentYear - positivesPrevYear;
  const vaccineMomentum = (vaccineCoverageRate - 80) * 0.35;
  const strayMomentum = (strayRatio - 15) * 0.25 - (sterilizationRate - 30) * 0.15;

  let trendDelta = caseDelta * 4.5 - vaccineMomentum + strayMomentum;
  trendDelta = Math.max(-18, Math.min(18, trendDelta));

  const forecastRri1Year = Math.min(100, Math.max(5, Math.round(currentRri + trendDelta)));
  const forecastRri2Years = Math.min(100, Math.max(5, Math.round(forecastRri1Year + trendDelta * 0.65)));

  let trendDirection: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (trendDelta > 3) trendDirection = 'increasing';
  else if (trendDelta < -3) trendDirection = 'decreasing';

  // ความน่าจะเป็นในการเกิดการระบาดซ้ำ (%)
  let outbreakProbabilityPct = 5;
  if (currentRri >= 70) {
    outbreakProbabilityPct = Math.min(95, 65 + positivesCurrentYear * 5 + (80 - vaccineCoverageRate));
  } else if (currentRri >= 50) {
    outbreakProbabilityPct = Math.min(75, 40 + (80 - vaccineCoverageRate) * 1.2);
  } else if (currentRri >= 30) {
    outbreakProbabilityPct = Math.min(45, 15 + (80 - vaccineCoverageRate) * 0.8);
  } else {
    outbreakProbabilityPct = Math.max(2, 5 + (80 - vaccineCoverageRate) * 0.3);
  }

  let herdImmunityStatus: 'OPTIMAL' | 'VULNERABLE' | 'CRITICAL_COLLAPSE' = 'OPTIMAL';
  if (vaccineCoverageRate >= 80) herdImmunityStatus = 'OPTIMAL';
  else if (vaccineCoverageRate >= 70) herdImmunityStatus = 'VULNERABLE';
  else herdImmunityStatus = 'CRITICAL_COLLAPSE';

  return {
    currentRri,
    forecastRri1Year,
    forecastRri2Years,
    trendDirection,
    trendDelta: Number(trendDelta.toFixed(1)),
    outbreakProbabilityPct: Math.round(outbreakProbabilityPct),
    herdImmunityStatus,
  };
}

/**
 * จำลองสถานการณ์ "What-If" Scenario Simulation:
 * ประเมินว่าหากดำเนินมาตรการปรับเปลี่ยนปัจจัย จะส่งผลให้ค่า RRI ลดลงเท่าใด
 */
export function simulateRriScenario(
  baseParams: RriCalculationParams,
  modifications: {
    targetVaccineCoverage?: number;
    targetStrayRatio?: number;
    targetSterilizationRate?: number;
    targetPepCompliance?: number;
  }
): {
  baselineRri: number;
  simulatedRri: number;
  reductionPoints: number;
  reductionPercent: number;
  newRiskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ต่ำ';
  breakdown: RriBreakdown;
} {
  const baseResult = calculateDetailedRri(baseParams);

  const simulatedParams: RriCalculationParams = {
    ...baseParams,
    vaccineCoverageRate: modifications.targetVaccineCoverage ?? baseParams.vaccineCoverageRate,
    strayRatio: modifications.targetStrayRatio ?? baseParams.strayRatio,
    sterilizationRate: modifications.targetSterilizationRate ?? (baseParams.sterilizationRate || 30),
    pepComplianceRate: modifications.targetPepCompliance ?? (baseParams.pepComplianceRate || 88),
  };

  const simResult = calculateDetailedRri(simulatedParams);
  const reductionPoints = baseResult.finalRriScore - simResult.finalRriScore;
  const reductionPercent = baseResult.finalRriScore > 0 ? (reductionPoints / baseResult.finalRriScore) * 100 : 0;

  return {
    baselineRri: baseResult.finalRriScore,
    simulatedRri: simResult.finalRriScore,
    reductionPoints: Number(reductionPoints.toFixed(1)),
    reductionPercent: Number(reductionPercent.toFixed(1)),
    newRiskLevel: simResult.riskLevel,
    breakdown: simResult,
  };
}

/**
 * คำอธิบายและรายละเอียดทางทฤษฎีสำหรับนำไปแสดงผลใน User Interface
 */
export const RRI_THEORY_SPEC = {
  titleTh: 'กรอบแบบจำลองพยากรณ์ความเสี่ยงโรคพิษสุนัขบ้า (Rabies Risk Index - RRI)',
  titleEn: 'Multi-Pillar Rabies Risk Index & Epidemic Forecasting Framework',
  scientificBasis: [
    {
      pillar: '1. ความดันการระบาดและการเกิดซ้ำ (Epidemiological Force)',
      weight: '35%',
      maxPoints: 35,
      theory: 'ประเมินจากสมการการคงอยู่ของเชื้อไวรัสในแหล่งรังโรคธรรมชาติ (Reservoir Persistence Equation) โดยใช้การลดหลั่นแบบถ่วงน้ำหนักเวลาร่วมกับการพบเคสในคน',
      variables: 'เคสสัตว์บวกปีปัจจุบัน (C0), เคสบวกย้อนหลัง 5 ปี (Temporal Decay λ=0.5), ประวัติการเสียชีวิตในคน (3 ปี)',
      standardSource: 'WHO Technical Report Series 1012 (Rabies Surveillance Guidelines)',
    },
    {
      pillar: '2. ช่องว่างภูมิคุ้มกันฝูงในสัตว์ (Herd Immunity Gap)',
      weight: '25%',
      maxPoints: 25,
      theory: 'ทฤษฎี Critical Vaccination Threshold (Vc = 1 - 1/R0) ซึ่งโรคพิษสุนัขบ้าต้องการความครอบคลุมวัคซีนอย่างน้อย 70-80% เพื่อตัดวงจรการแพร่เชื้อ (Re < 1)',
      variables: 'อัตราความครอบคลุมวัคซีนสัตว์ (เทียบเกณฑ์ 80%) พร้อมบทลงโทษแบบ Non-linear เมื่อต่ำกว่า 70%',
      standardSource: 'WOAH Terrestrial Animal Health Code / กรมปศุสัตว์',
    },
    {
      pillar: '3. นิเวศวิทยาสัตว์และสุนัขจรจัด (Stray Dog Ecology)',
      weight: '20%',
      maxPoints: 20,
      theory: 'สมการความหนาแน่นสัมผัส (Contact Rate & Ro Dynamics) ในกลุ่มประชากรสัตว์จรจัดและสัตว์ปล่อยอิสระที่ขาดการคุมกำเนิด',
      variables: 'สัดส่วนสุนัขจรจัด (Stray Ratio), อัตราการผ่าตัดทำหมัน (Sterilization Rate), จุดรวมอาหารเสี่ยงสูง (Hotspots)',
      standardSource: 'Global Alliance for Rabies Control (GARC) / กรมปศุสัตว์',
    },
    {
      pillar: '4. ความเสี่ยงในคนและการรับวัคซีน PEP (Human Interface & PEP)',
      weight: '20%',
      maxPoints: 20,
      theory: 'การประเมินจุดเปราะบางทางสาธารณสุขในการป้องกันผู้สัมผัสโรคไม่ให้เกิดอาการทางคลินิก (Fatal Vulnerability Assessment)',
      variables: 'อัตราการขาดนัดรับวัคซีน PEP (Drop-out Rate), ความพร้อมของเซรุ่ม RIG และการเข้าถึงหน่วยบริการ',
      standardSource: 'WHO Post-Exposure Prophylaxis (PEP) Position Paper / กรมควบคุมโรค',
    },
  ],
};
