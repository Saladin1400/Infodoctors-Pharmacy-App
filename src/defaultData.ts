import { PatientProfile } from "./types";

export const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    nationalId: "29010151234567",
    fullName: "أحمد محمد علي",
    email: "ahmed.aly@mail.eg",
    phonePrimary: "01012345678",
    phoneBackup: "01287654321",
    dob: "1990-10-15",
    address: {
      country: "مصر",
      governorate: "القاهرة",
      city: "القاهرة الجديدة",
      district: "التجمع الخامس"
    },
    religion: "Muslim",
    gender: "Male",
    maritalStatus: "Married",
    sexualActivity: "Active",
    height: 180,
    weight: 92,
    bloodGroup: "A+",
    allergies: {
      drugAllergies: ["Aspirin", "Penicillin"],
      foodAllergies: ["Chocolate"]
    },
    lifestyle: {
      meals: { timing: "08:00 - 15:00 - 21:00", type: "متوازن", count: 3 },
      drinks: { tea: true, coffee: true, details: "شاي وقهوة مرتين يومياً" },
      smoking: { isSmoking: false },
      sleep: { timing: "23:00 - 07:00", hours: 8, quality: "Good" },
      alcohol: { level: "None" },
      substanceAbuse: [],
      profession: "مهندس برمجيات",
      physicalActivity: "Moderate"
    },
    medicalHistory: {
      surgeries: [{ procedure: "استئصال زائدة دودية", date: "2018-05-12", surgeonOrHospital: "مستشفى السلام" }],
      acuteIllnesses: [{ condition: "نزلة برد حادة", date: "2026-02-10", recovered: true }],
      chronicDiseases: [{ disease: "ارتفاع ضغط الدم (Hypertension)", status: "Stable", sinceYear: "2022" }]
    },
    currentMedications: [
      {
        activeIngredient: "Bisoprolol",
        brandName: "Concor 5mg",
        dosageForm: "Tablet",
        concentration: "5mg",
        frequency: { units: 1, type: "tablet", timeframe: "صباحاً يومياً" },
        instructions: "تناول القرص صباحاً بعد الإفطار مع كوب ماء"
      },
      {
        activeIngredient: "Sitagliptin / Metformin",
        brandName: "Janumet 50/1000mg",
        dosageForm: "Tablet",
        concentration: "50/1000mg",
        frequency: { units: 2, type: "tablet", timeframe: "مع الوجبات" },
        instructions: "قرص مع وجبة الإفطار وقرص مع العشاء"
      }
    ],
    labs: [
      { labName: "معامل المختبر", date: "2026-04-10", testType: "CBC", valueSummary: "الهيموجلوبين 14.2 - طبيعي" },
      { labName: "معامل البرج", date: "2026-03-15", testType: "Kidney", valueSummary: "وظائف الكلى والكراتينين طبيعية" }
    ],
    scans: [],
    dependentsCount: 1
  },
  {
    nationalId: "29505202712345",
    fullName: "سارة ممدوح إسماعيل",
    email: "sarah.m@mail.eg",
    phonePrimary: "01123456789",
    phoneBackup: "01098765432",
    dob: "1995-05-20",
    address: {
      country: "مصر",
      governorate: "الجيزة",
      city: "6 أكتوبر",
      district: "الحي المتميز"
    },
    religion: "Muslim",
    gender: "Female",
    maritalStatus: "Married",
    sexualActivity: "Active",
    height: 165,
    weight: 68,
    bloodGroup: "O+",
    pregnancyLactation: {
      isPregnant: true,
      weeks: 20,
      isLactating: false
    },
    allergies: {
      drugAllergies: ["Sulfa"],
      foodAllergies: ["Nuts"]
    },
    lifestyle: {
      meals: { timing: "وجبات صحية متعددة", type: "صحي للحمل", count: 4 },
      drinks: { tea: false, coffee: false, details: "عصائر طبيعية وماء" },
      smoking: { isSmoking: false },
      sleep: { timing: "22:00 - 07:00", hours: 9, quality: "Good" },
      alcohol: { level: "None" },
      substanceAbuse: [],
      profession: "معلمة مرحلة ابتدائية",
      physicalActivity: "Light"
    },
    medicalHistory: {
      surgeries: [],
      acuteIllnesses: [],
      chronicDiseases: [{ disease: "أنيميا ناتجة عن الحمل (Anemia)", status: "Stable", sinceYear: "2026" }]
    },
    currentMedications: [
      {
        activeIngredient: "Multivitamins & Folic Acid",
        brandName: "Elevit Pronatal",
        dosageForm: "Tablet",
        concentration: "Standard",
        frequency: { units: 1, type: "tablet", timeframe: "صباحاً" },
        instructions: "قرص واحد يومياً بعد تناول طعام الإفطار"
      },
      {
        activeIngredient: "Ferrous Fumarate",
        brandName: "Fertron 100mg",
        dosageForm: "Capsule",
        concentration: "100mg",
        frequency: { units: 1, type: "capsule", timeframe: "مساءً" },
        instructions: "كبسولة مساءً لعلاج الأنيميا وتقوية الحديد"
      }
    ],
    labs: [
      { labName: "معامل مؤمن", date: "2026-05-01", testType: "HbA1c", valueSummary: "السكر التراكمي 5.1% - ممتازة" }
    ],
    scans: [
      { scanType: "Ultrasound", targetOrgan: "Uterus / Fetus", date: "2026-04-20", findings: "نبض وقياسات الجنين طبيعية ومستقرة" }
    ],
    dependentsCount: 0
  }
];
