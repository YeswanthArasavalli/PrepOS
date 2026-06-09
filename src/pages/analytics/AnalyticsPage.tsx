import { useState }     from "react";
import { useAuth }      from "../../context/AuthContext";
import { usePrepData }  from "../../hooks/usePrepData";
import { calcHealth, calcExecScore, getRealityCheck, calcStreaks, getAntiLazyMode } from "../../lib/formulas";
import { EXAMS }        from "../../lib/constants";
import type { WeekLogInput } from "../../hooks/usePrepData";
import { format, startOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AnalyticsPage() {
  const { profile }    = useAuth();
  const { healthLogs, mockScores, errorLogs, weekLogs, addWeekLog, analyticsSummary, overdueRevisions } = usePrepData();
  const [showWF, setShowWF] = useState(false);
  const [wf, setWf]         = useState({sh:"",m:"",r:"",ph:""});

  const hs   = calcHealth(healthLogs as any);
  const sk   = calcStreaks(healthLogs as any);
  const lm   = getAntiLazyMode(healthLogs as any);
  const lw   = weekLogs[0];
  const es   = lw ? calcExecScore(lw as any, hs) : 0;
  const rc   = getRealityCheck(profile?.total_plan_hours??0, profile?.total_study_hours??0);
  const eCol = es>=75?"#1A8F68":es>=50?"#B06B0F":"#C94B2A";

  const handleWF = () => {
    const inp: WeekLogInput = { week_start:format(startOfWeek(new Date(),{weekStartsOn:1}),"yyyy-MM-dd"),study_hours:+wf.sh||0,mocks_done:+wf.m||0,revisions_done:+wf.r||0,plan_hours:+wf.ph||0 };
    addWeekLog(inp); setShowWF(false); setWf({sh:"",m:"",r:"",ph:""});
  };

  const chartData = (analyticsSummary?.mock_by_exam??[]).map((d: any) => ({
    name:EXAMS.find(e=>e.id===d.exam_id)?.s??d.exam_id, accuracy:d.avg_accuracy,
  }));

  return (
    <div className="space-y-4">
      <div className={`px-4 py-3 rounded-xl border text-xs ${lm==="normal"?"bg-emerald-950 border-emerald-900 text-emerald-300":"bg-slate-900 border-slate-800 text-slate-400"}`}>
        Mode: <strong className="uppercase">{lm}</strong>
        {lm==="normal"?" — Keep the momentum.":" — See Recovery section for your plan."}
      </div>

      {/* Execution Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white">Weekly Execution Score</h3>
            <p className="text-[11px] text-slate-500">Study 40% · Mocks 25% · Revisions 20% · Health 15%</p>
          </div>
          <button onClick={()=>setShowWF(!showWF)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs">+ Log Week</button>
        </div>
        {showWF&&(
          <div className="mb-4 pb-4 border-b border-slate-800 grid grid-cols-2 gap-2">
            {[{k:"sh",l:"Study Hours (target: 56)"},{k:"m",l:"Full Mocks (target: 7)"},{k:"r",l:"Revisions (target: 7)"},{k:"ph",l:"Planning Hours (honest)"}].map(f=>(
              <div key={f.k}>
                <label className="block text-[10px] text-slate-500 mb-1">{f.l}</label>
                <input type="number" min={0} value={(wf as any)[f.k]} onChange={e=>setWf(p=>({...p,[f.k]:e.target.value}))}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"/>
              </div>
            ))}
            <button onClick={handleWF} className="col-span-2 py-2 bg-white text-slate-950 rounded-lg text-sm font-medium">Save Week</button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="text-5xl font-semibold" style={{color:eCol}}>{es||"—"}</div>
          <div className="flex-1">
            <div className="h-2 bg-slate-800 rounded-full mb-2"><div className="h-full rounded-full transition-all" style={{width:`${es}%`,background:eCol}}/></div>
            <p className="text-xs" style={{color:eCol}}>
              {es>=75?"Excellent. This is what selection looks like.":es>=50?"Decent. Increase study hours and mocks.":es>0?"Below threshold. Fix basics: study daily + weekly mocks.":"Log your first week above."}
            </p>
          </div>
        </div>
        {weekLogs.length>0&&(
          <div className="flex gap-2 mt-3 flex-wrap">
            {(weekLogs as any[]).slice(0,4).map((w: any,i: number)=>{
              const sc=calcExecScore(w,hs);
              return(
                <div key={i} className="px-2.5 py-1.5 rounded-lg text-xs" style={{background:sc>=75?"#052e16":sc>=50?"#2d1a08":"#2d0e0e"}}>
                  <span className="font-medium" style={{color:sc>=75?"#1A8F68":sc>=50?"#B06B0F":"#C94B2A"}}>Wk{i+1}: {sc}/100</span>
                  <span className="text-slate-500 ml-1">{w.study_hours}h · {w.mocks_done}M</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Streaks */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Anti-Lazy Streaks</h3>
        <div className="grid grid-cols-5 gap-2">
          {[{l:"5AM",v:sk.wake},{l:"Sleep",v:sk.sleep},{l:"Water",v:sk.water},{l:"Steps",v:sk.steps},{l:"Exer",v:sk.exercise}].map(s=>(
            <div key={s.l} className={`text-center p-2 rounded-lg ${s.v>=7?"bg-emerald-950":s.v>=3?"bg-amber-950":"bg-slate-800"}`}>
              <div className={`text-lg font-bold ${s.v>=7?"text-emerald-400":s.v>=3?"text-amber-400":s.v>=1?"text-white":"text-slate-600"}`}>{s.v}</div>
              <div className="text-[9px] text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock chart */}
      {chartData.length>0&&(
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Mock Performance</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}}/>
              <YAxis tick={{fontSize:10,fill:"#64748b"}} domain={[0,100]}/>
              <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:"8px"}} labelStyle={{color:"#cbd5e1"}} formatter={(v: number)=>[`${v}%`,"Accuracy"]}/>
              <Bar dataKey="accuracy" radius={[4,4,0,0]}>
                {chartData.map((d: any,i: number)=><Cell key={i} fill={d.accuracy>=70?"#1A8F68":d.accuracy>=50?"#B06B0F":"#C94B2A"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Error analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Error Patterns</h3>
        {(analyticsSummary?.error_by_subject??[]).length===0
          ?<p className="text-xs text-slate-500">No errors logged yet.</p>
          :<div className="space-y-2">{(analyticsSummary?.error_by_subject??[]).map((e: any)=>(
              <div key={e.subject} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-32 flex-shrink-0">{e.subject}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{width:`${Math.min(100,e.count*8)}%`}}/></div>
                <span className="text-xs font-medium text-red-400 w-5">{e.count}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Summary</h3>
        {[
          {l:"Topics Done",v:`${analyticsSummary?.topics_done??0}/${analyticsSummary?.topics_total??89}`,pct:Math.round((analyticsSummary?.topics_done??0)/89*100),c:"#1A8F68"},
          {l:"Revision Debt",v:`${overdueRevisions.length} overdue`,pct:Math.min(100,overdueRevisions.length*8),c:overdueRevisions.length>0?"#C94B2A":"#1A8F68"},
          {l:"Mocks Total",v:String(mockScores.length),pct:Math.min(100,mockScores.length*3),c:"#1556A0"},
          {l:"Errors Logged",v:String(errorLogs.length),pct:Math.min(100,errorLogs.length*2),c:"#4B3EB5"},
        ].map(s=>(
          <div key={s.l} className="mb-3">
            <div className="flex justify-between mb-1"><span className="text-xs text-slate-400">{s.l}</span><span className="text-xs font-medium text-white">{s.v}</span></div>
            <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full rounded-full transition-all" style={{width:`${s.pct}%`,background:s.c}}/></div>
          </div>
        ))}
      </div>

      {/* Reality Check */}
      {rc&&<div className={`px-4 py-3 rounded-xl border text-sm ${rc.level==="danger"?"bg-red-950 border-red-900 text-red-300":rc.level==="warn"?"bg-amber-950 border-amber-900 text-amber-300":rc.level==="ok"?"bg-blue-950 border-blue-900 text-blue-300":"bg-emerald-950 border-emerald-900 text-emerald-300"}`}>{rc.msg}</div>}
    </div>
  );
}
