import { useSetupChecklist } from "../../hooks/useSetupChecklist";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, Circle, Rocket, Settings } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function SetupPage() {
  const { profile } = useAuth();
  const { setupItems, toggleItem, completionPct, isSetupComplete, remainingItems } =
    useSetupChecklist();

  // Check if we should redirect to main app
  const prepStart = new Date(profile?.prep_start_date || "2026-06-13");
  const today = new Date();
  const canAccessMain = today >= prepStart || isSetupComplete;

  if (canAccessMain && setupItems.length > 0) {
    // Show completion banner but allow access
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings size={32} className="text-blue-400" />
          <h1 className="text-2xl font-semibold text-white">Setup Mode</h1>
          <Rocket size={32} className="text-emerald-400" />
        </div>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Complete these setup tasks before Day 1. No actual studying required —
          just get everything ready for launch.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Setup Progress</h2>
          <span className="text-2xl font-semibold text-white">{completionPct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              completionPct === 100
                ? "bg-emerald-500"
                : completionPct >= 50
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>{setupItems.filter((i) => i.is_complete).length} completed</span>
          <span>{remainingItems} remaining</span>
        </div>
      </div>

      {/* Success Banner */}
      {isSetupComplete && (
        <div className="flex items-start gap-3 px-4 py-3 bg-emerald-950/50 border border-emerald-900 rounded-xl">
          <Rocket size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">
              🚀 System Ready for Day 1!
            </p>
            <p className="text-xs text-emerald-400 mt-0.5">
              All setup tasks complete. You're ready to begin preparation on{" "}
              {new Date(profile?.prep_start_date || "").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              .
            </p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Setup Checklist
        </h3>
        {setupItems.map((item) => (
          <div
            key={item.item_id}
            onClick={() => toggleItem(item.item_id, !item.is_complete)}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              item.is_complete
                ? "bg-emerald-950/30 border-emerald-900"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex-shrink-0">
              {item.is_complete ? (
                <CheckCircle2 size={20} className="text-emerald-400" />
              ) : (
                <Circle size={20} className="text-slate-600" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={`text-sm font-medium ${
                  item.is_complete ? "text-emerald-300 line-through" : "text-white"
                }`}
              >
                {item.label}
              </span>
              {item.completed_at && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Completed{" "}
                  {new Date(item.completed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Setup Day</h4>
          <p className="text-xs text-blue-400">
            June 12 is for setup only. Arrange books, PDFs, workspace, and apps.
            No studying required.
          </p>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-emerald-300 mb-2">Day 1 Launch</h4>
          <p className="text-xs text-emerald-400">
            June 13 begins actual preparation. Morning walk, exercise, then
            Percentage + Reasoning.
          </p>
        </div>
      </div>
    </div>
  );
}