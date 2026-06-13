import { useState } from "react";
import { usePrepData } from "../../hooks/usePrepData";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, CheckCircle, Clock, BookOpen, Dumbbell, Utensils, Brain, Target } from "lucide-react";

interface DailyActivity {
  id: string;
  log_date: string;
  activity_type: "study" | "health" | "revision" | "mock" | "break" | "other";
  title: string;
  subject?: string;
  topic?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes?: string;
}

export default function DailyLogPage() {
  const { studyLogs, addStudyLog, updateStudyLog, deleteStudyLog, healthLogs } = usePrepData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    activity_type: "study" as DailyActivity["activity_type"],
    title: "",
    subject: "",
    topic: "",
    start_time: format(new Date(), "HH:mm"),
    end_time: format(new Date(), "HH:mm"),
    notes: "",
  });

  const calculateDuration = (start: string, end: string): number => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const handleAdd = () => {
    const duration = calculateDuration(form.start_time, form.end_time);
    if (duration <= 0 || !form.title) return;

    const payload: any = {
      log_date: format(new Date(), "yyyy-MM-dd"),
      subject: form.subject || "General",
      topic_name: form.title,
      hours: duration / 60,
      questions_solved: 0,
      pyqs_solved: 0,
      accuracy_pct: 100,
      notes: form.notes || undefined,
      activity_type: form.activity_type,
    };

    if (editingId) {
      updateStudyLog(editingId, payload);
      setEditingId(null);
    } else {
      addStudyLog(payload);
    }

    setShowForm(false);
    setForm({
      activity_type: "study",
      title: "",
      subject: "",
      topic: "",
      start_time: format(new Date(), "HH:mm"),
      end_time: format(new Date(), "HH:mm"),
      notes: "",
    });
  };

  const handleEdit = (log: any) => {
    setEditingId(log.id);
    setForm({
      activity_type: log.activity_type || "study",
      title: log.topic_name || log.subject || "",
      subject: log.subject || "",
      topic: log.topic || "",
      start_time: log.start_time || "09:00",
      end_time: log.end_time || "10:00",
      notes: log.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this activity log?")) {
      deleteStudyLog(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      activity_type: "study",
      title: "",
      subject: "",
      topic: "",
      start_time: format(new Date(), "HH:mm"),
      end_time: format(new Date(), "HH:mm"),
      notes: "",
    });
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLogs = Array.isArray(studyLogs) ? studyLogs.filter((log: any) => log.log_date === today) : [];
  const totalStudyHours = todayLogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
  
  const todayHealth = Array.isArray(healthLogs) ? healthLogs.find((log: any) => log.log_date === today) : undefined;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "study": return <BookOpen size={16} className="text-blue-400" />;
      case "health": return <Dumbbell size={16} className="text-emerald-400" />;
      case "revision": return <Clock size={16} className="text-amber-400" />;
      case "mock": return <Target size={16} className="text-red-400" />;
      case "break": return <Utensils size={16} className="text-slate-400" />;
      default: return <Brain size={16} className="text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalStudyHours.toFixed(1)}h</div>
          <div className="text-xs text-slate-500 mt-1">Study Time</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{todayLogs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Activities</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{todayHealth ? "✓" : "—"}</div>
          <div className="text-xs text-slate-500 mt-1">Health Logged</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {todayLogs.filter((l: any) => l.subject === "Quant").length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Quant Sessions</div>
        </div>
      </div>

      {/* Health Summary for Today */}
      {todayHealth && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Dumbbell size={16} className="text-emerald-400" />
            Today's Health
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-white">{todayHealth.sleep_hours || 0}h</div>
              <div className="text-[10px] text-slate-500">Sleep</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{todayHealth.water_liters || 0}L</div>
              <div className="text-[10px] text-slate-500">Water</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{todayHealth.exercise_minutes || 0}m</div>
              <div className="text-[10px] text-slate-500">Exercise</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Today's Activities</h3>
        <button
          onClick={() => {
            if (editingId) cancelEdit();
            else setShowForm(!showForm);
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
        >
          <Plus size={14} /> {editingId ? "Cancel Edit" : "Add Activity"}
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">{editingId ? "Edit Activity" : "Add New Activity"}</h4>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Activity Type</label>
              <select
                value={form.activity_type}
                onChange={(e) => setForm({ ...form, activity_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              >
                <option value="study">Study Session</option>
                <option value="revision">Revision</option>
                <option value="mock">Mock Test</option>
                <option value="health">Health/Exercise</option>
                <option value="break">Break/Meal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What did you do?"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          {(form.activity_type === "study" || form.activity_type === "revision") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Quant, Reasoning, etc."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Topic name"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">End Time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you learn? Any challenges?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
          >
            {editingId ? "Update Activity" : "Save Activity"}
          </button>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        {todayLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No activities logged yet. Click "Add Activity" to start tracking your day!
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs
              .sort((a: any, b: any) => (a.created_at || "").localeCompare(b.created_at || ""))
              .map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700"
                >
                  {getActivityIcon(log.activity_type || "study")}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">{log.topic_name || log.subject}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{log.hours.toFixed(1)}h</span>
                        <button onClick={() => handleEdit(log)} className="p-1 hover:bg-slate-700 rounded text-blue-400">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(log.id)} className="p-1 hover:bg-slate-700 rounded text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {log.subject && (
                      <div className="text-xs text-slate-400 mb-1">
                        {log.subject}
                        {log.topic_name && log.topic_name !== log.subject && ` • ${log.topic_name}`}
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      {format(new Date(log.log_date), "MMM dd")}
                      {log.notes && <div className="text-slate-400 mt-1 italic">{log.notes}</div>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick Stats by Subject */}
      {todayLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Subject Breakdown</h3>
          <div className="space-y-2">
            {["Quant", "Reasoning", "English", "GK", "CS"].map((subject) => {
              const subjectLogs = todayLogs.filter((l: any) => l.subject === subject);
              const hours = subjectLogs.reduce((sum: number, l: any) => sum + (l.hours || 0), 0);
              if (hours === 0) return null;
              return (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{subject}</span>
                  <span className="text-xs font-bold text-white">{hours.toFixed(1)}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}