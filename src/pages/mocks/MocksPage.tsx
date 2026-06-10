import { useState }      from "react";
import { usePrepData }   from "../../hooks/usePrepData";
import { EXAMS, EXAM_INTEL } from "../../lib/constants";
import { readinessColor }   from "../../lib/formulas";
import type { MockScoreInput, ExamId } from "../../hooks/usePrepData";
import { format }        from "date-fns";
import { Trash2, Edit2, Check, X } from "lucide-react";

export default function MocksPage() {
  const { mockScores, addMock, updateMock, deleteMock } = usePrepData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({exam:"cgl" as ExamId,score:"",total:"",notes:""});

  const handleAdd = () => {
    if(!form.score||!form.total) return;
    addMock({exam_id:form.exam,test_date:format(new Date(),"yyyy-MM-dd"),score:+form.score,total:+form.total,notes:form.notes||undefined} as MockScoreInput);
    setShowForm(false); 
    setForm({exam:"cgl",score:"",total:"",notes:""});
  };

  const handleEdit = (mock: any) => {
    setEditingId(mock.id);
    setForm({exam:mock.exam_id,score:String(mock.score),total:String(mock.total),notes:mock.notes||""});
    setShowForm(true);
  };

  const handleUpdate = () => {
    if(!editingId||!form.score||!form.total) return;
    updateMock(editingId, {exam_id:form.exam,score:+form.score,total:+form.total,notes:form.notes||undefined});
    setEditingId(null);
    setShowForm(false);
    setForm({exam:"cgl",score:"",total:"",notes:""});
  };

  const handleDelete = (id: string) => {
    if(confirm("Delete this mock score?")) {
      deleteMock(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({exam:"cgl",score:"",total:"",notes:""});
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[{stage:"Topic Tests",start:"Day 7",target:"80%+",c:"text-emerald-400"},{stage:"Sectional",start:"Day 15",target:"70%+",c:"text-blue-400"},{stage:"Mini Mocks",start:"Day 25",target:"65%+",c:"text-amber-400"},{stage:"Full Mocks",start:"Day 40",target:"Exam target",c:"text-red-400"}].map(m=>(
          <div key={m.stage} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className={`text-xs font-medium mb-0.5 ${m.c}`}>{m.stage}</div>
            <div className="text-[10px] text-slate-500">From {m.start} · Target: <span className="text-slate-300">{m.target}</span></div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Mock Score Log</h3>
          <button onClick={()=>setShowForm(!showForm)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium">
            {editingId ? "Edit Score" : "+ Add Score"}
          </button>
        </div>
        {showForm&&(
          <div className="space-y-3 mb-4 pb-4 border-b border-slate-800">
            <select value={form.exam} onChange={e=>setForm(p=>({...p,exam:e.target.value as ExamId}))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
              {EXAMS.map(e=><option key={e.id} value={e.id}>{e.n}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Score" value={form.score} onChange={e=>setForm(p=>({...p,score:e.target.value}))}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"/>
              <input type="number" placeholder="Total" value={form.total} onChange={e=>setForm(p=>({...p,total:e.target.value}))}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"/>
            </div>
            <input placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"/>
            <div className="grid grid-cols-2 gap-2">
              {editingId ? (
                <>
                  <button onClick={handleUpdate} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium">
                    <Check size={16} className="inline mr-1"/> Update
                  </button>
                  <button onClick={cancelEdit} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium">
                    <X size={16} className="inline mr-1"/> Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleAdd} className="w-full py-2 bg-white text-slate-950 rounded-lg text-sm font-medium hover:bg-slate-100">
                  Save Score
                </button>
              )}
            </div>
          </div>
        )}
        {mockScores.length===0
          ? <p className="text-xs text-slate-500 text-center py-4">No mock scores yet. Start from Day 7.</p>
          : <div className="space-y-2">{mockScores.slice(0,15).map((m:any)=>{
              const exam=EXAMS.find(e=>e.id===m.exam_id),intel=EXAM_INTEL[m.exam_id],pct=m.accuracy_pct,col=readinessColor(pct);
              const safe=intel&&pct>=(intel.safe/exam!.total*100);
              return(
                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:col}}/>
                  <span className="text-xs text-slate-300 flex-1">{exam?.n}</span>
                  <span className="text-xs text-slate-500">{format(new Date(m.test_date),"dd MMM")}</span>
                  <span className="text-sm font-semibold" style={{color:col}}>{m.score}/{m.total}</span>
                  <span className="text-xs" style={{color:col}}>{pct}%</span>
                  {intel&&<span className={`text-[9px] px-1.5 py-0.5 rounded ${safe?"bg-emerald-950 text-emerald-400":"bg-red-950 text-red-400"}`}>{safe?"≥Safe":"<Safe"}</span>}
                  <div className="flex gap-1">
                    <button onClick={()=>handleEdit(m)} className="p-1 hover:bg-slate-800 rounded text-blue-400">
                      <Edit2 size={12}/>
                    </button>
                    <button onClick={()=>handleDelete(m.id)} className="p-1 hover:bg-slate-800 rounded text-red-400">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}