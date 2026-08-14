import { useState } from "react";
import MobilePatientSimulator from "../../src/components/MobilePatientSimulator";
import { PatientProfile } from "../../shared/types";
import { DEFAULT_PATIENTS } from "../../src/defaultData";
import { LanguageProvider } from "../../src/LanguageContext";

export default function PatientApp() {
  const [patients, setPatients] = useState<PatientProfile[]>(DEFAULT_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>("29010151234567");

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md">
          <MobilePatientSimulator
            patients={patients}
            activePatientId={activePatientId}
            setActivePatientId={setActivePatientId}
            onServiceCreated={() => {}}
            onReloadPatients={() => {}}
            onAuthSuccess={() => {}}
            onLogout={() => {}}
          />
        </div>
      </div>
    </LanguageProvider>
  );
}

