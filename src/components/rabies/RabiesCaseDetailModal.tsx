import React from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  MapPin,
  Calendar,
  Building2,
  Activity,
  FileText,
  Clock,
  Check,
  ExternalLink,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';
import { RabiesRow } from '../../types';
import { formatFullThaiDate } from '../../utils/thaiYear';

interface RabiesCaseDetailModalProps {
  caseData: RabiesRow | null;
  onClose: () => void;
}

export const RabiesCaseDetailModal: React.FC<RabiesCaseDetailModalProps> = ({
  caseData,
  onClose,
}) => {
  if (!caseData) return null;

  const isPositive = caseData.Result === 'Positive';
  const isNegative = caseData.Result === 'Negative';
  const hasHumanExposure =
    (caseData.Human_Bitten_Count && caseData.Human_Bitten_Count > 0) ||
    (caseData.Human_Saliva_Count && caseData.Human_Saliva_Count > 0) ||
    caseData.Human_Exposure_Status === 'กัดคน' ||
    caseData.Human_Exposure_Status === 'สัมผัสน้ำลาย';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between text-white ${
            isPositive
              ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-rose-800'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isPositive
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
              }`}
            >
              {isPositive ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-200">
                  {caseData.Sample_No || caseData.Registration_ID}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isPositive
                      ? 'bg-rose-600 text-white'
                      : isNegative
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {caseData.Diagnosis_Result || caseData.Result}
                </span>
              </div>
              <h2 className="text-base font-bold font-heading text-white mt-0.5">
                รายงานการสอบสวนโรคสัตว์: {caseData.Animal_Species} {caseData.Animal_Name ? `("${caseData.Animal_Name}")` : ''} ({caseData.Breed})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Critical Human Exposure Alert if bitten/saliva */}
          {hasHumanExposure && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-rose-800 flex items-center gap-2">
                  <span>แจ้งเตือน One Health: มีประวัติสัมผัสโรค / สัตว์กัดคน</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-2xs font-bold">
                    เสี่ยงสูงระดับ 3
                  </span>
                </div>
                <div className="text-xs text-rose-700">
                  มีผู้ถูกกัด {caseData.Human_Bitten_Count || 0} ราย, ผู้สัมผัสน้ำลาย {caseData.Human_Saliva_Count || 0} ราย
                  — <strong>จำเป็นต้องติดตามเข้ารับวัคซีนป้องกันโรคพิษสุนัขบ้า (PEP) และเซรุ่ม (RIG) ทันทีครบทุกราย</strong>
                </div>
              </div>
            </div>
          )}

          {/* Grid 1: ข้อมูลสัตว์ & ประวัติวัคซีน */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Stethoscope className="w-4 h-4 text-rose-600" />
              ข้อมูลสัตว์และประวัติสุขภาพ (Animal Profile & Vaccination)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">ชนิดสัตว์ / สายพันธุ์</span>
                <span className="font-bold text-slate-800">{caseData.Animal_Species} ({caseData.Breed})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ชื่อสัตว์ / เพศ / อายุ</span>
                <span className="font-medium text-slate-800">
                  {caseData.Animal_Name || '-'} / {caseData.Sex || 'ไม่ระบุ'} / {caseData.Age || 'ไม่ระบุ'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ลักษณะการเลี้ยงดู</span>
                <span className="font-medium text-slate-800">{caseData.Owner_Type || caseData.Care_Type || 'ไม่ระบุ'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ประวัติการฉีดวัคซีน</span>
                <span className="font-semibold text-rose-700">{caseData.Vaccine_History || 'ไม่เคยฉีดวัคซีน'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">วันที่เริ่มแสดงอาการ</span>
                <span className="font-medium text-slate-800">{formatFullThaiDate(caseData.Sick_Date || caseData.Submission_Date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">วันที่ตาย / สาเหตุ</span>
                <span className="font-medium text-slate-800">
                  {formatFullThaiDate(caseData.Death_Date || caseData.Submission_Date)} ({caseData.Death_Cause || 'ตายเอง'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">เลขที่ใบเสร็จ / บันทึกรับ</span>
                <span className="font-mono text-slate-800">{caseData.Receipt_No || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">วันที่ตรวจทางแล็บ</span>
                <span className="font-medium text-slate-800">{formatFullThaiDate(caseData.Diagnosis_Date || caseData.Submission_Date)}</span>
              </div>
            </div>
          </div>

          {/* Grid 2: อาการทางคลินิก (Clinical Signs) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600" />
              อาการทางคลินิกที่ตรวจพบ (Clinical Symptoms & Behavioral Signs)
            </h3>
            {caseData.Symptoms && caseData.Symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {caseData.Symptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-amber-600" />
                    {sym}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-xs italic">ไม่มีบันทึกอาการทางคลินิกเฉพาะ</div>
            )}
          </div>

          {/* Grid 3: สถานที่เกิดเหตุและพิกัดแผนที่ */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              สถานที่เกิดเหตุและพิกัดภูมิศาสตร์ (Location & Coordinates)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">ตำบล / อำเภอ / จังหวัด</span>
                <span className="font-bold text-slate-900">
                  ต.{caseData.Sub_District} อ.{caseData.District} จ.{caseData.Province}
                </span>
                {caseData.House_No && (
                  <span className="text-slate-500 block text-[11px]">
                    บ้านเลขที่ {caseData.House_No} หมู่ที่ {caseData.Moo || '-'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">พิกัดละติจูด, ลองจิจูด (GPS)</span>
                <span className="font-mono font-semibold text-blue-700">
                  {caseData.Lat.toFixed(6)}, {caseData.Lng.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">เจ้าของสัตว์ / ผู้ส่งตรวจ</span>
                <span className="font-medium text-slate-800">
                  {caseData.Owner_Name || 'ไม่ระบุ'} {caseData.Owner_Phone ? `(${caseData.Owner_Phone})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Grid 4: ข้อมูลห้องปฏิบัติการ & ผลการวินิจฉัย */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              ข้อมูลการตรวจวินิจฉัยทางห้องปฏิบัติการ (Laboratory Diagnostics)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">วิธีตรวจวิเคราะห์</span>
                <span className="font-semibold text-slate-900">{caseData.Test_Method}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ผลการตรวจวินิจฉัย</span>
                <span
                  className={`font-bold ${
                    isPositive ? 'text-rose-600' : isNegative ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {caseData.Diagnosis_Result || caseData.Result}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">หน่วยงานตรวจวินิจฉัย</span>
                <span className="font-medium text-slate-800">{caseData.Lab_Center || 'ศวพ. ภาคใต้ (กรมปศุสัตว์)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ผู้ตรวจ / ผู้รับรองผล</span>
                <span className="font-medium text-slate-800">{caseData.Examiner_Name || caseData.Approver_Name || 'เจ้าหน้าที่ห้องปฏิบัติการ'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            แหล่งข้อมูล: ระบบฐานข้อมูลโรคพิษสุนัขบ้าแห่งชาติ Thai Rabies Net
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
