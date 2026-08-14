import AdminPanel from "../../src/components/AdminPanel";
import { LanguageProvider } from "../../src/LanguageContext";

export default function AdminApp() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-2 sm:p-4">
        <AdminPanel />
      </div>
    </LanguageProvider>
  );
}

