import { useState } from "react";
import PharmacistWorkspace from "../../src/components/PharmacistWorkspace";
import { PatientProfile } from "../../shared/types";
import { DEFAULT_PATIENTS } from "../../src/defaultData";

export default function PharmacistWorkspaceApp() {
  const [patients] = useState<PatientProfile[]>(DEFAULT_PATIENTS);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2 sm:p-4">
      <PharmacistWorkspace
        patients={patients}
        onReportIssued={() => {}}
        onAuthSuccess={() => {}}
        onLogout={() => {}}
      />
    </div>
  );
}
