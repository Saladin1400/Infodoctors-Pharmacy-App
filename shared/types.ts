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
  drugAllergies: string[];
  foodAllergies: string[];
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
  substanceAbuse: string[];
  profession: string;
  physicalActivity: PhysicalActivity;
}

export interface PastSurgery {
  procedure: string;
  date: string;
  surgeonOrHospital?: string;
}

export interface MedicalHistory {
  surgeries: PastSurgery[];
  acuteIllnesses: { condition: string; date: string; recovered: boolean }[];
  chronicDiseases: {
    disease: string;
    status: 'Stable' | 'Uncontrolled' | 'Newly Diagnosed';
    sinceYear?: string;
  }[];
}

export interface CurrentMedication {
  activeIngredient: string;
  brandName: string;
  dosageForm: string;
  concentration: string;
  frequency: {
    units: number;
    type: 'tablet' | 'capsule' | 'suppository' | 'spoon' | 'puff' | 'injection';
    timeframe: string;
  };
  instructions?: string;
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

export interface PatientProfile {
  nationalId: string;
  fullName: string;
  email: string;
  phonePrimary: string;
  phoneBackup?: string;
  dob: string;
  profilePhotoUrl?: string;
  address: {
    country: string;
    governorate: string;
    city: string;
    district: string;
  };
  religion: 'Muslim' | 'Christian' | 'Jewish' | 'Hindu' | 'Buddhist' | 'Other';
  gender: Gender;
  maritalStatus: MaritalStatus;
  sexualActivity: SexualActivity;
  pregnancyLactation?: {
    isPregnant: boolean;
    weeks?: number;
    isLactating: boolean;
  };
  height: number;
  weight: number;
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

export interface OtcConsultation {
  id: string;
  patientId: string;
  patientName: string;
  specialty: ApprovedSpecialty;
  complaintSummary: string;
  appointmentTime: string;
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number;
  status: 'In-Waiting' | 'Ongoing' | 'Completed';
  reportId?: string;
  googleMeetUrl?: string;
  createdAt: string;
}

export interface PrescriptionRevision {
  id: string;
  patientId: string;
  patientName: string;
  specialty: ApprovedSpecialty;
  prescriptionImageUrl: string;
  appointmentTime: string;
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number;
  status: 'In-Waiting' | 'Ongoing' | 'Completed';
  reportId?: string;
  googleMeetUrl?: string;
  createdAt: string;
}

export interface MedicationManagementPlan {
  id: string;
  patientId: string;
  patientName: string;
  appointmentTime: string;
  paymentStatus: 'Pending' | 'Paid';
  paymentAmount: number;
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
  timeOfDay: string;
  foodRelation: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | 'No Special Timing';
  specialInstructions: string;
  notificationTriggered: boolean;
}

export interface ClinicalReport {
  id: string;
  serviceId: string;
  serviceType: 'OTC_CONSULTATION' | 'PRESCRIPTION_REVISION' | 'MED_MANAGEMENT';
  patientId: string;
  createdAt: string;
  pharmacistName: string;
  edaComplianceVerified: boolean;
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
  revisionFields?: {
    diagnosis: string;
    treatingPhysician: string;
    treatingSpecialty: string;
    drugDiagnosisMatch: string;
    dosageVerification: string;
    drugDrugInteractions: 'Red' | 'Yellow' | 'Green';
    interactionDetails: string;
    therapeuticDuplication: string;
    unnecessaryMedications: string[];
    omittedMedications: string[];
    administrationGuidelines: Array<{
      activeIngredient: string;
      brandName: string;
      dosageForm: string;
      dose: string;
      duration: string;
      foodRelation: string;
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

export interface PharmacistReview {
  id: string;
  patientName: string;
  patientAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  serviceType?: string;
}

export interface PharmacistProfile {
  id?: string;
  fullName: string;
  licenseNumber: string;
  specialty: ApprovedSpecialty;
  degree: PharmacistDegree;
  country: string;
  governorate: string;
  city: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  certificates?: string[];
  rating?: number;
  reviewCount?: number;
  totalConsultations?: number;
  reviews?: PharmacistReview[];
  status?: 'online' | 'offline';
}

export interface OperationalMetrics {
  totalRevenue: number;
  totalConsultations: number;
  completedRevisions: number;
  activeCampaignDiscount: number;
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

export interface AppNotification {
  id: string;
  recipient: 'patient' | 'pharmacist' | 'all';
  patientId?: string;
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
  nationalId?: string;
  licenseNumber?: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
  createdAt: string;
  isFrozen?: boolean;
}
