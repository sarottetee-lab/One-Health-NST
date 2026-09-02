import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  Filter,
  MapPin,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers,
  Download,
  Info,
  ExternalLink,
  RefreshCw,
  Building,
  Store,
  Navigation,
} from 'lucide-react';
import {
  StrayHabitatFoodSource,
  HabitatCategory,
  StrayRiskLevel,
  WasteManagementStatus,
} from '../../types';
import {
  getStrayHabitats,
  saveCustomStrayHabitat,
  deleteCustomStrayHabitat,
  getStrayHabitatsSummary,
  HABITAT_CATEGORY_CONFIGS,
  STRAY_RISK_CONFIGS,
  SEED_STRAY_HABITATS,
} from '../../data/strayHabitatsData';
import { NAKHON_DISTRICTS } from '../../data/nakhonDistricts';

interface StrayHabitatManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHabitatOnMap?: (habitat: StrayHabitatFoodSource) => void;
  initialNewCoords?: { lat: number; lng: number } | null;
}

export const StrayHabitatManagerModal: React.FC<StrayHabitatManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectHabitatOnMap,
  initialNewCoords,
}) => {
  const [habitats, setHabitats] = useState<StrayHabitatFoodSource[]>(() => getStrayHabitats());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(Boolean(initialNewCoords));
  const [editingHabitat, setEditingHabitat] = useState<StrayHabitatFoodSource | null>(null);

  // Form State
  const [formNameTh, setFormNameTh] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<HabitatCategory>('market');
  const [formDistrict, setFormDistrict] = useState('เมืองนครศรีธรรมราช');
  const [formSubDistrict, setFormSubDistrict] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formLat, setFormLat] = useState<string>(initialNewCoords ? initialNewCoords.lat.toFixed(6) : '8.4304');
  const [formLng, setFormLng] = useState<string>(initialNewCoords ? initialNewCoords.lng.toFixed(6) : '99.9631');
  const [formDogs, setFormDogs] = useState<string>('25');
  const [formCats, setFormCats] = useState<string>('15');
  const [formFoodSource, setFormFoodSource] = useState('เศษอาหารสด แผงค้าปลา/เนื้อสัตว์');
  const [formRisk, setFormRisk] = useState<StrayRiskLevel>('HIGH');
  const [formWasteStatus, setFormWasteStatus] = useState<WasteManagementStatus>('DAILY_COLLECTED');
  const [formVaccine, setFormVaccine] = useState<string>('65');
  const [formNeutered, setFormNeutered] = useState<string>('35');
  const [formAgency, setFormAgency] = useState('เทศบาลนครนครศรีธรรมราช');
  const [formNotes, setFormNotes] = useState('');
  const [formActionStatus, setFormActionStatus] = useState<'NEEDS_INTERVENTION' | 'MONITORED' | 'VACCINATED_CAMPAIGN' | 'RESOLVED'>('NEEDS_INTERVENTION');

  // React to initial coords
  React.useEffect(() => {
    if (initialNewCoords) {
      setFormLat(initialNewCoords.lat.toFixed(6));
      setFormLng(initialNewCoords.lng.toFixed(6));
      setShowAddForm(true);
    }
  }, [initialNewCoords]);

  const refreshList = () => {
    setHabitats(getStrayHabitats());
  };

  const summary = useMemo(() => getStrayHabitatsSummary(habitats), [habitats]);

  // Filtered List
  const filteredHabitats = useMemo(() => {
    return habitats.filter((h) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = h.nameTh.toLowerCase().includes(q) || h.nameEn.toLowerCase().includes(q);
        const matchesLoc = h.district.toLowerCase().includes(q) || h.subDistrict.toLowerCase().includes(q);
        const matchesFood = h.foodSourceType.toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesFood) return false;
      }
      if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
      if (selectedDistrict !== 'all' && h.district !== selectedDistrict) return false;
      if (selectedRisk !== 'all' && h.riskLevel !== selectedRisk) return false;
      return true;
    });
  }, [habitats, searchQuery, selectedCategory, selectedDistrict, selectedRisk]);

  const handleOpenEdit = (item: StrayHabitatFoodSource) => {
    setEditingHabitat(item);
    setFormNameTh(item.nameTh);
    setFormNameEn(item.nameEn);
    setFormCategory(item.category);
    setFormDistrict(item.district);
    setFormSubDistrict(item.subDistrict);
    setFormVillage(item.village || '');
    setFormLat(item.lat.toString());
    setFormLng(item.lng.toString());
    setFormDogs(item.estimatedDogs.toString());
    setFormCats(item.estimatedCats.toString());
    setFormFoodSource(item.foodSourceType);
    setFormRisk(item.riskLevel);
    setFormWasteStatus(item.wasteManagementStatus);
    setFormVaccine(item.vaccinationCoverage.toString());
    setFormNeutered(item.neuteredRate.toString());
    setFormAgency(item.responsibleAgency);
    setFormNotes(item.notes || '');
    setFormActionStatus(item.actionStatus);
    setShowAddForm(true);
  };

  const handleResetForm = () => {
    setEditingHabitat(null);
    setFormNameTh('');
    setFormNameEn('');
    setFormCategory('market');
    setFormDistrict('เมืองนครศรีธรรมราช');
    setFormSubDistrict('');
    setFormVillage('');
    setFormLat('8.4304');
    setFormLng('99.9631');
    setFormDogs('20');
    setFormCats('10');
    setFormFoodSource('เศษอาหารสด/เนื้อ/ปลา');
    setFormRisk('HIGH');
    setFormWasteStatus('DAILY_COLLECTED');
    setFormVaccine('60');
    setFormNeutered('30');
    setFormAgency('เทศบาลตำบล / อบต.');
    setFormNotes('');
    setFormActionStatus('NEEDS_INTERVENTION');
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameTh.trim()) {
      alert('กรุณาระบุชื่อสถานที่');
      return;
    }

    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('กรุณาระบุพิกัดละติจูดและลองจิจูดที่ถูกต้อง');
      return;
    }

    const newObj: StrayHabitatFoodSource = {
      id: editingHabitat ? editingHabitat.id : `HOTSPOT-CUSTOM-${Date.now()}`,
      nameTh: formNameTh.trim(),
      nameEn: formNameEn.trim() || formNameTh.trim(),
      category: formCategory,
      district: formDistrict,
      subDistrict: formSubDistrict.trim() || 'ในเมือง',
      village: formVillage.trim() || undefined,
      lat,
      lng,
      estimatedDogs: parseInt(formDogs, 10) || 0,
      estimatedCats: parseInt(formCats, 10) || 0,
      foodSourceType: formFoodSource.trim() || 'เศษอาหารและขยะอินทรีย์',
      riskLevel: formRisk,
      wasteManagementStatus: formWasteStatus,
      vaccinationCoverage: parseFloat(formVaccine) || 50,
      neuteredRate: parseFloat(formNeutered) || 30,
      lastSurveyDate: new Date().toISOString().split('T')[0],
      responsibleAgency: formAgency.trim() || 'เทศบาล/อบต. ในพื้นที่',
      actionStatus: formActionStatus,
      notes: formNotes.trim() || undefined,
      isCustomAdded: true,
    };

    saveCustomStrayHabitat(newObj);
    refreshList();
    handleResetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณต้องการลบข้อมูลจุดนี้ใช่หรือไม่?')) {
      deleteCustomStrayHabitat(id);
      refreshList();
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name (TH)',
      'Name (EN)',
      'Category',
      'District',
      'SubDistrict',
      'Latitude',
      'Longitude',
      'Est_Dogs',
      'Est_Cats',
      'FoodSource',
      'RiskLevel',
      'WasteStatus',
      'VaccineCoverage_%',
      'NeuteredRate_%',
      'ResponsibleAgency',
      'ActionStatus',
    ];
    const rows = habitats.map((h) => [
      h.id,
      `"${h.nameTh.replace(/"/g, '""')}"`,
      `"${h.nameEn.replace(/"/g, '""')}"`,
      h.category,
      h.district,
      h.subDistrict,
      h.lat,
      h.lng,
      h.estimatedDogs,
      h.estimatedCats,
      `"${h.foodSourceType.replace(/"/g, '""')}"`,
      h.riskLevel,
      h.wasteManagementStatus,
      h.vaccinationCoverage,
      h.neuteredRate,
      `"${h.responsibleAgency.replace(/"/g, '""')}"`,
      h.actionStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nakhon_stray_habitats_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl shadow-inner">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ฐานข้อมูลแหล่งอาหารและที่อยู่อาศัยสัตว์จรจัด (Stray Animal Food Sources & Habitats)
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  จังหวัดนครศรีธรรมราช
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                รวบรวมพิกัด ตลาดสด กองขยะ/ศูนย์กำจัดขยะมูลฝอย วัด สถานที่ราชการ และแพปลา เพื่อวางแผนควบคุมโรค One Health
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-600/60 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              ส่งออก CSV
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) handleResetForm();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-sm ${
                showAddForm
                  ? 'bg-rose-900/60 border-rose-600 text-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white'
              }`}
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มแหล่งอาหาร/สัตว์จรจัดใหม่'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base">
              📍
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">จุดสำรวจทั้งหมด</div>
              <div className="text-base font-bold text-white">{summary.totalLocations} แห่ง</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-base">
              🐕
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">สุนัขจรจัดสะสม</div>
              <div className="text-base font-bold text-orange-400">{summary.totalDogs.toLocaleString()} ตัว</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base">
              🐈
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">แมวจรจัดสะสม</div>
              <div className="text-base font-bold text-purple-400">{summary.totalCats.toLocaleString()} ตัว</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-base">
              🗑️
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">กองขยะเปิดโล่ง</div>
              <div className="text-base font-bold text-red-400">{summary.openDumpCount} จุดเสี่ยง</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base">
              ⚠️
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">ความเสี่ยงวิกฤต</div>
              <div className="text-base font-bold text-rose-400">{summary.criticalCount} จุด</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
              💉
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">เฉลี่ยวัคซีนจุดนี้</div>
              <div className="text-base font-bold text-emerald-400">{summary.avgVaccine.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Content Body: Add Form vs Table List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-indigo-500/40 shadow-xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {editingHabitat ? 'แก้ไขข้อมูลแหล่งอาหาร/สัตว์จรจัด' : 'ลงทะเบียนแหล่งอาหาร & ที่อยู่อาศัยสัตว์จรจัดแห่งใหม่'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ชื่อสถานที่ (ภาษาไทย) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ตลาดสดเทศบาลคูขวาง / บ่อขยะนาเคียน"
                    value={formNameTh}
                    onChange={(e) => setFormNameTh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ชื่อสถานที่ (ภาษาอังกฤษ)</label>
                  <input
                    type="text"
                    placeholder="e.g. Khu Khwang Market"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ประเภทแหล่งอาหาร/ที่อยู่อาศัย *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as HabitatCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(HABITAT_CATEGORY_CONFIGS).map(([cat, cfg]) => (
                      <option key={cat} value={cat}>
                        {cfg.icon} {cfg.labelTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">อำเภอ *</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {NAKHON_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.nameTh}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ตำบล *</label>
                  <input
                    type="text"
                    placeholder="เช่น ในเมือง, นาเคียน, โพธิ์เสด็จ"
                    value={formSubDistrict}
                    onChange={(e) => setFormSubDistrict(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">หมู่บ้าน / ชุมชน</label>
                  <input
                    type="text"
                    placeholder="เช่น ชุมชนหน้าพระบรมธาตุ / หมู่ 2"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">พิกัด Latitude (ละติจูด) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">พิกัด Longitude (ลองจิจูด) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ระดับความเสี่ยงการแพร่เชื้อ *</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as StrayRiskLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">🔴 วิกฤต (CRITICAL - พบเชื้อ/ขยะเปิด)</option>
                    <option value="HIGH">🟠 สูง (HIGH - ชุมชนหนาแน่น)</option>
                    <option value="MEDIUM">🟡 ปานกลาง (MEDIUM - มีการดูแลปานกลาง)</option>
                    <option value="LOW">🟢 ต่ำ (LOW - ควบคุมวัคซีนครบ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">จำนวนสุนัขจรจัดโดยประมาณ (ตัว)</label>
                  <input
                    type="number"
                    min="0"
                    value={formDogs}
                    onChange={(e) => setFormDogs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">จำนวนแมวจรจัดโดยประมาณ (ตัว)</label>
                  <input
                    type="number"
                    min="0"
                    value={formCats}
                    onChange={(e) => setFormCats(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">สถานะการจัดการขยะ *</label>
                  <select
                    value={formWasteStatus}
                    onChange={(e) => setFormWasteStatus(e.target.value as WasteManagementStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OPEN_DUMP">⚠️ กองขยะเปิดโล่ง / บ่อฝังกลบ (สัตว์เข้าถึงได้)</option>
                    <option value="CONTAINERIZED">📦 มีถังขยะปิดมิดชิด</option>
                    <option value="DAILY_COLLECTED">🚛 เก็บขนทุกวัน สม่ำเสมอ</option>
                    <option value="IRREGULAR">⏳ จัดเก็บไม่สม่ำเสมอ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ความครอบคลุมวัคซีนในจุดนี้ (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formVaccine}
                    onChange={(e) => setFormVaccine(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">อัตราการทำหมัน (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formNeutered}
                    onChange={(e) => setFormNeutered(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">หน่วยงานรับผิดชอบในพื้นที่</label>
                  <input
                    type="text"
                    placeholder="เช่น เทศบาลนครนครศรีธรรมราช / ปศุสัตว์อำเภอ"
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-slate-300 font-medium mb-1">แหล่งอาหารหลักของสัตว์จรจัดในจุดนี้</label>
                  <input
                    type="text"
                    placeholder="เช่น เศษปลาสดจากแพปลา, กองขยะฝังกลบ, ข้าวก้นบาตรพระ, เศษอาหารโรงอาหารนักศึกษา"
                    value={formFoodSource}
                    onChange={(e) => setFormFoodSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-slate-300 font-medium mb-1">หมายเหตุ / มาตรการจัดการที่จำเป็น</label>
                  <textarea
                    rows={2}
                    placeholder="บันทึกพฤติกรรมฝูงสัตว์ การให้อาหาร หรือข้อเสนอแนะเชิง One Health..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingHabitat ? 'บันทึกการแก้ไข' : 'บันทึกเข้าระบบ GIS'}
                </button>
              </div>
            </form>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อตลาด, บ่อขยะ, วัด, สถานที่ราชการ หรือตำบล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">📂 ทุกประเภทแหล่งอาหาร/ที่อยู่</option>
                {Object.entries(HABITAT_CATEGORY_CONFIGS).map(([cat, cfg]) => (
                  <option key={cat} value={cat}>
                    {cfg.icon} {cfg.labelTh}
                  </option>
                ))}
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">📍 ทุกอำเภอ (23 อำเภอ)</option>
                {NAKHON_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.nameTh}>
                    {d.nameTh}
                  </option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">🛡️ ทุกระดับความเสี่ยง</option>
                <option value="CRITICAL">🔴 วิกฤต (Critical)</option>
                <option value="HIGH">🟠 สูง (High)</option>
                <option value="MEDIUM">🟡 ปานกลาง (Medium)</option>
                <option value="LOW">🟢 ต่ำ (Low)</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDistrict('all');
                  setSelectedRisk('all');
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="รีเซ็ตตัวกรอง"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table of Habitats */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-lg">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-3 font-semibold">สถานที่ / ชนิด</th>
                    <th className="px-3.5 py-3 font-semibold">ที่ตั้ง (อ./ต.)</th>
                    <th className="px-3.5 py-3 font-semibold text-center">สุนัข/แมว</th>
                    <th className="px-3.5 py-3 font-semibold">แหล่งอาหารหลัก & สถานะขยะ</th>
                    <th className="px-3.5 py-3 font-semibold text-center">ความเสี่ยง</th>
                    <th className="px-3.5 py-3 font-semibold text-center">วัคซีน/ทำหมัน</th>
                    <th className="px-3.5 py-3 font-semibold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                  {filteredHabitats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredHabitats.map((item) => {
                      const catCfg = HABITAT_CATEGORY_CONFIGS[item.category] || HABITAT_CATEGORY_CONFIGS.market;
                      const riskCfg = STRAY_RISK_CONFIGS[item.riskLevel] || STRAY_RISK_CONFIGS.MEDIUM;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/60 transition-colors group">
                          <td className="px-3.5 py-3">
                            <div className="flex items-start gap-2.5">
                              <span className="text-xl shrink-0 mt-0.5">{catCfg.icon}</span>
                              <div>
                                <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                  {item.nameTh}
                                </div>
                                <div className="text-[11px] text-slate-400">{item.nameEn}</div>
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.bgBadge}`}>
                                    {catCfg.labelTh}
                                  </span>
                                  {item.isCustomAdded && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      ผู้ใช้เพิ่มเอง
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <div className="font-medium text-slate-200">อ.{item.district}</div>
                            <div className="text-[11px] text-slate-400">ต.{item.subDistrict}</div>
                            {item.village && <div className="text-[10px] text-slate-500">{item.village}</div>}
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                            </div>
                          </td>

                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-bold text-amber-400">🐕 {item.estimatedDogs} ตัว</span>
                              <span className="text-[11px] text-purple-300">🐈 {item.estimatedCats} ตัว</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                รวม {(item.estimatedDogs + item.estimatedCats)} ตัว
                              </span>
                            </div>
                          </td>

                          <td className="px-3.5 py-3 max-w-xs">
                            <div className="text-slate-200 line-clamp-2">{item.foodSourceType}</div>
                            <div className="mt-1 flex items-center gap-1 text-[11px]">
                              {item.wasteManagementStatus === 'OPEN_DUMP' && (
                                <span className="text-rose-400 font-medium">⚠️ กองขยะเปิดโล่ง</span>
                              )}
                              {item.wasteManagementStatus === 'CONTAINERIZED' && (
                                <span className="text-emerald-400">📦 ถังขยะปิดมิดชิด</span>
                              )}
                              {item.wasteManagementStatus === 'DAILY_COLLECTED' && (
                                <span className="text-blue-400">🚛 จัดเก็บทุกวัน</span>
                              )}
                              {item.wasteManagementStatus === 'IRREGULAR' && (
                                <span className="text-amber-400">⏳ จัดเก็บไม่สม่ำเสมอ</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              🏛️ {item.responsibleAgency}
                            </div>
                          </td>

                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${riskCfg.bgClass}`}>
                              {riskCfg.labelTh}
                            </span>
                          </td>

                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <div className="text-emerald-400 font-semibold">💉 {item.vaccinationCoverage}%</div>
                            <div className="text-[11px] text-indigo-300">✂️ {item.neuteredRate}%</div>
                          </td>

                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {onSelectHabitatOnMap && (
                                <button
                                  onClick={() => {
                                    onSelectHabitatOnMap(item);
                                    onClose();
                                  }}
                                  className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white shadow transition-colors"
                                  title="ซูมดูจุดนี้บนแผนที่"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="แก้ไขข้อมูล"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {item.isCustomAdded && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors"
                                  title="ลบข้อมูลจุดนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>เชื่อมต่อฐานข้อมูลสารสนเทศภูมิศาสตร์ GIS จังหวัดนครศรีธรรมราชสมบูรณ์</span>
          </div>
          <div>
            แสดงผล {filteredHabitats.length} จาก {habitats.length} แหล่งอาหาร/ที่อยู่อาศัยสัตว์จรจัด
          </div>
        </div>
      </div>
    </div>
  );
};
