import { useState }      from "react";
import { usePrepData }   from "../../hooks/usePrepData";
import { calcHealth, calcStreaks } from "../../lib/formulas";
import type { HealthLogInput } from "../../hooks/usePrepData";
import { format }        from "date-fns";

export default function HealthPage() {
  const { healthLogs, logHealth, isLoggingHealth } = usePrepData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({wake:0,sleep:0,water:0,exercise:0,steps:0,strength:0});

  const hs      = calcHealth(healthLogs as any);
  const sk      = calcStreaks(healthLogs as any);
  const recent7 = healthLogs.slice(0,7);
  const cnt     = (k: string, thr=0.9) => recent7.filter((d:any) => (d[k]||0)>=thr).length;

  const handleLog = () => {
    logHealth({...form, log_date:format(new Date(),"yyyy-MM-dd")} as HealthLogInput);
    setShowForm(false);
    setForm({wake:0,sleep:0,water:0,exercise:0,steps:0,strength:0});
  };

  const SLIDERS = [
    {k:"wake",l:"5AM Wake-up?",max:1,st:1},{k:"sleep",l:"Slept 7+ hours?",max:1,st:1},
    {k:"water",l:"3L water (0–1)",max:1,st:0.1},{k:"exercise",l:"Exercise done?",max:1,st:1},
    {k:"steps",l:"10K steps (0–1)",max:1,st:0.1},{k:"strength",l:"Strength training?",max:1,st:1},
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Health Readiness V2</p>
            <p className="text-4xl font-semibold text-emerald-400">{hs}%</p>
            <p className="text-xs text-slate-500 mt-1">Last 7 days · Wake20+Sleep20+Steps20+Water15+Exer15+Str10</p>
          </div>
          <button onClick={()=>setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">+ Log Today</button>
        </div>
        <div className="space-y-2">
          {[{l:"Wake(20%)",v:cnt("wake",1)},{l:"Sleep(20%)",v:cnt("sleep",1)},{l:"Steps(20%)",v:cnt("steps")},{l:"Water(15%)",v:cnt("water")},{l:"Exer(15%)",v:cnt("exercise",1)},{l:"Strength(10%)",v:cnt("strength",1)}].map(h=>(
            <div key={h.l} className="flex items-center gap-3">
              <div className="w-24 text-xs text-slate-400 text-right">{h.l}</div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${h.v/7*100}%`}}/></div>
              <div className="w-8 text-xs text-slate-300 font-medium">{h.v}/7</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-medium text-white">Log Today — {format(new Date(),"dd MMM yyyy")}</h3>
          {SLIDERS.map(s=>(
            <div key={s.k}>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-slate-400">{s.l}</label>
                <span className="text-xs font-medium text-white">{(form as any)[s.k]}</span>
              </div>
              <input type="range" min={0} max={s.max} step={s.st} value={(form as any)[s.k]}
                onChange={e=>setForm(p=>({...p,[s.k]:+e.target.value}))} className="w-full accent-emerald-500"/>
            </div>
          ))}
          <button onClick={handleLog} disabled={isLoggingHealth}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {isLoggingHealth?"Saving...":"Save Health Log"}
          </button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Streaks</h3>
        <div className="grid grid-cols-5 gap-2">
          {[{l:"5AM",v:sk.wake},{l:"Sleep",v:sk.sleep},{l:"Water",v:sk.water},{l:"Steps",v:sk.steps},{l:"Exer",v:sk.exercise}].map(s=>(
            <div key={s.l} className={`text-center p-2 rounded-lg ${s.v>=7?"bg-emerald-950":s.v>=3?"bg-amber-950":"bg-slate-800"}`}>
              <div className={`text-xl font-bold ${s.v>=7?"text-emerald-400":s.v>=3?"text-amber-400":s.v>=1?"text-white":"text-slate-600"}`}>{s.v}</div>
              <div className="text-[9px] text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Recent Logs</h3>
        {healthLogs.length===0
          ? <p className="text-xs text-slate-500 text-center py-4">No logs yet.</p>
          : <div className="space-y-2">{healthLogs.slice(0,7).map((log:any)=>(
              <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                <span className="text-xs text-slate-400">{format(new Date(log.log_date),"EEE, dd MMM")}</span>
                <div className="flex gap-1.5">
                  {[{v:log.wake,e:"🌅"},{v:log.sleep,e:"😴"},{v:log.water,e:"💧"},{v:log.steps,e:"🏃"},{v:log.exercise,e:"💪"},{v:log.strength,e:"🏋️"}].map((m,i)=>(
                    <span key={i} className={`text-xs ${m.v>=0.9?"opacity-100":"opacity-20"}`}>{m.e}</span>
                  ))}
                </div>
                <span className={`text-xs font-medium ${log.health_score>=70?"text-emerald-400":log.health_score>=40?"text-amber-400":"text-red-400"}`}>{log.health_score}%</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
