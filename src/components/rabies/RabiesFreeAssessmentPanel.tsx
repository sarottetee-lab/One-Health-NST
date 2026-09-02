import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Sliders,
  Download,
  Info,
  Layers,
  Search,
  Building,
  HelpCircle,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  DistrictZoneSummary,
  Dog2025Row,
  RabiesRow,
  PepVacRow,
  RabiesFreeCriteriaEvaluation,
} from '../../types';
import { NAKHON_DISTRICTS, HISTORICAL_HUMAN_DEATHS } from '../../data/nakhonDistricts';
import { useFilter } from '../../context/FilterContext';
import { getEvaluationTierBadge, getZoneBadgeConfig } from '../../utils/zoneClassifier';
import { formatPercent, toBE } from '../../utils/thaiYear';

interface RabiesFreeAssessmentPanelProps {
  zoneSummaries: DistrictZoneSummary[];
  selectedDistrict: string;
  onSelectDistrict?: (distName: string) => void;
}

type AssessmentTab = 'matrix' | 'guidelines' | 'simulator' | 'table';

export const RabiesFreeAssessmentPanel: React.FC<RabiesFreeAssessmentPanelProps> = ({
  zoneSummaries,
  selectedDistrict,
  onSelectDistrict,
}) => {
  const { selectedYear } = useFilter();
  const [activeTab, setActiveTab] = useState<AssessmentTab>('matrix');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  // Simulator State for Local Self-Assessment
  const [simHumanDeath2Yrs, setSimHumanDeath2Yrs] = useState<boolean>(false);
  const [simPepAdequate, setSimPepAdequate] = useState<boolean>(true);
  const [simAnimalPositives2Yrs, setSimAnimalPositives2Yrs] = useState<boolean>(false);
  const [simSampleSubmissions, setSimSampleSubmissions] = useState<number>(6);
  const [simVaccineCoverage, setSimVaccineCoverage] = useState<number>(84);
  const [simCensusCoverage, setSimCensusCoverage] = useState<number>(88);
  const [simSterilizationRate, setSimSterilizationRate] = useState<number>(32);
  const [simLocalOrdinance, setSimLocalOrdinance] = useState<boolean>(true);

  // Selected district summary or default to first
  const activeDistrictSummary =
    zoneSummaries.find((d) => d.districtNameTh === selectedDistrict) ||
    zoneSummaries.find((d) => d.districtNameTh.includes(selectedDistrict)) ||
    zoneSummaries[0];

  // Provincial aggregation
  const freeCertifiedCount = zoneSummaries.filter(
    (z) => z.evaluation?.assessmentTier === 'FREE_CERTIFIED'
  ).length;
  const controlledCount = zoneSummaries.filter(
    (z) => z.evaluation?.assessmentTier === 'CONTROLLED_PROGRESS'
  ).length;
  const atRiskCount = zoneSummaries.filter(
    (z) => z.evaluation?.assessmentTier === 'AT_RISK_FOCUS'
  ).length;
  const outbreakCount = zoneSummaries.filter(
    (z) => z.evaluation?.assessmentTier === 'OUTBREAK_CRITICAL'
  ).length;

  const avgTotalScore = Math.round(
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.totalAssessmentScore || 0), 0) /
      (zoneSummaries.length || 1)
  );

  const avgDim1 = (
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.dim1Score || 0), 0) /
    (zoneSummaries.length || 1)
  ).toFixed(1);
  const avgDim2 = (
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.dim2Score || 0), 0) /
    (zoneSummaries.length || 1)
  ).toFixed(1);
  const avgDim3 = (
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.dim3Score || 0), 0) /
    (zoneSummaries.length || 1)
  ).toFixed(1);
  const avgDim4 = (
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.dim4Score || 0), 0) /
    (zoneSummaries.length || 1)
  ).toFixed(1);
  const avgDim5 = (
    zoneSummaries.reduce((acc, curr) => acc + (curr.evaluation?.dim5Score || 0), 0) /
    (zoneSummaries.length || 1)
  ).toFixed(1);

  // Radar chart data for currently selected district
  const evalData = activeDistrictSummary?.evaluation;
  const radarChartData = [
    {
      dimension: '1. โรคในคน (20)',
      score: evalData ? evalData.dim1Score : 18,
      max: 20,
      provAvg: parseFloat(avgDim1),
    },
    {
      dimension: '2. โรคในสัตว์/เฝ้าระวัง (25)',
      score: evalData ? evalData.dim2Score : 22,
      max: 25,
      provAvg: parseFloat(avgDim2),
    },
    {
      dimension: '3. ฉีดวัคซีน ≥80% (25)',
      score: evalData ? evalData.dim3Score : 20,
      max: 25,
      provAvg: parseFloat(avgDim3),
    },
    {
      dimension: '4. สำรวจ/ทะเบียน (15)',
      score: evalData ? evalData.dim4Score : 13,
      max: 15,
      provAvg: parseFloat(avgDim4),
    },
    {
      dimension: '5. ทำหมัน/ยั่งยืน (15)',
      score: evalData ? evalData.dim5Score : 12,
      max: 15,
      provAvg: parseFloat(avgDim5),
    },
  ];

  // Filtered districts
  const filteredDistricts = zoneSummaries.filter((d) => {
    const matchSearch =
      searchDistrict === '' ||
      d.districtNameTh.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      d.districtNameEn.toLowerCase().includes(searchDistrict.toLowerCase());
    const matchTier =
      statusFilter === 'all' || d.evaluation?.assessmentTier === statusFilter;
    return matchSearch && matchTier;
  });

  // Calculate Simulator score
  const simDim1Score = (simHumanDeath2Yrs ? 0 : 15) + (simPepAdequate ? 5 : 2);
  const simDim2AnimalScore = simAnimalPositives2Yrs ? 0 : 15;
  const simDim2SurvScore =
    simSampleSubmissions >= 5 ? 10 : simSampleSubmissions >= 2 ? 7 : 4;
  const simDim2Score = simDim2AnimalScore + simDim2SurvScore;

  let simDim3Score = 5;
  if (simVaccineCoverage >= 80) simDim3Score = 25;
  else if (simVaccineCoverage >= 75) simDim3Score = 20;
  else if (simVaccineCoverage >= 70) simDim3Score = 16;
  else if (simVaccineCoverage >= 60) simDim3Score = 10;

  const simDim4Score =
    (simCensusCoverage >= 80 ? 10 : simCensusCoverage >= 65 ? 7 : 4) +
    (simCensusCoverage >= 75 ? 5 : 3);
  const simDim5Score =
    (simSterilizationRate >= 25 ? 7 : 4) + (simLocalOrdinance ? 8 : 4);

  const simTotalScore = Math.min(
    100,
    simDim1Score + simDim2Score + simDim3Score + simDim4Score + simDim5Score
  );
  const simMandatoryMet =
    !simHumanDeath2Yrs &&
    !simAnimalPositives2Yrs &&
    simVaccineCoverage >= 80 &&
    simCensusCoverage >= 80;

  let simTierLabel = 'พื้นที่ควบคุมโรคได้ (ก้าวสู่ปลอดโรค)';
  let simTierColor = 'bg-amber-100 text-amber-800 border-amber-300';
  let simTierPass = false;

  if (simHumanDeath2Yrs) {
    simTierLabel = 'พื้นที่ระบาดวิกฤต (พบผู้เสียชีวิต)';
    simTierColor = 'bg-red-950 text-red-200 border-red-800';
  } else if (simAnimalPositives2Yrs) {
    simTierLabel = 'พื้นที่พบสัตว์ติดเชื้อ (จุดเสี่ยงระบาด)';
    simTierColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (simTotalScore >= 80 && simMandatoryMet) {
    simTierLabel = 'พื้นที่ปลอดโรคพิษสุนัขบ้า (ผ่านการรับรอง)';
    simTierColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    simTierPass = true;
  } else if (simTotalScore >= 60 && simVaccineCoverage >= 70) {
    simTierLabel = 'พื้นที่ควบคุมโรคได้ (ก้าวสู่ปลอดโรค)';
    simTierColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else {
    simTierLabel = 'พื้นที่เสี่ยง (ต้องเร่งรัดการดำเนินงาน)';
    simTierColor = 'bg-rose-100 text-rose-800 border-rose-300';
  }

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = [
      'รหัสอำเภอ',
      'ชื่ออำเภอ',
      'สถานะการประเมิน',
      'คะแนนรวม (100)',
      'ผ่านเกณฑ์บังคับ',
      'มิติที่ 1 โรคในคน (20)',
      'มิติที่ 2 โรคในสัตว์ (25)',
      'มิติที่ 3 วัคซีน ≥80% (25)',
      'มิติที่ 4 สำรวจ/ทะเบียน (15)',
      'มิติที่ 5 ควบคุมประชากร/ยั่งยืน (15)',
      'ความครอบคลุมวัคซีน %',
      'สัตว์ติดเชื้อปีประเมิน',
      'ประวัติคนเสียชีวิต',
    ];

    const rows = zoneSummaries.map((z) => [
      z.districtId,
      z.districtNameTh,
      z.evaluation?.statusLabelTh || '',
      z.evaluation?.totalAssessmentScore || 0,
      z.evaluation?.mandatoryRequirementsMet ? 'ผ่าน' : 'ไม่ผ่าน',
      z.evaluation?.dim1Score || 0,
      z.evaluation?.dim2Score || 0,
      z.evaluation?.dim3Score || 0,
      z.evaluation?.dim4Score || 0,
      z.evaluation?.dim5Score || 0,
      `${z.vaccineCoverageRate.toFixed(1)}%`,
      z.animalPositivesSelectedYear,
      z.latestHumanDeathYearBE ? `ปี ${z.latestHumanDeathYearBE}` : 'ไม่พบ',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Rabies_Free_Assessment_NST_${toBE(selectedYear)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="rabies-free-assessment-panel">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              เกณฑ์การประเมินพื้นที่ปลอดโรคพิษสุนัขบ้า ฉบับปรับปรุงใหม่ (DDC & DLD)
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              ปีประเมิน พ.ศ. {toBE(selectedYear)}
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ระบบประเมินและรับรองพื้นที่ปลอดโรคพิษสุนัขบ้า 5 มิติ (23 อำเภอ นครศรีธรรมราช)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">
            ประเมินตามเกณฑ์มาตรฐานโครงการสัตว์ปลอดโรค คนปลอดภัย จากโรคพิษสุนัขบ้า ตามพระปณิธานฯ โดยกรมควบคุมโรค กระทรวงสาธารณสุข ร่วมกับกรมปศุสัตว์ และกรมส่งเสริมการปกครองท้องถิ่น
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            ส่งออกผลประเมิน (CSV)
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Certified Free */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              พื้นที่ปลอดโรค (ผ่านเกณฑ์)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              &ge; 80 คะแนน + บังคับ
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {freeCertifiedCount}{' '}
            <span className="text-xs font-normal text-slate-500">/ 23 อำเภอ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            ไม่พบเชื้อทั้งคนและสัตว์ &ge; 2 ปี + วัคซีน &ge; 80% + สำรวจ &ge; 80%
          </p>
        </div>

        {/* Controlled Progress */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              พื้นที่ควบคุมโรคได้ (ก้าวสู่ปลอดโรค)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              60 - 79 คะแนน
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {controlledCount}{' '}
            <span className="text-xs font-normal text-slate-500">/ 23 อำเภอ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            ไม่พบคนเสียชีวิต + สัตว์ไม่พบเชื้อปีนี้ + วัคซีน 70-79% อยู่ระหว่างสะสมระยะเวลา
          </p>
        </div>

        {/* At-Risk Focus */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              พื้นที่เสี่ยง (เฝ้าระวังพิเศษ)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
              &lt; 60 คะแนน / พบเชื้อ
            </span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">
            {atRiskCount}{' '}
            <span className="text-xs font-normal text-slate-500">/ 23 อำเภอ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            ยังพบสัตว์ติดเชื้อผลบวก หรือวัคซีนต่ำกว่า 70% หรือประชากรจรจัดสูง
          </p>
        </div>

        {/* Provincial Average Score */}
        <div className="bg-white p-4.5 rounded-2xl border border-blue-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              คะแนนเฉลี่ยทั้งจังหวัด
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              เต็ม 100
            </span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            {avgTotalScore}{' '}
            <span className="text-xs font-normal text-slate-500">/ 100 คะแนน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
            มิติที่ 1 ({avgDim1}) | 2 ({avgDim2}) | 3 ({avgDim3}) | 4 ({avgDim4}) | 5 ({avgDim5})
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ผลการประเมิน 23 อำเภอ & วิเคราะห์มิติ</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>เครื่องมือจำลองประเมินตนเอง (อปท./อำเภอ)</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guidelines'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>คู่มือเกณฑ์ 5 มิติ & ข้อกำหนดบังคับ</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ตารางข้อมูลเปรียบเทียบเชิงลึก</span>
        </button>
      </div>

      {/* Tab 1: Matrix & Dimensional Analysis */}
      {activeTab === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Row: Selected District Deep Dive & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: District Radar Assessment Profile (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-700">
                    โปรไฟล์การประเมิน 5 มิติ
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeDistrictSummary?.districtNameTh || 'ภาพรวมอำเภอ'}
                  </h3>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      activeDistrictSummary?.evaluation?.assessmentTier === 'FREE_CERTIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : activeDistrictSummary?.evaluation?.assessmentTier === 'CONTROLLED_PROGRESS'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {activeDistrictSummary?.evaluation?.statusLabelTh || 'พื้นที่ควบคุมโรคได้'}
                  </span>
                  <div className="text-xs text-slate-500 mt-1 font-semibold">
                    คะแนนรวม:{' '}
                    <span className="text-emerald-700 text-sm font-bold">
                      {activeDistrictSummary?.evaluation?.totalAssessmentScore || 0}
                    </span>{' '}
                    / 100
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fontSize: 9 }} />
                    <Radar
                      name={activeDistrictSummary?.districtNameTh}
                      dataKey="score"
                      stroke="#059669"
                      fill="#10b981"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name="เฉลี่ยทั้งจังหวัด"
                      dataKey="provAvg"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.15}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Mandatory Checklist for Selected District */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>เกณฑ์บังคับสู่พื้นที่ปลอดโรค (Mandatory Rules)</span>
                  {activeDistrictSummary?.evaluation?.mandatoryRequirementsMet ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านครบทุกข้อ
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> ยังไม่ครบเกณฑ์บังคับ
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {activeDistrictSummary?.evaluation?.dim1HumanRabiesZero ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>ไม่พบคนเสียชีวิต &ge;2 ปี</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeDistrictSummary?.evaluation?.dim2AnimalRabiesZero2Yrs ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>ไม่พบสัตว์ติดเชื้อ &ge;2 ปี</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeDistrictSummary && activeDistrictSummary.vaccineCoverageRate >= 80 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>
                      วัคซีนในสัตว์ &ge;80% ({activeDistrictSummary?.vaccineCoverageRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeDistrictSummary?.evaluation?.dim4CensusCoveragePct &&
                    activeDistrictSummary.evaluation.dim4CensusCoveragePct >= 80 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>
                      สำรวจขึ้นทะเบียน &ge;80% ({activeDistrictSummary?.evaluation?.dim4CensusCoveragePct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Gap Recommendations */}
              {activeDistrictSummary?.evaluation?.gapRecommendations &&
                activeDistrictSummary.evaluation.gapRecommendations.length > 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      ข้อเสนอแนะเพื่อยกระดับสู่พื้นที่ปลอดโรค (Gap Analysis):
                    </div>
                    <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                      {activeDistrictSummary.evaluation.gapRecommendations.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Right: 23 Districts Score Ranking Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    คะแนนประเมินพื้นที่ปลอดโรค 23 อำเภอ (คะแนนเต็ม 100)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เกณฑ์ผ่านรับรองพื้นที่ปลอดโรค: คะแนนรวม &ge; 80 คะแนน พร้อมผ่านเกณฑ์บังคับ
                  </p>
                </div>

                <div className="text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ปลอดโรค (&ge;80)
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> ควบคุมได้ (60-79)
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> พื้นที่เสี่ยง (&lt;60)
                </div>
              </div>

              {/* Ranking Chart */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...zoneSummaries].sort(
                      (a, b) =>
                        (b.evaluation?.totalAssessmentScore || 0) -
                        (a.evaluation?.totalAssessmentScore || 0)
                    )}
                    margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="districtNameTh"
                      tick={{ fill: '#475569', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DistrictZoneSummary;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                              <div className="font-bold text-sm text-emerald-400">
                                {data.districtNameTh} ({data.districtNameEn})
                              </div>
                              <div>
                                สถานะ:{' '}
                                <span className="font-semibold">
                                  {data.evaluation?.statusLabelTh}
                                </span>
                              </div>
                              <div>
                                คะแนนรวม:{' '}
                                <span className="font-bold text-emerald-300">
                                  {data.evaluation?.totalAssessmentScore} / 100
                                </span>
                              </div>
                              <div className="border-t border-slate-700 pt-1 text-[11px] text-slate-300">
                                <div>มิติ 1 โรคในคน: {data.evaluation?.dim1Score} / 20</div>
                                <div>มิติ 2 สัตว์/เฝ้าระวัง: {data.evaluation?.dim2Score} / 25</div>
                                <div>มิติ 3 วัคซีน: {data.evaluation?.dim3Score} / 25 ({data.vaccineCoverageRate.toFixed(1)}%)</div>
                                <div>มิติ 4 สำรวจ/ทะเบียน: {data.evaluation?.dim4Score} / 15</div>
                                <div>มิติ 5 ทำหมัน/ยั่งยืน: {data.evaluation?.dim5Score} / 15</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey={(d: DistrictZoneSummary) => d.evaluation?.totalAssessmentScore || 0}
                      radius={[4, 4, 0, 0]}
                      onClick={(entry) => {
                        if (onSelectDistrict) onSelectDistrict(entry.districtNameTh);
                      }}
                    >
                      {zoneSummaries.map((entry, index) => {
                        const score = entry.evaluation?.totalAssessmentScore || 0;
                        const isSelected = entry.districtNameTh === selectedDistrict;
                        let color = '#f43f5e';
                        if (score >= 80 && entry.evaluation?.mandatoryRequirementsMet)
                          color = '#10b981';
                        else if (score >= 60) color = '#f59e0b';
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={color}
                            stroke={isSelected ? '#0f172a' : 'transparent'}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                <span>
                  💡 <strong>ข้อสังเกตเชิงนโยบาย:</strong> อำเภอที่มีคะแนนสูงสุดสามารถยื่นขอรับรองพื้นที่ปลอดโรคระดับอำเภอได้ทันที ส่วนอำเภอช่วงคะแนน 60-79 ควรเน้นฉีดวัคซีนให้ถึง 80% และเพิ่มการส่งตรวจตัวอย่างหัวสัตว์
                </span>
              </div>
            </div>
          </div>

          {/* District Cards Grid Filterable */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  รายชื่อ 23 อำเภอ จำแนกตามสถานะเกณฑ์ประเมินใหม่ ({filteredDistricts.length} อำเภอ)
                </h4>
                <p className="text-xs text-slate-500">
                  คลิกที่การ์ดอำเภอเพื่อดูรายละเอียดและผลการประเมินเจาะลึก
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่ออำเภอ..."
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-36 sm:w-44"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="all">ทุกสถานะการประเมิน</option>
                  <option value="FREE_CERTIFIED">เฉพาะพื้นที่ปลอดโรค (ผ่านเกณฑ์)</option>
                  <option value="CONTROLLED_PROGRESS">เฉพาะพื้นที่ควบคุมโรคได้</option>
                  <option value="AT_RISK_FOCUS">เฉพาะพื้นที่เสี่ยง</option>
                </select>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDistricts.map((summary) => {
                const isSelected = selectedDistrict === summary.districtNameTh;
                const evalInfo = summary.evaluation;
                const tierBadge = getEvaluationTierBadge(evalInfo?.assessmentTier);

                return (
                  <div
                    key={summary.districtId}
                    onClick={() => {
                      if (onSelectDistrict) onSelectDistrict(summary.districtNameTh);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {summary.districtNameTh}
                          {evalInfo?.assessmentTier === 'FREE_CERTIFIED' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </h5>
                        <div className="text-[11px] text-slate-400">
                          {summary.districtNameEn}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tierBadge.bgClass}`}
                        >
                          {tierBadge.shortLabel}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          {evalInfo?.totalAssessmentScore || 0}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar of Total Score */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (evalInfo?.totalAssessmentScore || 0) >= 80
                            ? 'bg-emerald-500'
                            : (evalInfo?.totalAssessmentScore || 0) >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${evalInfo?.totalAssessmentScore || 0}%` }}
                      />
                    </div>

                    {/* 5 Dimensions Mini Bars */}
                    <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                      <div className="flex justify-between">
                        <span>1. โรคในคน (เต็ม 20):</span>
                        <span className="font-bold text-slate-800">
                          {evalInfo?.dim1Score} / 20
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. โรคในสัตว์/เฝ้าระวัง (เต็ม 25):</span>
                        <span className="font-bold text-slate-800">
                          {evalInfo?.dim2Score} / 25
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. ฉีดวัคซีนในสัตว์ (เต็ม 25):</span>
                        <span
                          className={`font-bold ${
                            summary.vaccineCoverageRate >= 80
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {evalInfo?.dim3Score} / 25 ({formatPercent(summary.vaccineCoverageRate)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. สำรวจ/ทะเบียน (เต็ม 15):</span>
                        <span className="font-bold text-slate-800">
                          {evalInfo?.dim4Score} / 15
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>5. ทำหมัน/ความยั่งยืน (เต็ม 15):</span>
                        <span className="font-bold text-slate-800">
                          {evalInfo?.dim5Score} / 15
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {summary.animalPositivesSelectedYear > 0
                          ? `⚠️ พบสัตว์ติดเชื้อ ${summary.animalPositivesSelectedYear} ตัว`
                          : '✅ สัตว์ไม่พบเชื้อปีนี้'}
                      </span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                        ดูโปรไฟล์ <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Self-Assessment Simulator for LAO / Districts */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Interactive LAO / District Self-Assessment Tool
              </span>
              <h3 className="text-lg font-bold font-heading text-slate-900 mt-1 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                เครื่องมือจำลองการประเมินตนเองของ อปท. / อำเภอ (ตามเกณฑ์ 5 ด้าน)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ทดลองปรับเปลี่ยนค่าตัวแปรผลการดำเนินงานในพื้นที่ของท่าน เพื่อดูคะแนนรวม สถานะที่จะได้รับ และข้อเสนอแนะในการปรับปรุง
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  ตัวแปรการดำเนินงานในพื้นที่ (Input Parameters)
                </h4>

                {/* Dim 1: Human */}
                <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>มิติที่ 1: สถานการณ์โรคในคน (น้ำหนัก 20 คะแนน)</span>
                    <span className="text-indigo-600 font-bold">{simDim1Score} / 20</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!simHumanDeath2Yrs}
                        onChange={(e) => setSimHumanDeath2Yrs(!e.target.checked)}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ไม่มีรายงานผู้เสียชีวิตจากโรคพิษสุนัขบ้าในพื้นที่ &ge; 2 ปี (15 คะแนน)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simPepAdequate}
                        onChange={(e) => setSimPepAdequate(e.target.checked)}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ผู้สัมผัสโรคได้รับวัคซีน PEP และเซรุ่ม RIG ครบชุด &ge; 80% (5 คะแนน)</span>
                    </label>
                  </div>
                </div>

                {/* Dim 2: Animal */}
                <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>มิติที่ 2: สถานการณ์โรคในสัตว์ & การเฝ้าระวัง (น้ำหนัก 25 คะแนน)</span>
                    <span className="text-indigo-600 font-bold">{simDim2Score} / 25</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!simAnimalPositives2Yrs}
                        onChange={(e) => setSimAnimalPositives2Yrs(!e.target.checked)}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ไม่พบสัตว์ยืนยันติดเชื้อผลบวกต่อเนื่อง &ge; 2 ปี (15 คะแนน)</span>
                    </label>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>จำนวนตัวอย่างหัวสัตว์สงสัยส่งตรวจแล็บต่อปี:</span>
                        <span className="font-bold text-slate-900">{simSampleSubmissions} ตัวอย่าง</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={simSampleSubmissions}
                        onChange={(e) => setSimSampleSubmissions(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0 ตัวอย่าง (2 คะแนน)</span>
                        <span>1-4 ตัวอย่าง (7 คะแนน)</span>
                        <span>&ge;5 ตัวอย่าง (10 คะแนน)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dim 3: Vaccine */}
                <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>มิติที่ 3: ความครอบคลุมการฉีดวัคซีนในสัตว์ (น้ำหนัก 25 คะแนน)</span>
                    <span className="text-indigo-600 font-bold">{simDim3Score} / 25</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>ร้อยละความครอบคลุมวัคซีน (สุนัข-แมว ทั้งมี/ไม่มีเจ้าของ):</span>
                      <span
                        className={`font-bold text-sm ${
                          simVaccineCoverage >= 80 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {simVaccineCoverage}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={simVaccineCoverage}
                      onChange={(e) => setSimVaccineCoverage(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>&lt;60% (5 คะแนน)</span>
                      <span>70-79% (16 คะแนน)</span>
                      <span>&ge;80% เกณฑ์ผ่าน (25 คะแนน)</span>
                    </div>
                  </div>
                </div>

                {/* Dim 4: Census */}
                <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>มิติที่ 4: การสำรวจและขึ้นทะเบียนใน Thai Rabies Net (15 คะแนน)</span>
                    <span className="text-indigo-600 font-bold">{simDim4Score} / 15</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>ความครอบคลุมการสำรวจประชากรสัตว์:</span>
                      <span className="font-bold text-slate-900">{simCensusCoverage}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={simCensusCoverage}
                      onChange={(e) => setSimCensusCoverage(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Dim 5: Population Control & Sustainability */}
                <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>มิติที่ 5: การควบคุมประชากรสัตว์และความยั่งยืน (15 คะแนน)</span>
                    <span className="text-indigo-600 font-bold">{simDim5Score} / 15</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>สัดส่วนการผ่าตัดทำหมันสุนัข/แมว:</span>
                      <span className="font-bold text-slate-900">{simSterilizationRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={simSterilizationRate}
                      onChange={(e) => setSimSterilizationRate(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={simLocalOrdinance}
                        onChange={(e) => setSimLocalOrdinance(e.target.checked)}
                        className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>มีเทศบัญญัติ/ข้อบัญญัติท้องถิ่นเรื่องการเลี้ยงสัตว์ และงบประมาณรองรับ (8 คะแนน)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Simulation Result Card (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-md space-y-4 sticky top-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      ผลการประเมินจำลอง (Simulation Result)
                    </div>
                    <div className="text-5xl font-black text-slate-900 my-2">
                      {simTotalScore}{' '}
                      <span className="text-base font-normal text-slate-400">/ 100</span>
                    </div>
                    <span
                      className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border ${simTierColor}`}
                    >
                      {simTierLabel}
                    </span>
                  </div>

                  {/* Mandatory Pass Check */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>เกณฑ์บังคับ (Mandatory Conditions):</span>
                      {simMandatoryMet ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> ครบทุกเงื่อนไข
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> ขาดเงื่อนไขจำเป็น
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li className="flex items-center gap-1.5">
                        {!simHumanDeath2Yrs ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>ไม่พบคนเสียชีวิต &ge;2 ปี</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        {!simAnimalPositives2Yrs ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>ไม่พบสัตว์ติดเชื้อ &ge;2 ปี</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        {simVaccineCoverage >= 80 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>ความครอบคลุมวัคซีนในสัตว์ &ge; 80% (ปัจจุบัน {simVaccineCoverage}%)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        {simCensusCoverage >= 80 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>สำรวจขึ้นทะเบียนสัตว์ &ge; 80% (ปัจจุบัน {simCensusCoverage}%)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Summary Feedback */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      simTierPass
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {simTierPass ? (
                      <div>
                        🎉 <strong>ยินดีด้วย!</strong> พื้นที่ของท่านมีคุณสมบัติผ่านเกณฑ์การประเมินพื้นที่ปลอดโรคพิษสุนัขบ้า สามารถยื่นเอกสารขอรับรองต่อคณะกรรมการระดับอำเภอและจังหวัดได้
                      </div>
                    ) : (
                      <div>
                        ⚠️ <strong>สิ่งที่ต้องดำเนินการเพิ่มเติม:</strong>{' '}
                        {simVaccineCoverage < 80 && 'เร่งรัดการปูพรมฉีดวัคซีนให้ถึง 80%, '}
                        {simSampleSubmissions < 5 && 'ส่งตัวอย่างหัวสัตว์สงสัยตรวจอย่างน้อย 5 ตัวอย่าง/ปี, '}
                        {simAnimalPositives2Yrs && 'ควบคุมการระบาดในสัตว์ให้ปลอดเชื้อต่อเนื่อง 2 ปี, '}
                        {!simLocalOrdinance && 'ผลักดันการออกข้อบัญญัติท้องถิ่น'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Guidelines & Criteria Breakdown */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Official Rabies Free Assessment Standard (2568 - 2569)
              </span>
              <h3 className="text-lg font-bold font-heading text-slate-900 mt-1">
                โครงสร้างและเกณฑ์การประเมินพื้นที่ปลอดโรคพิษสุนัขบ้า 5 มิติ (100 คะแนนเต็ม)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                อ้างอิง: คู่มือและเกณฑ์การสร้างและประเมินพื้นที่ปลอดโรคพิษสุนัขบ้า ฉบับปรับปรุงใหม่ กรมควบคุมโรค กรมปศุสัตว์ และกรมส่งเสริมการปกครองท้องถิ่น
              </p>
            </div>

            {/* 5 Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dim 1 */}
              <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    มิติที่ 1: สถานการณ์การเกิดโรคในคน
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                    20 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>ตัวชี้วัด 1.1 (15 คะแนน - เกณฑ์บังคับ):</strong> ไม่มีรายงานผู้ป่วย/ผู้เสียชีวิตจากโรคพิษสุนัขบ้าในพื้นที่อย่างน้อย 2 ปี (24 เดือน) ต่อเนื่อง<br />
                  • <strong>ตัวชี้วัด 1.2 (5 คะแนน):</strong> ร้อยละของผู้สัมผัสโรค (Category II/III) ได้รับการล้างแผล ฉีดวัคซีน PEP และเซรุ่ม RIG ครบถ้วนตามแนวทางเวชปฏิบัติ &ge; 80%
                </p>
              </div>

              {/* Dim 2 */}
              <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    มิติที่ 2: สถานการณ์การเกิดโรคในสัตว์ & เฝ้าระวัง
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                    25 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>ตัวชี้วัด 2.1 (15 คะแนน - เกณฑ์บังคับ):</strong> ไม่พบสัตว์ติดเชื้อยืนยันผลบวกทางห้องปฏิบัติการ (FAT) ต่อเนื่องอย่างน้อย 2 ปี (ถ้าปลอด 1 ปีได้ 8 คะแนน)<br />
                  • <strong>ตัวชี้วัด 2.2 (10 คะแนน):</strong> มีการเฝ้าระวังโรคทางห้องปฏิบัติการอย่างต่อเนื่อง ส่งตัวอย่างหัวสัตว์สงสัยหรือสัตว์ตายไม่ทราบสาเหตุตรวจ &ge; 5 ตัวอย่าง/อำเภอ/ปี
                </p>
              </div>

              {/* Dim 3 */}
              <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    มิติที่ 3: ความครอบคลุมการฉีดวัคซีนในสัตว์
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                    25 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>ตัวชี้วัด 3.1 (25 คะแนน - เกณฑ์บังคับ &ge;80%):</strong> ร้อยละของสุนัขและแมวทั้งหมด (มีเจ้าของ + จรจัด) ได้รับการฉีดวัคซีนป้องกันโรคพิษสุนัขบ้า &ge; 80% ในช่วงรณรงค์ (มี.ค.-มิ.ย.)<br />
                  • มีการบริหารจัดการระบบลูกโซ่ความเย็น (Cold Chain 2-8°C) และวัคซีนขึ้นทะเบียนถูกต้อง
                </p>
              </div>

              {/* Dim 4 */}
              <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                      4
                    </span>
                    มิติที่ 4: การสำรวจและขึ้นทะเบียนใน Thai Rabies Net
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs">
                    15 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>ตัวชี้วัด 4.1 (10 คะแนน - เกณฑ์บังคับ &ge;80%):</strong> ร้อยละการสำรวจประชากรสุนัขและแมวและบันทึกลงระบบ Thai Rabies Net &ge; 80% ของประชากรจริง<br />
                  • <strong>ตัวชี้วัด 4.2 (5 คะแนน):</strong> สัดส่วนการขึ้นทะเบียนสัตว์เลี้ยง การติดเครื่องหมายระบุตัวตน หรือปลอกคอแสดงสถานะการฉีดวัคซีน
                </p>
              </div>

              {/* Dim 5 */}
              <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                      5
                    </span>
                    มิติที่ 5: การควบคุมประชากรสัตว์และความยั่งยืน
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
                    15 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>ตัวชี้วัด 5.1 (7 คะแนน):</strong> การผ่าตัดทำหมันสุนัขและแมวเพื่อควบคุมประชากร โดยเฉพาะในกลุ่มจรจัดและพื้นที่เสี่ยง (วัด/ตลาด/โรงเรียน)<br />
                  • <strong>ตัวชี้วัด 5.2 (8 คะแนน):</strong> การจัดทำและบังคับใช้ข้อบัญญัติ/เทศบัญญัติการควบคุมการเลี้ยงและปล่อยสัตว์ และการจัดสรรงบประมาณของ อปท. รองรับอย่างต่อเนื่อง
                </p>
              </div>
            </div>

            {/* Certification Levels Legend */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <h4 className="font-bold text-emerald-900">เกณฑ์การตัดสินและระดับการรับรอง:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-emerald-950">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-700">1. พื้นที่ปลอดโรค (Certified Free)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    คะแนนรวม &ge; 80 คะแนน + ผ่านเกณฑ์บังคับ 4 ข้อ (ไม่พบเชื้อ 2 ปี, วัคซีน &ge;80%, สำรวจ &ge;80%)
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-700">2. พื้นที่ควบคุมโรคได้ (Controlled)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    คะแนนรวม 60 - 79 คะแนน + ไม่พบคนเสียชีวิต + สัตว์ไม่พบเชื้อปีนี้ + วัคซีน 70-79%
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-rose-200">
                  <div className="font-bold text-rose-700">3. พื้นที่เสี่ยง / ระบาด (At-Risk)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    คะแนน &lt; 60 คะแนน หรือยังพบสัตว์ติดเชื้อผลบวกในปีประเมิน หรือมีผู้เสียชีวิต
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Full Matrix Comparison Table */}
      {activeTab === 'table' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                ตารางเปรียบเทียบคะแนน 5 มิติ รายอำเภอ 23 อำเภอ นครศรีธรรมราช
              </h4>
              <p className="text-xs text-slate-500">
                ข้อมูลบูรณาการระหว่าง สสจ. ปศุสัตว์จังหวัด และ อปท. (ปี พ.ศ. {toBE(selectedYear)})
              </p>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> ดาวน์โหลดตาราง CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">อำเภอ</th>
                  <th className="py-2.5 px-2 text-center">สถานะประเมิน</th>
                  <th className="py-2.5 px-2 text-center">คะแนนรวม (100)</th>
                  <th className="py-2.5 px-2 text-center">เกณฑ์บังคับ</th>
                  <th className="py-2.5 px-2 text-center">มิติ 1 คน (20)</th>
                  <th className="py-2.5 px-2 text-center">มิติ 2 สัตว์ (25)</th>
                  <th className="py-2.5 px-2 text-center">มิติ 3 วัคซีน (25)</th>
                  <th className="py-2.5 px-2 text-center">มิติ 4 สำรวจ (15)</th>
                  <th className="py-2.5 px-2 text-center">มิติ 5 ยั่งยืน (15)</th>
                  <th className="py-2.5 px-2 text-center">วัคซีน %</th>
                  <th className="py-2.5 px-2 text-center">สัตว์ติดเชื้อปีนี้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...zoneSummaries]
                  .sort(
                    (a, b) =>
                      (b.evaluation?.totalAssessmentScore || 0) -
                      (a.evaluation?.totalAssessmentScore || 0)
                  )
                  .map((summary) => {
                    const ev = summary.evaluation;
                    const tier = getEvaluationTierBadge(ev?.assessmentTier);
                    return (
                      <tr
                        key={summary.districtId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {summary.districtNameTh}
                          <span className="text-[10px] text-slate-400 block">
                            {summary.districtNameEn}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.bgClass}`}
                          >
                            {tier.shortLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-900 text-sm">
                          {ev?.totalAssessmentScore}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {ev?.mandatoryRequirementsMet ? (
                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-0.5 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ผ่าน
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold flex items-center justify-center gap-0.5 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> ไม่ครบ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-700">
                          {ev?.dim1Score}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-700">
                          {ev?.dim2Score}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-800">
                          {ev?.dim3Score}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-700">
                          {ev?.dim4Score}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-700">
                          {ev?.dim5Score}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold">
                          <span
                            className={
                              summary.vaccineCoverageRate >= 80
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }
                          >
                            {summary.vaccineCoverageRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {summary.animalPositivesSelectedYear > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-700 font-bold">
                              {summary.animalPositivesSelectedYear} ตัว
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
