import { useState }    from "react";
import { useAuth }     from "../../context/AuthContext";
import { usePrepData } from "../../hooks/usePrepData";

const FIELDS = [
  {key:"quant",    label:"Quantitative Aptitude", desc:["No maths","Know basics","% Ratio slowly","P1 arithmetic ok","Solid, weak advanced","Strong most topics","Fast+accurate","CGL Tier 2","Expert, minor gaps","Top 1%"]},
  {key:"reasoning",label:"Reasoning",             desc:["Never attempted","Know types","Easy Qs only","P1 manageable","P1+P2 effort","Strong","Fast most types","Exam-ready","Near-expert","Expert"]},
  {key:"english",  label:"English Language",      desc:["Very weak","Read basic slowly","Basic grammar","Grammar ok","RC+Error ok","Strong grammar","High accuracy","SSC strength","Only RC hard","Expert"]},
  {key:"gk",       label:"General Knowledge",     desc:["No GK","Very basics","Some history","Science+History done","Polity started","Inconsistent CA","Regular CA","Strong all","Near-expert","GK = strength"]},
  {key:"cs",       label:"Computer Science",      desc:["No CS","Very basic","Heard OS/DBMS","Surface level","DS,OS,DBMS basics","Algorithms+Networks","Strong Tier A","NET-level ok","All units","CS expert"]},
] as const;

export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { updateAssessment } = usePrepData();
  const [scores, setScores] = useState({quant:profile?.score_quant??2,reasoning:profile?.score_reasoning??2,english:profile?.score_english??3,gk:profile?.score_gk??2,cs:profile?.score_cs??1});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateAssessment(scores); setSaved(true);
    setTimeout(()=>setSaved(false),2000); refreshProfile();
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-white">
            {profile?.display_name?.[0]?.toUpperCase()??"?"}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile?.display_name}</p>
            <p className="text-xs text-slate-400">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-1">Subject Assessment</h3>
        <p className="text-xs text-slate-500 mb-4">Update your level. Adjusts weak routing and readiness calculations.</p>
        <div className="space-y-5">
          {FIELDS.map(f=>{
            const val = scores[f.key];
            return(
              <div key={f.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">{f.label}</label>
                  <span className="text-xs text-slate-400">Level {val}/9</span>
                </div>
                <input type="range" min={0} max={9} value={val} onChange={e=>setScores(p=>({...p,[f.key]:+e.target.value}))} className="w-full accent-violet-500 mb-1.5"/>
                <div className="text-xs px-2.5 py-1.5 rounded-lg" style={{background:val<=2?"#FDF0EC":val<=5?"#FBF1E3":val<=7?"#E8F8F3":"#E8F1FB",color:val<=2?"#7A2410":val<=5?"#6B3E06":val<=7?"#0C5E43":"#0E3B72"}}>
                  {f.desc[val]}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={handleSave} className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${saved?"bg-emerald-600 text-white":"bg-white text-slate-950 hover:bg-slate-100"}`}>
          {saved?"✓ Saved":"Save Assessment"}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Timeline</h3>
        {[{l:"Roadmap Frozen",v:profile?.freeze_date??"2026-06-02"},{l:"Prep Started",v:profile?.prep_start_date??"2026-06-03"},{l:"Duration",v:"140 days"}].map(s=>(
          <div key={s.l} className="flex justify-between py-1.5 border-b border-slate-800 last:border-0">
            <span className="text-xs text-slate-400">{s.l}</span>
            <span className="text-xs text-white font-medium">{s.v}</span>
          </div>
        ))}
      </div>

      <button onClick={signOut} className="w-full py-2.5 bg-red-950 border border-red-900 text-red-400 rounded-xl text-sm font-medium hover:bg-red-900 transition-colors">
        Sign Out
      </button>
    </div>
  );
}
