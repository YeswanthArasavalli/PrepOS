import { useState } from "react";
import { usePrepData, type PipelineStage } from "../../hooks/usePrepData";
import { TOPICS, PIPE_STAGES, PRIORITY_COLORS, ERROR_TYPES, ALL_TOPICS } from "../../lib/constants";
import type { ErrorLogInput } from "../../hooks/usePrepData";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";

type Tab = "topics" | "revision" | "errors";

export default function StudyPage() {
  const { topicProgressMap, revisionMap, overdueRevisions, upcomingRevisions,
          updateTopic, markRevised, errorLogs, addError } = usePrepData();
  const [tab, setTab]       = useState<Tab>("topics");
  const [sub, setSub]       = useState(Object.keys(TOPICS)[0]);
  const [expTopic, setExpTopic] = useState<string|null>(null);
  const [showEF, setShowEF] = useState(false);
  const [errForm, setErrForm] = useState({sub:"Quant",topic:"",type:"concept",notes:""});

  const done = ALL_TOPICS.filter(t => (topicProgressMap as any)[t.id]?.is_done).length;

  const handleToggle = (topic: any, subject: string) => {
    const cur = (topicProgressMap as any)[topic.id];
    updateTopic({ topicId:topic.id, subject, topicName:topic.n, isDone:!(cur?.is_done), stage:(cur?.pipeline_stage??0) as PipelineStage });
  };

  const handlePipe = (topic: any, subject: string, stage: PipelineStage) => {
    const cur = (topicProgressMap as any)[topic.id];
    updateTopic({ topicId:topic.id, subject, topicName:topic.n, isDone:cur?.is_done??false, stage });
  };

  const handleAddError = () => {
    if (!errForm.topic) return;
    addError({ subject:errForm.sub, topic:errForm.topic, error_type:errForm.type as ErrorLogInput["error_type"], notes:errForm.notes||undefined });
    setShowEF(false); setErrForm({sub:"Quant",topic:"",type:"concept",notes:""});
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[{l:"Done",v:done,c:"text-white"},{l:"Overdue",v:overdueRevisions.length,c:overdueRevisions.length>0?"text-red-400":"text-emerald-400"},{l:"Due Soon",v:upcomingRevisions.length,c:"text-amber-400"}].map(s=>(
          <div key={s.l} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-semibold ${s.c}`}>{s.v}</div>
            <div className="text-[10px] text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
        {(["topics","revision","errors"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab===t?"bg-white text-slate-950":"text-slate-400 hover:text-white"}`}>
            {t==="topics"?`Topics (${done}/${ALL_TOPICS.length})`:t==="revision"?`Revision (${overdueRevisions.length})`:`Errors (${errorLogs.length})`}
          </button>
        ))}
      </div>

      {tab==="topics"&&(
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.keys(TOPICS).map(s=>{
              const st=TOPICS[s], dn=st.filter(t=>(topicProgressMap as any)[t.id]?.is_done).length;
              return <button key={s} onClick={()=>setSub(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${sub===s?"bg-white text-slate-950":"bg-slate-800 text-slate-400 hover:text-white"}`}>
                {s} ({dn}/{st.length})
              </button>;
            })}
          </div>
          <div className="space-y-2">
            {(TOPICS[sub]??[]).map((topic: any)=>{
              const prog=(topicProgressMap as any)[topic.id];
              const rev=(revisionMap as any)[topic.id];
              const overdue=prog?.is_done&&rev&&new Date(rev.due_at)<new Date();
              const stage=prog?.pipeline_stage??0;
              const pc=PRIORITY_COLORS[topic.p]??PRIORITY_COLORS["P4"];
              const exp=expTopic===topic.id;
              return (
                <div key={topic.id} className="rounded-xl border transition-colors"
                  style={prog?.is_done?{borderColor:`${pc.hex}50`,background:`${pc.bg}15`}:{borderColor:"#1e293b",background:"#0f172a"}}>
                  <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={()=>setExpTopic(exp?null:topic.id)}>
                    <button onClick={e=>{e.stopPropagation();handleToggle(topic,sub);}}
                      className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{borderColor:prog?.is_done?pc.hex:"#475569",background:prog?.is_done?pc.hex:"transparent"}}>
                      {prog?.is_done&&<span className="text-white text-[10px] font-bold">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${prog?.is_done?"line-through opacity-50 text-slate-400":"text-white"}`}>{topic.n}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{color:pc.hex,background:pc.bg}}>{topic.p}</span>
                        <span className="text-[10px] text-slate-500">ROI:{topic.roi}%</span>
                        {overdue&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400">Revise!</span>}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{color:PIPE_STAGES[stage]?.color}}>{PIPE_STAGES[stage]?.label}</div>
                    </div>
                    <span className="text-slate-600 text-xs">{exp?"▲":"▼"}</span>
                  </div>
                  {exp&&(
                    <div className="px-3 pb-3 border-t border-slate-800 pt-3">
                      <p className="text-xs text-slate-400 mb-2">{topic.note}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {PIPE_STAGES.map(ps=>(
                          <button key={ps.s} onClick={()=>handlePipe(topic,sub,ps.s as PipelineStage)}
                            className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                            style={{background:ps.s<=stage?`${ps.color}25`:"transparent",color:ps.s<=stage?ps.color:"#64748b",border:`0.5px solid ${ps.s===stage?ps.color:"#334155"}`,fontWeight:ps.s===stage?700:400}}>
                            {ps.short} {ps.label}
                          </button>
                        ))}
                      </div>
                      {prog?.is_done&&rev&&(
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{rev.revision_count??0} revisions</span>
                          <button onClick={()=>markRevised({topicId:topic.id,topicName:topic.n,subject:sub})}
                            className="px-3 py-1 rounded-lg text-xs font-medium" style={{background:`${pc.hex}20`,color:pc.hex,border:`0.5px solid ${pc.hex}60`}}>
                            Mark Revised ↺
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="revision"&&(
        <div className="space-y-2">
          <div className="px-3 py-2.5 bg-purple-950 border border-purple-900 rounded-xl text-xs text-purple-300">
            Spaced Repetition: 1d → 3d → 7d → 15d → 30d. Mark revised after each review.
          </div>
          {overdueRevisions.length>0&&(
            <div>
              <h4 className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">Overdue ({overdueRevisions.length})</h4>
              {(overdueRevisions as any[]).map(r=>(
                <div key={r.id} className="flex items-center gap-3 p-3 bg-red-950 border border-red-900 rounded-xl mb-2">
                  <Clock size={14} className="text-red-400 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{r.topic_name}</p>
                    <p className="text-xs text-red-400">{r.revision_count??0} revisions · {r.subject}</p>
                  </div>
                  <button onClick={()=>markRevised({topicId:r.topic_id,topicName:r.topic_name,subject:r.subject})}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium flex-shrink-0">Revise ✓</button>
                </div>
              ))}
            </div>
          )}
          {upcomingRevisions.length>0&&(
            <div>
              <h4 className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wider mt-3">Due Soon</h4>
              {(upcomingRevisions as any[]).map(r=>{
                const days=Math.ceil((new Date(r.due_at).getTime()-Date.now())/86400000);
                return(
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-emerald-950 border border-emerald-900 rounded-xl mb-2">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{r.topic_name}</p>
                      <p className="text-xs text-emerald-400">Due in {days}d · {r.subject}</p>
                    </div>
                    <button onClick={()=>markRevised({topicId:r.topic_id,topicName:r.topic_name,subject:r.subject})}
                      className="px-3 py-1.5 border border-emerald-700 text-emerald-400 rounded-lg text-xs flex-shrink-0">Revise</button>
                  </div>
                );
              })}
            </div>
          )}
          {overdueRevisions.length===0&&upcomingRevisions.length===0&&(
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={32}/>
              <p className="text-sm text-slate-400">All caught up!</p>
            </div>
          )}
        </div>
      )}

      {tab==="errors"&&(
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {ERROR_TYPES.map(et=>{
              const c=(errorLogs as any[]).filter(e=>e.error_type===et.id).length;
              return(
                <div key={et.id} className="text-center p-2 rounded-lg border border-slate-800 bg-slate-900">
                  <div className="text-lg font-semibold" style={{color:et.hex}}>{c}</div>
                  <div className="text-[10px] text-slate-500">{et.label}</div>
                </div>
              );
            })}
          </div>
          <button onClick={()=>setShowEF(!showEF)}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-sm text-slate-500 hover:text-white hover:border-slate-500 transition-colors">
            + Log Wrong Answer
          </button>
          {showEF&&(
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select value={errForm.sub} onChange={e=>setErrForm(p=>({...p,sub:e.target.value}))}
                  className="col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
                  {Object.keys(TOPICS).map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={errForm.type} onChange={e=>setErrForm(p=>({...p,type:e.target.value}))}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
                  {ERROR_TYPES.map(e=><option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
                <input placeholder="Topic (e.g. PSK, Deadlock)" value={errForm.topic} onChange={e=>setErrForm(p=>({...p,topic:e.target.value}))}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none placeholder-slate-500"/>
              </div>
              <input placeholder="Notes (optional)" value={errForm.notes} onChange={e=>setErrForm(p=>({...p,notes:e.target.value}))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none placeholder-slate-500"/>
              {errForm.type&&(()=>{const et=ERROR_TYPES.find(e=>e.id===errForm.type);return et&&<div className="text-xs px-3 py-2 rounded-lg" style={{background:`${et.hex}15`,color:et.hex}}>💡 {et.fix}</div>;})()}
              <button onClick={handleAddError} className="w-full py-2 bg-white text-slate-950 rounded-lg text-sm font-medium">Save Error</button>
            </div>
          )}
          {(errorLogs as any[]).length===0
            ?<p className="text-xs text-slate-500 text-center py-4">No errors yet.</p>
            :<div className="space-y-1.5">{(errorLogs as any[]).slice(0,20).map((e:any)=>{
                const et=ERROR_TYPES.find(t=>t.id===e.error_type);
                return(
                  <div key={e.id} className="flex items-start gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="w-2 h-2 rounded-sm mt-1 flex-shrink-0" style={{background:et?.hex}}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{e.topic}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{background:`${et?.hex}15`,color:et?.hex}}>{et?.label}</span>
                        <span className="text-[10px] text-slate-500">{e.subject}</span>
                      </div>
                      {e.notes&&<p className="text-xs text-slate-500 mt-0.5">{e.notes}</p>}
                    </div>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{format(new Date(e.created_at),"dd MMM")}</span>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}
    </div>
  );
}
