import { useAuth }      from "../../context/AuthContext";
import { usePrepData }  from "../../hooks/usePrepData";
import { calcHealth, calcReadiness, calcWeakRouting, calcStreaks,
         getAntiLazyMode, isExecutionMode, getRealityCheck,
         calcExecScore, readinessColor, daysSincePrepStart } from "../../lib/formulas";
import { EXAMS, EXAM_INTEL } from "../../lib/constants";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";

function Bar({v,c,h="h-1.5"}:{v:number;c:string;h?:string}) {
  return <div className={`w-full ${h} rounded-full bg-slate-800`}><div className={`${h} rounded-full transition-all duration-500`} style={{width:`${Math.min(100,v)}%`,background:c}}/></div>;
}

const LAZY_CFG: Record<string,{bg:string;txt:string;msg:string}> = {
  rebuild:  {bg:"bg-red-950 border-red-900",   txt:"text-red-300",   msg:"10+ days inactive. REBUILD MODE. Just 1 thing: walk + 1 topic."},
  emergency:{bg:"bg-amber-950 border-amber-900",txt:"text-amber-300", msg:"5+ days missed. EMERGENCY RESET. Walk 2km + 10 PYQs + log health."},
  recovery: {bg:"bg-orange-950 border-orange-900",txt:"text-orange-300",msg:"2-4 days missed. RECOVERY PLAN active. Catch up without cramming."},
};

export default function DashboardPage() {
  const { profile }   = useAuth();
  const { healthLogs, mockScores, topicProgressMap, weekLogs, overdueRevisions, analyticsSummary } = usePrepData();
  if (!profile) return null;

  const scores = { quant:profile.score_quant, reasoning:profile.score_reasoning, english:profile.score_english, gk:profile.score_gk, cs:profile.score_cs };
  const hs     = calcHealth(healthLogs);
  const done   = Object.values(topicProgressMap).filter((t: any) => t.is_done).length;
  const total  = analyticsSummary?.topics_total ?? 89;
  const day    = daysSincePrepStart(profile.prep_start_date);
  const rd     = calcReadiness(scores, {}, mockScores as any, hs, day, total, done);
  const wr     = calcWeakRouting(scores);
  const sk     = calcStreaks(healthLogs as any);
  const lm     = getAntiLazyMode(healthLogs as any);
  const execW  = isExecutionMode(day, mockScores.length, done);
  const es     = weekLogs[0] ? calcExecScore(weekLogs[0] as any, hs) : 0;
  const rc     = getRealityCheck(profile.total_plan_hours, profile.total_study_hours);
  const overall= Math.round((rd.cgl+rd.coal+rd.net+rd.jad)/4);

  return (
    <div className="space-y-4">
      {execW && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-950 border border-amber-900 rounded-xl">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0"/>
          <div>
            <p className="text-sm font-medium text-amber-300">Execution Mode — Day {day}</p>
            <p className="text-xs text-amber-400 mt-0.5">No mocks, under 3 topics. Stop planning. Execute: 1 topic + 20 PYQs.</p>
          </div>
        </div>
      )}
      {lm !== "normal" && lm !== "start" && LAZY_CFG[lm] && (
        <div className={`px-4 py-3 border rounded-xl ${LAZY_CFG[lm].bg}`}>
          <p className={`text-sm ${LAZY_CFG[lm].txt}`}>{LAZY_CFG[lm].msg}</p>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[{l:"Overall",v:`${overall}%`,c:overall>=70?"text-emerald-400":overall>=40?"text-amber-400":"text-red-400"},
          {l:"Health V2",v:`${hs}%`,c:hs>=70?"text-emerald-400":hs>=40?"text-amber-400":"text-red-400"},
          {l:"Exec Score",v:es>0?String(es):"—",c:es>=75?"text-emerald-400":es>=50?"text-amber-400":"text-slate-400"}].map(s=>(
          <div key={s.l} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-semibold ${s.c}`}>{s.v}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Streaks */}
      <div>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Streaks</p>
        <div className="flex gap-2">
          {[{l:"5AM",v:sk.wake,e:"🌅"},{l:"Sleep",v:sk.sleep,e:"😴"},{l:"Water",v:sk.water,e:"💧"},{l:"Steps",v:sk.steps,e:"🏃"},{l:"Exer",v:sk.exercise,e:"💪"}].map(s=>(
            <div key={s.l} className={`flex-1 flex flex-col items-center py-2 rounded-lg ${s.v>=7?"bg-emerald-950":s.v>=3?"bg-amber-950":"bg-slate-900"} border ${s.v>=7?"border-emerald-900":s.v>=3?"border-amber-900":"border-slate-800"}`}>
              <span className="text-sm">{s.e}</span>
              <span className={`text-base font-semibold ${s.v>=7?"text-emerald-400":s.v>=3?"text-amber-400":s.v>=1?"text-white":"text-slate-600"}`}>{s.v}</span>
              <span className="text-[9px] text-slate-500">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Readiness grid */}
      <div>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Exam Readiness V2</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EXAMS.map(e=>{const pct=(rd as any)[e.id]??0,col=readinessColor(pct),intel=EXAM_INTEL[e.id];return(
            <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase">{e.s}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{color:col,background:`${col}20`}}>{e.role}</span>
              </div>
              <div className="text-2xl font-semibold mb-1.5" style={{color:col}}>{pct}%</div>
              <Bar v={pct} c={col}/>
              {intel&&<div className="mt-1.5 flex gap-2 text-[9px] text-slate-500"><span>Safe <span className="text-slate-300">{intel.safe}</span></span><span>Target <span className="text-slate-300">{intel.target}</span></span></div>}
            </div>
          );})}
        </div>
      </div>

      {/* Weak routing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Auto Weakness Routing</h3>
          <span className="text-[10px] text-slate-500">Today allocation</span>
        </div>
        {wr.map(s=>(
          <div key={s.name} className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-300">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{color:s.hex}}>{s.label}</span>
                <span className="text-xs font-semibold" style={{color:s.hex}}>{s.alloc}%</span>
              </div>
            </div>
            <Bar v={s.alloc} c={s.hex}/>
          </div>
        ))}
      </div>

      {/* Progress stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Topics Done</div>
          <div className="text-lg font-semibold text-white">{done}<span className="text-slate-500 text-sm font-normal"> / {total}</span></div>
          <Bar v={Math.round(done/Math.max(total,1)*100)} c="#1A8F68" h="h-1"/>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Revisions Due</div>
          <div className={`text-lg font-semibold ${overdueRevisions.length>0?"text-red-400":"text-emerald-400"}`}>{overdueRevisions.length}</div>
          <div className="text-[10px] text-slate-600 mt-1">{overdueRevisions.length===0?"All caught up":"Overdue — Study tab"}</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        {[{label:"Log Health",to:"/health",c:"text-emerald-400"},{label:"Add Mock Score",to:"/mocks",c:"text-blue-400"},{label:"PYQ Topics",to:"/study",c:"text-purple-400"},{label:"JAD Track",to:"/jad",c:"text-violet-400"}].map(item=>(
          <Link key={item.to} to={item.to} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors">
            <span className={`text-sm font-medium ${item.c}`}>{item.label}</span>
            <ChevronRight size={14} className="text-slate-600"/>
          </Link>
        ))}
      </div>

      {rc&&<div className={`px-4 py-3 rounded-xl border text-sm flex items-start gap-2 ${rc.level==="danger"?"bg-red-950 border-red-900 text-red-300":rc.level==="warn"?"bg-amber-950 border-amber-900 text-amber-300":rc.level==="ok"?"bg-blue-950 border-blue-900 text-blue-300":"bg-emerald-950 border-emerald-900 text-emerald-300"}`}>
        <TrendingUp size={14} className="mt-0.5 flex-shrink-0"/><span>{rc.msg}</span>
      </div>}
    </div>
  );
}
