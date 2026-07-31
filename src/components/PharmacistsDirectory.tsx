import React, { useState, useEffect } from "react";
import { 
  UserCheck, Search, Filter, Star, Award, ShieldCheck, MapPin, 
  Stethoscope, ChevronRight, Sparkles, MessageSquare, CheckCircle2, Eye, Calendar
} from "lucide-react";
import { PharmacistProfile, ApprovedSpecialtiesList, ApprovedSpecialty } from "../types";
import { getDegreeLabelArabic, getDefaultCertificates } from "./PharmacistProfileModal";

interface PharmacistsDirectoryProps {
  pharmacistsList?: PharmacistProfile[];
  onSelectPharmacist: (pharmacist: PharmacistProfile) => void;
  onBookConsultation?: (pharmacist: PharmacistProfile) => void;
  compactMode?: boolean;
}

export const PharmacistsDirectory: React.FC<PharmacistsDirectoryProps> = ({
  pharmacistsList,
  onSelectPharmacist,
  onBookConsultation,
  compactMode = false
}) => {
  const [pharmacists, setPharmacists] = useState<PharmacistProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');

  // Fetch Pharmacists from API if not provided in props
  useEffect(() => {
    if (!pharmacistsList || pharmacistsList.length === 0) {
      fetchPharmacists();
    }
  }, [pharmacistsList?.length]);

  const fetchPharmacists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/pharmacists");
      if (res.ok) {
        const data = await res.json();
        setPharmacists(data || []);
      }
    } catch (e) {
      console.warn("Failed to load pharmacists list:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const activePharmacistsList = (pharmacistsList && pharmacistsList.length > 0) ? pharmacistsList : pharmacists;

  // Filter logic
  const filteredPharmacists = activePharmacistsList.filter(pharm => {
    // Search match
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = pharm.fullName?.toLowerCase().includes(term);
      const matchLic = pharm.licenseNumber?.toLowerCase().includes(term);
      const matchSpec = pharm.specialty?.toLowerCase().includes(term);
      if (!matchName && !matchLic && !matchSpec) return false;
    }

    // Specialty filter
    if (selectedSpecialty !== 'ALL' && pharm.specialty !== selectedSpecialty) {
      return false;
    }

    // Degree filter
    if (selectedDegree !== 'ALL' && pharm.degree?.toLowerCase() !== selectedDegree.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4 font-sans text-right" style={{ direction: "rtl" }}>
      
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/60 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <span>دليل الصيدلانيين الإكلينيكيين المعتمدين</span>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pharmacists.length} طبيب صيدلي
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              تصفح ملفات الصيدلانيين، افحص التراخيص والشهادات وتقييمات المرضى
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      {!compactMode && (
        <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الدكتور، رقم الترخيص النقابي، أو التخصص..."
                className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
            </div>

            {/* Specialty filter dropdown */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">كافة التخصصات الطبية 🩺</option>
              {ApprovedSpecialtiesList.map(s => (
                <option key={s.key} value={s.key}>{s.ar}</option>
              ))}
            </select>

            {/* Degree filter dropdown */}
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">جميع الدرجات العلمية 🎓</option>
              <option value="prime consultant">استشاري أول (Prime Consultant)</option>
              <option value="consultant">استشاري (Consultant)</option>
              <option value="Specialist">أخصائي (Specialist)</option>
              <option value="Senior">صيدلي أول (Senior)</option>
              <option value="junior">صيدلي مبتدئ (Junior)</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid of Pharmacist Profile Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-400 text-xs animate-pulse">
          جاري تحميل دليل الصيدلانيين الإكلينيكيين...
        </div>
      ) : filteredPharmacists.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-bold">لا يوجد صيدلي يطابق معايير البحث الحالية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPharmacists.map((pharm) => {
            const specAr = ApprovedSpecialtiesList.find(s => s.key === pharm.specialty)?.ar || pharm.specialty;
            const certs = pharm.certificates && pharm.certificates.length > 0
              ? pharm.certificates
              : getDefaultCertificates(pharm.specialty, pharm.degree);
            const rating = pharm.rating || 4.9;
            const revCount = pharm.reviewCount || (pharm.reviews?.length || 18);

            return (
              <div
                key={pharm.licenseNumber}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all p-4 space-y-3 flex flex-col justify-between"
              >
                {/* Header Info */}
                <div className="flex items-start space-x-3 space-x-reverse">
                  {/* Photo with status indicator */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                      {pharm.photoUrl ? (
                        <img
                          src={pharm.photoUrl}
                          alt={pharm.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-600 to-indigo-700 flex items-center justify-center text-lg font-black text-white">
                          {pharm.fullName?.split(" ")[1]?.[0] || pharm.fullName?.[0] || "ص"}
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      pharm.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} title={pharm.status === 'online' ? 'متاح الآن' : 'غير متصل'} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {pharm.fullName}
                      </h4>
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{rating.toFixed(1)} ({revCount})</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-teal-700 font-bold">
                      {getDegreeLabelArabic(pharm.degree)}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-slate-500">
                      <span>التخصص: <strong className="text-slate-800">{specAr}</strong></span>
                      <span>الترخيص: <strong className="font-mono text-slate-700">{pharm.licenseNumber}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Certificates Badge Row */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-[10.5px] text-slate-700 space-y-1">
                  <span className="text-[9.5px] text-slate-400 font-bold block">الاعتمادات المهنية البارزة:</span>
                  <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate font-bold">{certs[0]}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onSelectPharmacist(pharm)}
                    className="flex-1 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 font-extrabold text-xs py-2 rounded-xl transition-all border border-slate-200/80 hover:border-teal-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الملف والتقييمات 📜</span>
                  </button>

                  {onBookConsultation && (
                    <button
                      onClick={() => onBookConsultation(pharm)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>حجز 📅</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default PharmacistsDirectory;
