import { useReadinessEngine } from "../../hooks/useReadinessEngine";
import { useEventEngine } from "../../hooks/useEventEngine";
import { useAdaptiveRouting } from "../../hooks/useAdaptiveRouting";
import { useAntiLazy } from "../../hooks/useAntiLazy";
import { useExecutionMode } from "../../hooks/useExecutionMode";
import { useHealthV2 } from "../../hooks/useHealthV2";
import { usePriorities } from "../../hooks/usePriorities";
import { useRevisionCommand } from "../../hooks/useRevisionCommand";
import { useAutoTimeBlocking } from "../../hooks/useAutoTimeBlocking";
import { Trophy, TrendingUp, AlertTriangle, Target, Clock, CheckCircle, Zap, Activity, Calendar, BookOpen } from "lucide-react";

export default function UltimateDashboard() {
  const readiness = useReadinessEngine();
  const events = useEventEngine();
  const routing = useAdaptiveRouting();
  const antilazy = useAntiLazy();
  const execution = useExecutionMode();
  const health = useHealthV2();
  const priorities = usePriorities();
  const revision = useRevisionCommand();
  const timetable = useAutoTimeBlocking();

  return (
    <div className="space-y-4">
      {/* Header - Minimal */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} />
              PrepOS Ultimate
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Day {readiness.day}/140 • {readiness.isPrepMode ? "Preparation Mode" : "Setup Mode"}
            </p>
          </div>
          {!readiness.isPrepMode && (
            <div className="text-right">
              <div className="text-xs px-2 py-1 bg-amber-900/50 text-amber-400 rounded">SETUP MODE</div>
            </div>
          )}
        </div>
      </div>

      {/* Execution/Recovery Alerts */}
      {execution.isOverPlanning && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-950/50 border border-red-900 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">EXECUTION MODE ALERT</p>
            <p className="text-xs text-red-400 mt-0.5">{execution.message}</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-red-300">Planning: {execution.planningHours}h</span>
              <span className="text-emerald-300">Study: {execution.studyHours}h</span>
              <span className="text-amber-300">Ratio: {execution.ratio.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      {antilazy.isRecovering && (
        <div className={`px-4 py-3 border rounded-xl ${
          antilazy.recoveryMode === 'rebuild' ? 'bg-red-950/50 border-red-900' :
          antilazy.recoveryMode === 'emergency' ? 'bg-amber-950/50 border-amber-900' :
          'bg-orange-950/50 border-orange-900'
        }`}>
          <p className="text-sm font-medium text-white">{antilazy.getRecoveryRecommendations().title}</p>
          <p className="text-xs text-slate-300 mt-0.5">{antilazy.getRecoveryRecommendations().message}</p>
        </div>
      )}

      {/* GAP 1: Today's Top Tasks (EXECUTION FIRST) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Target size={16} className="text-emerald-400" />
            Today's Top Tasks
          </h3>
          {revision.hasOverdueRevisions && (
            <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded flex items-center gap-1">
              <AlertTriangle size={10} />
              {revision.overdue.length} Overdue
            </span>
          )}
        </div>
        {revision.overdue.length > 0 && (
          <div className="mb-3 p-3 bg-red-950/30 border border-red-900 rounded-lg">
            <p className="text-xs text-red-400 font-medium">⚠️ Revision Priority Rule</p>
            <p className="text-[10px] text-red-300 mt-0.5">
              Overdue Revision > Weak Topic > New Topic. Complete these before starting anything new.
            </p>
          </div>
        )}
        <div className="space-y-2">
          {priorities.priorities.slice(0, 3).map((task, i) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                task.priority === 1 ? 'bg-red-900 text-red-400' :
                task.priority === 2 ? 'bg-amber-900 text-amber-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{task.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{task.reason}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Priority Score: {task.priorityScore?.toFixed(1) || 'N/A'} 
                  {task.priorityScore && (
                    <span className="ml-2">
                      (Weak {task.priorityComponents?.weakness}% + Rev {task.priorityComponents?.revision}% + Exam {task.priorityComponents?.exam}% + Mock {task.priorityComponents?.mock}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{task.estimatedMinutes}m</div>
                <div className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 mt-1">
                  {task.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GAP 2: Revision Due Today */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            Revision Due
          </h3>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">
              {revision.overdue.length} Overdue
            </span>
            <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded">
              {revision.dueToday.length} Today
            </span>
          </div>
        </div>
        {revision.highestPriority ? (
          <div className="p-3 bg-red-950/30 border border-red-900 rounded-lg mb-3">
            <div className="text-xs text-red-400 mb-1">⚠️ Highest Priority</div>
            <div className="text-sm text-white font-medium">{revision.highestPriority.topicName}</div>
            <div className="text-xs text-slate-400 mt-1">
              Overdue by {revision.highestPriority.overdueDays} days • {revision.highestPriority.subject}
            </div>
          </div>
        ) : revision.dueToday.length > 0 ? (
          <div className="space-y-2">
            {revision.dueToday.slice(0, 3).map((rev, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{rev.topicName}</div>
                  <div className="text-[10px] text-slate-400">{rev.subject} • Due today</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-emerald-400">
            <CheckCircle size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-slate-500 mt-0.5">No revisions due</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-2 bg-slate-800 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-400">{revision.revisionScore}%</div>
            <div className="text-[9px] text-slate-500">Revision Score</div>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-center">
            <div className="text-lg font-bold text-amber-400">{revision.totalDebt}</div>
            <div className="text-[9px] text-slate-500">Total Debt</div>
          </div>
        </div>
      </div>

      {/* GAP 3: Health Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            Health V2 Status
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-400">{health.weekly}%</div>
            <div className="text-[10px] text-slate-500">Weekly Avg</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {health.breakdown.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold" style={{ color: item.value >= 80 ? '#1A8F68' : item.value >= 50 ? '#B06B0F' : '#C94B2A' }}>
                {item.value}%
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">{item.label.split(' ')[0]}</div>
              <div className="text-[8px] text-slate-600">{item.weight}%</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {antilazy.streaks.map(streak => (
            <div key={streak.type} className="flex-shrink-0 text-center px-2 py-1.5 bg-slate-800 rounded-lg">
              <div className="text-sm mb-0.5">{streak.icon}</div>
              <div className={`text-base font-bold ${
                streak.current >= 7 ? 'text-emerald-400' :
                streak.current >= 3 ? 'text-amber-400' :
                streak.current > 0 ? 'text-blue-400' : 'text-slate-600'
              }`}>
                {streak.current}
              </div>
              <div className="text-[8px] text-slate-500">{streak.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GAP 4: Today's Timetable (Auto-Generated) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            Today's Schedule
          </h3>
          <span className="text-xs text-slate-400">Auto-generated</span>
        </div>
        <div className="space-y-2">
          {timetable.blocks.slice(0, 6).map((block, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-400 w-16 flex-shrink-0">{block.time}</div>
              <div className={`w-1 h-8 rounded-full ${
                block.type === 'study' ? 'bg-emerald-500' :
                block.type === 'health' ? 'bg-blue-500' :
                block.type === 'break' ? 'bg-slate-600' : 'bg-purple-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm text-white">{block.activity}</div>
                <div className="text-[10px] text-slate-500">{block.subject || block.duration}</div>
              </div>
            </div>
          ))}
          {timetable.blocks.length > 6 && (
            <div className="text-center text-xs text-slate-500 mt-2">
              +{timetable.blocks.length - 6} more blocks (full timetable)
            </div>
          )}
        </div>
      </div>

      {/* GAP 5: Today's Allocation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Subject Allocation
          </h3>
          <span className="text-xs text-slate-400">
            {routing.weakSubjects.length} weak subjects
          </span>
        </div>
        <div className="space-y-3">
          {routing.allocations.map(alloc => (
            <div key={alloc.subject}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{alloc.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: alloc.color }}>{alloc.label}</span>
                  <span className="text-xs font-bold" style={{ color: alloc.color }}>{alloc.adjustedAllocation}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${alloc.adjustedAllocation}%`, backgroundColor: alloc.color }}
                />
              </div>
              {alloc.reason && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {alloc.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GAP 6: Weekly Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Weekly Progress</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-400">{execution.weeklyScore}</div>
            <div className="text-[10px] text-slate-500">Execution Score</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">{health.weekly}%</div>
            <div className="text-[10px] text-slate-500">Health Avg</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-800 rounded-lg">
            <div className="text-sm font-bold text-white">{execution.studyHours}h</div>
            <div className="text-[9px] text-slate-500">Study</div>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg">
            <div className="text-sm font-bold text-white">{execution.planningHours}h</div>
            <div className="text-[9px] text-slate-500">Planning</div>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg">
            <div className="text-sm font-bold text-white">{execution.ratio.toFixed(2)}</div>
            <div className="text-[9px] text-slate-500">Ratio</div>
          </div>
        </div>
      </div>

      {/* GAP 7: Readiness (Last - Analytics) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Exam Readiness</h3>
          <span className="text-[10px] text-slate-500">Analytics</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "SSC CGL", value: readiness.readiness.cgl, color: "text-red-400" },
            { label: "Coal India", value: readiness.readiness.coal, color: "text-amber-400" },
            { label: "UGC NET", value: readiness.readiness.net, color: "text-purple-400" },
            { label: "UPSC JAD", value: readiness.readiness.jad, color: "text-violet-400" },
          ].map(exam => (
            <div key={exam.label} className="text-center p-2 bg-slate-800 rounded-lg">
              <div className={`text-xl font-bold ${exam.color}`}>{exam.value}%</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{exam.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Triggers */}
      {events.hasActiveEvents && (
        {[
          { label: "SSC CGL", value: readiness.readiness.cgl, color: "text-red-400" },
          { label: "Coal India", value: readiness.readiness.coal, color: "text-amber-400" },
          { label: "UGC NET", value: readiness.readiness.net, color: "text-purple-400" },
          { label: "UPSC JAD", value: readiness.readiness.jad, color: "text-violet-400" },
        ].map(exam => (
          <div key={exam.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${exam.color}`}>{exam.value}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{exam.label}</div>
          </div>
        ))}
      </div>

      {/* Health V2 Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            Health V2
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-400">{health.weekly}%</div>
            <div className="text-[10px] text-slate-500">Weekly Avg</div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {health.breakdown.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold" style={{ color: item.value >= 80 ? '#1A8F68' : item.value >= 50 ? '#B06B0F' : '#C94B2A' }}>
                {item.value}%
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">{item.label.split(' ')[0]}</div>
              <div className="text-[8px] text-slate-600">{item.weight}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Streaks (Anti-Lazy Engine)</h3>
        <div className="flex gap-2 overflow-x-auto">
          {antilazy.streaks.map(streak => (
            <div key={streak.type} className="flex-shrink-0 text-center px-3 py-2 bg-slate-800 rounded-lg">
              <div className="text-xl mb-1">{streak.icon}</div>
              <div className={`text-lg font-bold ${
                streak.current >= 7 ? 'text-emerald-400' :
                streak.current >= 3 ? 'text-amber-400' :
                streak.current > 0 ? 'text-blue-400' : 'text-slate-600'
              }`}>
                {streak.current}
              </div>
              <div className="text-[9px] text-slate-500">{streak.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptive Routing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Today's Allocation
          </h3>
          <span className="text-xs text-slate-400">
            {routing.weakSubjects.length} weak subjects
          </span>
        </div>
        <div className="space-y-3">
          {routing.allocations.map(alloc => (
            <div key={alloc.subject}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{alloc.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: alloc.color }}>{alloc.label}</span>
                  <span className="text-xs font-bold" style={{ color: alloc.color }}>{alloc.adjustedAllocation}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${alloc.adjustedAllocation}%`, backgroundColor: alloc.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revision Command */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            Revision Queue
          </h3>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">
              {revision.overdue.length} Overdue
            </span>
            <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded">
              {revision.dueToday.length} Today
            </span>
          </div>
        </div>
        {revision.highestPriority && (
          <div className="p-3 bg-red-950/30 border border-red-900 rounded-lg mb-3">
            <div className="text-xs text-red-400 mb-1">⚠️ Highest Priority</div>
            <div className="text-sm text-white font-medium">{revision.highestPriority.topicName}</div>
            <div className="text-xs text-slate-400 mt-1">
              Overdue by {revision.highestPriority.overdueDays} days • {revision.highestPriority.subject}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-slate-800 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">{revision.revisionScore}%</div>
            <div className="text-[10px] text-slate-500">Revision Score</div>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg">
            <div className="text-lg font-bold text-amber-400">{revision.totalDebt}</div>
            <div className="text-[10px] text-slate-500">Revision Debt</div>
          </div>
        </div>
      </div>

      {/* Event Triggers */}
      {events.hasActiveEvents && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Active Events</h3>
          <div className="space-y-2">
            {events.events.filter(e => e.occurred).map(event => (
              <div key={event.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{event.icon}</span>
                  <span className="text-sm text-white font-medium">{event.label}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {event.actions[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Freeze Mode Indicator */}
      {readiness.isPrepMode && (
        <div className="text-center py-3 px-4 bg-emerald-950/30 border border-emerald-900 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium">🔒 EXECUTION MODE ACTIVE</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            System locked. Only study, revise, mock, and analyze allowed.
          </p>
        </div>
      )}
    </div>
  );
}