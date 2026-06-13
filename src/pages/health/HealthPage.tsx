import { useState }      from "react";
import { usePrepData }   from "../../hooks/usePrepData";
import { calcHealth, calcStreaks } from "../../lib/formulas";
import type { HealthLogInput } from "../../hooks/usePrepData";
import { format }        from "date-fns";
import { Trash2, Edit2 } from "lucide-react";

export default function HealthPage() {
  const { healthLogs, logHealth, updateHealth, deleteHealth, isLoggingHealth } = usePrepData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    wake_time: "05:00",
    sleep_time: "21:30",
    sleep_hours: 7,
    water_liters: 3,
    steps: 10000,
    exercise_minutes: 30,
    strength_minutes: 20,
    mental_health_score: 8,
  });

  const hs      = calcHealth(healthLogs as any);
  const sk      = calcStreaks(healthLogs as any);
  const recent7 = healthLogs.slice(0,7);
  const cnt     = (k: string, thr=0.9) => recent7.filter((d:any) => (d[k]||0)>=thr).length;

  const handleLog = () => {
    const logData: any = {
      log_date: format(new Date(), "yyyy-MM-dd"),
      // Map new form fields to database schema
      wake: form.wake_time >= "05:00" && form.wake_time <= "05:30" ? 1 : 0,
      sleep: form.sleep_hours >= 7 ? 1 : 0,
      water: Math.min(1, form.water_liters / 3),
      steps: Math.min(1, form.steps / 10000),
      exercise: form.exercise_minutes >= 30 ? 1 : 0,
      strength: form.strength_minutes >= 20 ? 1 : 0,
      // Also save detailed fields
      wake_time: form.wake_time,
      sleep_time: form.sleep_time,
      sleep_hours: form.sleep_hours,
      water_liters: form.water_liters,
      exercise_minutes: form.exercise_minutes,
      strength_minutes: form.strength_minutes,
      mental_health_score: form.mental_health_score,
    };
    logHealth(logData);
    setShowForm(false);
    setForm({wake_time:"05:00",sleep_time:"21:30",sleep_hours:7,water_liters:3,steps:10000,exercise_minutes:30,strength_minutes:20,mental_health_score:8});
  };

  const handleUpdate = () => {
    if(!editingId) return;
    const logData: any = {
      // Map new form fields to database schema
      wake: form.wake_time >= "05:00" && form.wake_time <= "05:30" ? 1 : 0,
      sleep: form.sleep_hours >= 7 ? 1 : 0,
      water: Math.min(1, form.water_liters / 3),
      steps: Math.min(1, form.steps / 10000),
      exercise: form.exercise_minutes >= 30 ? 1 : 0,
      strength: form.strength_minutes >= 20 ? 1 : 0,
      // Also save detailed fields
      wake_time: form.wake_time,
      sleep_time: form.sleep_time,
      sleep_hours: form.sleep_hours,
      water_liters: form.water_liters,
      exercise_minutes: form.exercise_minutes,
      strength_minutes: form.strength_minutes,
      mental_health_score: form.mental_health_score,
    };
    updateHealth(editingId, logData);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if(confirm("Delete this health log?")) {
      deleteHealth(id);
    }
  };

  const startEdit = (log: any) => {
    setEditingId(log.id);
    setForm({
      wake_time: log.wake_time || "05:00",
      sleep_time: log.sleep_time || "21:30",
      sleep_hours: log.sleep_hours || 7,
      water_liters: log.water_liters || 3,
      steps: log.steps || 10000,
      exercise_minutes: log.exercise_minutes || 30,
      strength_minutes: log.strength_minutes || 20,
      mental_health_score: log.mental_health_score || 8,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
  };

  const WAKE_TIMES = [
    "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30","08:00"
  ];

  const SLEEP_TIMES = [
    "20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30","00:00"
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Health Readiness V2</p>
            <p className="text-4xl font-semibold text-emerald-400">{hs}%</p>
            <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
          </div>
          <button onClick={()=>setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
            {editingId ? "Edit Log" : "+ Log Today"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[{l:"Sleep",v:cnt("sleep_hours",7),t:"/7 days ≥7h"},{l:"Water",v:cnt("water_liters",3),t:"/7 days ≥3L"},{l:"Steps",v:cnt("steps",8000),t:"/7 days ≥8K"},{l:"Exercise",v:cnt("exercise_minutes",20),t:"/7 days ≥20m"}].map(h=>(
            <div key={h.l} className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{h.v}</div>
              <div className="text-[10px] text-slate-400">{h.l} {h.t}</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Log Today — {format(new Date(),"dd MMM yyyy")}</h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Wake Time */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Wake Time</label>
              <select value={form.wake_time} onChange={e=>setForm(p=>({...p,wake_time:e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                {WAKE_TIMES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Sleep Time */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sleep Time</label>
              <select value={form.sleep_time} onChange={e=>setForm(p=>({...p,sleep_time:e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                {SLEEP_TIMES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Sleep Hours */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sleep Hours</label>
              <input type="number" min="4" max="12" step="0.5" value={form.sleep_hours}
                onChange={e=>setForm(p=>({...p,sleep_hours:+e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"/>
            </div>

            {/* Water (Liters) */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Water (Liters)</label>
              <div className="flex gap-1">
                <button onClick={()=>setForm(p=>({...p,water_liters:Math.max(0,p.water_liters-0.25)}))}
                  className="px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">-</button>
                <input type="number" min="0" max="5" step="0.25" value={form.water_liters}
                  onChange={e=>setForm(p=>({...p,water_liters:+e.target.value}))}
                  className="flex-1 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center"/>
                <button onClick={()=>setForm(p=>({...p,water_liters:Math.min(5,p.water_liters+0.25)}))}
                  className="px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">+</button>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">1 glass = 0.25L • Target: 3L (12 glasses)</div>
            </div>

            {/* Steps */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Steps</label>
              <input type="number" min="0" max="30000" step="500" value={form.steps}
                onChange={e=>setForm(p=>({...p,steps:+e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"/>
              <div className="text-[10px] text-slate-500 mt-1">Target: 10,000</div>
            </div>

            {/* Exercise Minutes */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Exercise (min)</label>
              <input type="number" min="0" max="120" step="5" value={form.exercise_minutes}
                onChange={e=>setForm(p=>({...p,exercise_minutes:+e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"/>
              <div className="text-[10px] text-slate-500 mt-1">Target: 30 min</div>
            </div>

            {/* Strength Training */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Strength (min)</label>
              <input type="number" min="0" max="120" step="5" value={form.strength_minutes}
                onChange={e=>setForm(p=>({...p,strength_minutes:+e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"/>
              <div className="text-[10px] text-slate-500 mt-1">Target: 20 min</div>
            </div>

            {/* Mental Health Score */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Mental (1-10)</label>
              <input type="number" min="1" max="10" step="1" value={form.mental_health_score}
                onChange={e=>setForm(p=>({...p,mental_health_score:+e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"/>
            </div>
          </div>

          <button onClick={editingId ? handleUpdate : handleLog} disabled={isLoggingHealth}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {isLoggingHealth?"Saving...":editingId?"Update Log":"Save Health Log"}
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
        {(healthLogs || []).length === 0
          ? <p className="text-xs text-slate-500 text-center py-4">No logs yet.</p>
          : <div className="space-y-2">{(healthLogs || []).slice(0,7).map((log:any)=>(
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex-1">
                  <span className="text-xs text-slate-400">{format(new Date(log.log_date),"EEE, dd MMM")}</span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    🌅 {log.wake_time || 'N/A'} • 😴 {log.sleep_hours || 0}h • 💧 {log.water_liters || 0}L • 🏃 {log.steps || 0} • 💪 {log.exercise_minutes || 0}m
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>startEdit(log)} className="p-1 hover:bg-slate-800 rounded text-blue-400">
                    <Edit2 size={12}/>
                  </button>
                  <button onClick={()=>handleDelete(log.id)} className="p-1 hover:bg-slate-800 rounded text-red-400">
                    <Trash2 size={12}/>
                  </button>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${log.health_score>=70?"bg-emerald-950 text-emerald-400":log.health_score>=40?"bg-amber-950 text-amber-400":"bg-red-950 text-red-400"}`}>{log.health_score || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}