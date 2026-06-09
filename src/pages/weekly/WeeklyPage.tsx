import { useState } from "react";
import { useWeeklyTargets } from "../../hooks/useWeeklyTargets";
import { Target, TrendingUp, Calendar, CheckCircle, Plus } from "lucide-react";

export default function WeeklyPage() {
  const { weeklyTargets, isLoading, createWeeklyTarget, currentWeek, getCurrentWeekRange } =
    useWeeklyTargets();

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCurrentWeek = () => {
    const range = getCurrentWeekRange();
    const defaultTargets = [
      { topic_id: "pct", subject: "Quant", planned_days: 3, completed_days: 0, status: "pending" },
      { topic_id: "rat", subject: "Quant", planned_days: 2, completed_days: 0, status: "pending" },
      { topic_id: "avg", subject: "Quant", planned_days: 2, completed_days: 0, status: "pending" },
    ];
    createWeeklyTarget({
      week_start: range.start,
      week_end: range.end,
      targets: defaultTargets,
      study_hours_target: 56,
      mocks_target: 7,
      revisions_target: 7,
      status: "active",
    });
    setShowCreateForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading weekly targets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Weekly Targets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Set and track weekly goals
          </p>
        </div>
        {!currentWeek && (
          <button
            onClick={handleCreateCurrentWeek}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Create Week 1
          </button>
        )}
      </div>

      {/* Current Week Card */}
      {currentWeek ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-white">Week 1 — Preparation Starts June 13</span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                currentWeek.status === "completed"
                  ? "bg-emerald-900/30 text-emerald-300"
                  : currentWeek.status === "partial"
                  ? "bg-amber-900/30 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {currentWeek.status === "completed"
                ? "Completed"
                : currentWeek.status === "partial"
                ? "In Progress"
                : "Active"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {currentWeek.study_hours_target}h
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Study Goal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {currentWeek.mocks_target}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Mocks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {currentWeek.revisions_target}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Revisions</div>
            </div>
          </div>

          {currentWeek.success_score !== undefined && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Success Score</span>
                <span className="text-white font-medium">
                  {currentWeek.success_score}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentWeek.success_score >= 80
                      ? "bg-emerald-500"
                      : currentWeek.success_score >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${currentWeek.success_score}%` }}
                />
              </div>
            </div>
          )}

          {/* Targets List */}
          {currentWeek.targets && currentWeek.targets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Week 1 Targets</h4>
              <div className="space-y-2">
                {(currentWeek.targets as any[]).map((target, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <CheckCircle size={10} className={target.completed_days > 0 ? "text-emerald-400" : "text-slate-600"} />
                    <span className="flex-1">{target.subject}: {target.topic_id.toUpperCase()}</span>
                    <span className="text-slate-500">
                      {target.completed_days}/{target.planned_days} days
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-medium text-white mb-2">No Week Created Yet</h3>
          <p className="text-sm text-slate-400 mb-4">
            Your preparation starts on June 13, 2026. Create your first week to begin tracking.
          </p>
          <button
            onClick={handleCreateCurrentWeek}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create Week 1 (June 13-19)
          </button>
        </div>
      )}

      {/* Weekly Targets List */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
          Previous Weeks
        </h3>
        {weeklyTargets.filter(w => w.id !== currentWeek?.id).length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            {currentWeek ? "No previous weeks yet" : "Create your first week to get started"}
          </div>
        ) : (
          <div className="space-y-2">
            {weeklyTargets.filter(w => w.id !== currentWeek?.id).map((week) => (
              <div
                key={week.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Week of {new Date(week.week_start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(week.week_start).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}{" "}
                      -{" "}
                      {new Date(week.week_end).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {week.success_score !== undefined && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          {week.success_score}%
                        </div>
                        <div className="text-[9px] text-slate-500">Score</div>
                      </div>
                    )}
                    <span
                      className={`text-[10px] px-2 py-1 rounded ${
                        week.status === "completed"
                          ? "bg-emerald-900/30 text-emerald-300"
                          : week.status === "partial"
                          ? "bg-amber-900/30 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {week.status}
                    </span>
                  </div>
                </div>

                {/* Targets */}
                {week.targets && week.targets.length > 0 && (
                  <div className="space-y-1">
                    {(week.targets as any[]).slice(0, 3).map((target, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-400"
                      >
                        <CheckCircle size={10} />
                        <span>{target.subject}: {target.topic_id}</span>
                        <span className="text-slate-600">
                          ({target.completed_days}/{target.planned_days} days)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <TrendingUp size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Weekly Success Formula
            </h4>
            <p className="text-xs text-blue-400">
              Study Hours (40%) + Mocks (30%) + Revisions (30%) = Success Score
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Target: 56h study, 7 mocks, 7 revisions per week
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}