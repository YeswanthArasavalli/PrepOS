import { useState } from "react";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import { useStudyCalendar } from "../../hooks/useStudyCalendar";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, Circle, Clock, Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react";

export default function PlannerPage() {
  const { profile } = useAuth();
  const { dailyPlan, isLoading, updateTask, addCustomTask, deleteTask, carryForwardUnfinished, regeneratePlan } = useDailyPlan();
  const { recoveryPlan, missedDays, isRecoveryMode, recommendations } = useStudyCalendar();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<"study" | "revision" | "health" | "mock">("study");
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3>(2);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addCustomTask({
      title: newTaskTitle,
      type: newTaskType,
      priority: newTaskPriority,
      scheduled_time: "09:00",
      completed: false,
    });
    setNewTaskTitle("");
  };

  const handleCarryForward = () => {
    carryForwardUnfinished(yesterdayStr);
  };

  const getTaskColor = (type: string, priority: number) => {
    if (type === "health") return "bg-emerald-900/30 border-emerald-800 text-emerald-300";
    if (type === "revision") return "bg-purple-900/30 border-purple-800 text-purple-300";
    if (type === "recovery") return "bg-red-900/30 border-red-800 text-red-300";
    if (priority === 1) return "bg-orange-900/30 border-orange-800 text-orange-300";
    return "bg-slate-800 border-slate-700 text-slate-300";
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "health": return "💪";
      case "revision": return "📚";
      case "study": return "✏️";
      case "mock": return "📝";
      case "recovery": return "🔄";
      default: return "📌";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading today's plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Daily Planner</h1>
          <p className="text-xs text-slate-500 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCarryForward}
            className="px-3 py-2 text-xs font-medium bg-amber-900/30 border border-amber-800 text-amber-300 rounded-lg hover:bg-amber-900/50 transition-colors"
          >
            Carry Forward
          </button>
          <button
            onClick={() => regeneratePlan()}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Regenerate Plan"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Recovery Banner */}
      {isRecoveryMode && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-950/50 border border-red-900 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Recovery Mode Active</p>
            <p className="text-xs text-red-400 mt-0.5">
              You missed {missedDays} days. {recommendations[0] || "Focus on catching up gradually."}
            </p>
            {recommendations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {recommendations.map((rec: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-red-900/30 border border-red-800 text-red-300 rounded">
                    {rec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Card */}
      {dailyPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white">Today's Progress</h2>
            <span className="text-2xl font-semibold text-white">{dailyPlan.completion_pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                dailyPlan.completion_pct >= 80
                  ? "bg-emerald-500"
                  : dailyPlan.completion_pct >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${dailyPlan.completion_pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{(dailyPlan?.tasks || []).filter((t: any) => t.completed).length} completed</span>
            <span>{(dailyPlan?.tasks || []).length} total tasks</span>
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Add Custom Task</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
          <div className="flex gap-2">
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
            >
              <option value="study">Study</option>
              <option value="revision">Revision</option>
              <option value="health">Health</option>
              <option value="mock">Mock</option>
            </select>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(Number(e.target.value) as 1 | 2 | 3)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
            >
              <option value={1}>High Priority</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Today's Tasks</h3>
        {!dailyPlan || dailyPlan.tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No tasks for today. Click "Regenerate" to create a plan.
          </div>
        ) : (
          (dailyPlan?.tasks || []).map((task: any) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                task.completed
                  ? "bg-emerald-950/30 border-emerald-900 opacity-60"
                  : getTaskColor(task.type, task.priority)
              }`}
            >
              <button
                onClick={() => updateTask(task.id, !task.completed)}
                className="flex-shrink-0 text-current"
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTaskIcon(task.type)}</span>
                  <span
                    className={`text-sm font-medium truncate ${
                      task.completed ? "text-emerald-400 line-through" : "text-white"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {task.scheduled_time && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {task.scheduled_time}
                    </span>
                  )}
                  {task.carried_from && (
                    <span className="text-amber-400">Carried from yesterday</span>
                  )}
                  {task.recovery_days && (
                    <span className="text-red-400">
                      Recovery: {task.recovery_days} missed days
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {dailyPlan && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {(dailyPlan?.tasks || []).filter((t: any) => t.type === "study").length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Study</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {(dailyPlan?.tasks || []).filter((t: any) => t.type === "health").length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Health</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {(dailyPlan?.tasks || []).filter((t: any) => t.type === "revision").length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Revision</div>
          </div>
        </div>
      )}
    </div>
  );
}