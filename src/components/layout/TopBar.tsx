import { useAuth }     from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { daysSincePrepStart } from "../../lib/formulas";

export default function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const freezeDate = profile?.freeze_date || "2026-06-02";
  const prepStartDate = profile?.prep_start_date || "2026-06-13";
  const day = daysSincePrepStart(prepStartDate);
  
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 uppercase tracking-wider">Roadmap Locked</span>
          <span className="text-slate-300 font-medium">{freezeDate}</span>
          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Frozen</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">Prep Started</span>
          <span className="text-slate-300 font-medium hidden sm:inline">{prepStartDate}</span>
          <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-medium">
            Day {day} / 140
          </span>
        </div>
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">PrepOS</h1>
          <p className="text-[10px] text-slate-500 hidden sm:block">SSC CGL · Coal India · NET · JAD</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/settings")} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Settings size={16} /></button>
          <button onClick={signOut} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"><LogOut size={16} /></button>
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
            {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      </div>
    </header>
  );
}
