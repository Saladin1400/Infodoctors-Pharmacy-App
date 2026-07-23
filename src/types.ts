/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Basic Types
export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type SexualActivity = 'Active' | 'Inactive' | 'Sometimes';
export type SmokingLevel = 'Light' | 'Medium' | 'Heavy' | 'Chain-smoker' | 'None';
export type AlcoholLevel = 'None' | 'Occasional' | 'Weekly' | 'Daily' | 'Heavy Daily';
export type PhysicalActivity = 'Sedentary' | 'Light' | 'Moderate' | 'Heavy' | 'Athlete';

export interface AllergyProfile {
  drugAllergies: string[]; // ['Aspirin', 'Penicillin', 'Sulfa', 'Others']
  foodAllergies: string[]; // ['Chocolate', 'Strawberry', 'Banana', 'Gluten', 'Nuts', 'Others']
  otherAllergies?: string;
}

export interface LifestyleHabits {
  meals: {
    timing: string;
    type: string;
    count: number;
  };
  drinks: {
    tea: boolean;
    coffee: boolean;
    details: string;
  };
  smoking: {
    isSmoking: boolean;
    type?: 'Cigarettes' | 'Vape' | 'Shisha' | 'None';
    level?: SmokingLevel;
  };
  sleep: {
    timing: string;
    hours: number;
    quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  };
  alcohol: {
    level: AlcoholLevel;
  };
  substanceAbuse: string[]; // specific types for DDI checking (anti-abuse checking)
  profession: string;
  physicalActivity: PhysicalActivity;
}

export interface PastSurgery {
  procedure: string; // Fracture, Appendix, Gallbladder, Tonsils, LASIK, Female Obstetric history with dates
  date: string;
  surgeonOrHospital?: string;
}

export interface MedicalHistory {
  surgeries: PastSurgery[];
  acuteIllnesses: { condition: string; date: string; recovered: boolean }[];
  chronicDiseases: {
    disease: string; // Diabetes Type 1, Diabetes Type 2, Hypertension, Rheumatism, Asthma, etc.
    status: 'Stable' | 'Uncontrolled' | 'Newly Diagnosed';
    sinceYear?: string;
  }[];
}

export interface CurrentMedication {
  activeIngredient: string;
  brandName: string;
  dosageForm: string; // Tablet, Capsule, Suppository, Syrup, Inhaler, Injection
  concentration: string; // e.g. 500mg, 5ml, 10mg
  frequency: {
    units: number; // e.g. 1, 2
    type: 'tablet' | 'capsule' | 'suppository' | 'spoon' | 'puff' | 'injection';
    timeframe: string; // hours, daily, weekly, custom
  };
  instructions?: string; // e.g. before food, after food
}

export interface LabResult {
  labName: string;
  date: string;
  testType: 'CBC' | 'HbA1c' | 'Urine' | 'Liver' | 'Kidney' | 'Other';
  valueSummary?: string;
  imageSlotUrl?: string;
}

export interface ScanResult {
  scanType: 'X-Ray' | 'Ultrasound' | 'CT' | 'Sonar' | 'MRI' | 'Other';
  targetOrgan: string;
  date: string;
  findings?: string;
  imageSlotUrl?: string;
}

// Complete Patient Profile (السجل الصحي)
export interface PatientProfile {
  nationalId: string; // Unique National ID or Passport Number
  fullName: string;
  email: string;
  phonePrimary: string;
  phoneBackup?: string;
  dob: string; // YYYY-MM-DD for dynamic Age formula
  address: {
    country: string;
    governorate: string; // Modern Egyptian Governorates (e.g., Cairo, Giza, Alexandria)
    city: string;
    district: string;
  };
  religion: 'Muslim' | 'Christian' | 'Jewish' | 'Hindu' | 'Buddhist' | 'Other';
  
  // Health Metrics
  gender: Gender;
  maritalStatus: MaritalStatus;
  sexualActivity: SexualActivity;
  pregnancyLactation?: {
    isPregnant: boolean;
    weeks?: number;
    isLactating: boolean;
  };
  height: number; // in cm
  weight: number; // in kg
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  
  allergies: AllergyProfile;
  lifestyle: LifestyleHabits;
  vision?: {
    wearsGlasses: boolean;
    type?: 'Hyperopia' | 'Myopia' | 'Astigmatism' | 'Reading' | 'None';
    hasLasik: boolean;
  };
  medicalHistory: MedicalHistory;
  currentMedications: CurrentMedication[];
  labs: LabResult[];
  scans: ScanResult[];
  dependentsCount?: number;
}

// Specialty List
export type ApprovedSpecialty =
  | 'OB-GYN'
  | 'Pediatrics'
  | 'GI'
  | 'Cardiovascular'
  | 'Diabetes & Endocrine'
  | 'Nephrology'
  | 'Urology'
  | 'Chest & Allergy'
  | 'ENT'
  | 'Ophthalmology'
  | 'General Surgery'
  | 'Orthopedics'
  | 'Neurology'
  | 'Psychiatry'
  | 'Hematology & Immunology'
  | 'Oncology'
  | 'Dermatology & Cosmetics'
  | 'Nutrition & Obesity'
  | 'Sexual Health';

export const ApprovedSpecialtiesList: { key: ApprovedSpecialty; ar: string }[] = [
  { key: 'OB-GYN', ar: 'نساء وتوليد' },
  { key: 'Pediatrics', ar: 'أطفال' },
  { key: 'GI', ar: 'جهاز هضمي' },
  { key: 'Cardiovascular', ar: 'قلب وأوعية دموية' },
  { key: 'Diabetes & Endocrine', ar: 'سكر وغدد صماء' },
  { key: 'Nephrology', ar: 'كلى' },
  { key: 'Urology', ar: 'مسالك بولية' },
  { key: 'Chest & Allergy', ar: 'صدر وحساسية' },
  { key: 'ENT', ar: 'أنف وأذن وحنجرة' },
  { key: 'Ophthalmology', ar: 'عيون' },
  { key: 'General Surgery', ar: 'جراحة عامة' },
  { key: 'Orthopedics', ar: 'عظام' },
  { key: 'Neurology', ar: 'مخ وأعصاب' },
  { key: 'Psychiatry', ar: 'نفسية وعصبية' },
  { key: 'Hematology & Immunology', ar: 'دم ومناعة' },
  { key: 'Oncology', ar: 'أورام' },
  { key: 'Dermatology & Cosmetics', ar: 'جلدية وتجميل' },
  { key: 'Nutrition & Obesity', ar: 'تغذية وسمنة ونحافة' },
  { key: 'Sexual Health', ar: 'صحة جنسية' },
];

// Consultation Model (طلب استشارة)
export interface OtcConsultation {
  id: string;
  patientId: string;
  patientName: string;
  specialty: ApprovedSpecialty;
  complaintSummary: string;
  appointmentTime: string; // 20-min slots
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number; // EGP
  status: 'In-Waiting' | 'Ongoing' | 'Completed';
  reportId?: string;
  googleMeetUrl?: string;
  createdAt: string;
}

// Request Revision Model (طلب مراجعة وصفة طبية)
export interface PrescriptionRevision {
  id: string;
  patientId: string;
  patientName: string;
  specialty: ApprovedSpecialty;
  prescriptionImageUrl: string; // mock image slot base64 or placeholder
  appointmentTime: string;
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number; // EGP
  status: 'In-Waiting' | 'Ongoing' | 'Completed';
  reportId?: string;
  googleMeetUrl?: string;
  createdAt: string;
}

// Medication management
export interface MedicationManagementPlan {
  id: string;
  patientId: string;
  patientName: string;
  appointmentTime: string;
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number; // EGP
  status: 'In-Waiting' | 'Completed';
  timetable?: TimetableItem[];
  googleMeetUrl?: string;
  createdAt: string;
}

export interface TimetableItem {
  id: string;
  activeIngredient: string;
  brandName: string;
  dosageForm: string;
  dose: string;
  timeOfDay: string; // e.g. "08:00", "20:00"
  foodRelation: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | 'No Special Timing';
  specialInstructions: string;
  notificationTriggered: boolean;
}

// Clinical Report fields
export interface ClinicalReport {
  id: string;
  serviceId: string; // reference to OTC consultation or Prescription Revision list
  serviceType: 'OTC_CONSULTATION' | 'PRESCRIPTION_REVISION' | 'MED_MANAGEMENT';
  patientId: string;
  createdAt: string;
  pharmacistName: string;
  edaComplianceVerified: boolean; // EDA (Egyptian Drug Authority) compliance affirmation
  
  // Service A specific fields:
  otcFields?: {
    chiefComplaint: string;
    behavioralRecommendations: string;
    therapeuticRecommendations: {
      type: 'OTC_DRUGS' | 'REFERRAL' | 'BOTH';
      otcMedications: Array<{
        activeIngredient: string;
        brandName: string;
        dosageForm: string;
        dose: string;
        timing: string;
        duration: string;
      }>;
      referralSpecialty?: ApprovedSpecialty;
      referralDetails?: string;
    };
  };

  // Service B specific fields:
  revisionFields?: {
    diagnosis: string;
    treatingPhysician: string;
    treatingSpecialty: string;
    drugDiagnosisMatch: string; // Yes / No / Borderline and comments
    dosageVerification: string; // Fits profile, age, height, weight
    drugDrugInteractions: 'Red' | 'Yellow' | 'Green';
    interactionDetails: string; // explanation of specific risks
    therapeuticDuplication: string; // flagged duplicate ingredients
    unnecessaryMedications: string[]; // drugs recommended to stop
    omittedMedications: string[]; // missing essential medications
    administrationGuidelines: Array<{
      activeIngredient: string;
      brandName: string;
      dosageForm: string;
      dose: string;
      duration: string;
      foodRelation: string; // e.g. "Take post-meal with plenty of water"
      precautions: string;
    }>;
  };
}

export interface PaymentTransaction {
  id: string;
  patientId: string;
  patientName: string;
  serviceType: 'OTC' | 'REV' | 'MMP';
  serviceName: string;
  amount: number;
  paymentMethod: 'visa' | 'fawry' | 'vodafone';
  status: 'Success' | 'Failed';
  errorCode?: string;
  errorDetail?: string;
  transactionId: string;
  timestamp: string;
}

export type PharmacistDegree = 'junior' | 'Senior' | 'Specialist' | 'consultant' | 'prime consultant';

export interface PharmacistProfile {
  fullName: string;
  licenseNumber: string;
  specialty: ApprovedSpecialty;
  degree: PharmacistDegree;
  country: string;
  governorate: string; // governorate of Egypt
  city: string;
}

// Admin Operational Dashboard Metrics
export interface OperationalMetrics {
  totalRevenue: number;
  totalConsultations: number;
  completedRevisions: number;
  activeCampaignDiscount: number; // e.g. 15 for 15% off
  basePricing: {
    otcConsultation: number;
    prescriptionRevision: number;
    medicationManagement: number;
  };
  pharmacistPerformance: {
    name: string;
    avgResolutionTimeMin: number;
    casesRestored: number;
    rating: number;
  }[];
  auditLogs: {
    id: string;
    timestamp: string;
    action: string;
    pharmacist: string;
    serviceId: string;
    details: string;
  }[];
  paymentTransactions?: PaymentTransaction[];
}

// Unified Notification Model (إشعار المنظومة والمنبهات)
export interface AppNotification {
  id: string;
  recipient: 'patient' | 'pharmacist' | 'all';
  patientId?: string; // If specific to one patient NID
  title: string;
  body: string;
  type: 'PillReminder' | 'NewBooking' | 'ReportSigned' | 'General';
  read: boolean;
  createdAt: string;
  metadata?: {
    serviceId?: string;
    reportId?: string;
    brandName?: string;
    activeIngredient?: string;
    timeOfDay?: string;
  };
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: 'patient' | 'pharmacist' | 'admin';
  fullName: string;
  nationalId?: string; // for patients (associates with PatientProfile)
  licenseNumber?: string; // for pharmacists
  securityQuestion?: string;
  securityAnswerHash?: string;
  createdAt: string;
}

