import { useState } from "react";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import { Clock, CheckCircle, Circle, Plus, Trash2, Sun, Moon, Coffee, BookOpen, Dumbbell } from "lucide-react";

export default function TimetablePage() {
  const { dailyPlan, updateTask, addCustomTask } = useDailyPlan();
  
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    time: "08:00",
    activity: "",
    type: "study" as "study" | "health" | "break" | "mock" | "revision",
    duration: 60,
  });

  // Pre-defined timetable slots based on V5.1
  const defaultTimetable = [
    { time: "05:00", activity: "Wake Up + 300ml Water", type: "health", duration: 15, icon: "🌅" },
    { time: "05:15", activity: "Morning Walk 3km", type: "health", duration: 75, icon: "🏃" },
    { time: "06:30", activity: "Exercise + Strength Training", type: "health", duration: 30, icon: "💪" },
    { time: "07:00", activity: "Bath + Breakfast + Water", type: "break", duration: 30, icon: "🚿" },
    { time: "07:30", activity: "Study Session 1 (Quant/Reasoning)", type: "study", duration: 90, icon: "📚" },
    { time: "09:00", activity: "Break + Water + Walk", type: "break", duration: 15, icon: "☕" },
    { time: "09:15", activity: "Study Session 2 (Reasoning/English)", type: "study", duration: 75, icon: "📚" },
    { time: "10:30", activity: "Step Booster Walk", type: "health", duration: 10, icon: "🚶" },
    { time: "10:45", activity: "Study Session 3 (GK/English)", type: "study", duration: 60, icon: "📚" },
    { time: "11:45", activity: "Lunch + Water", type: "break", duration: 45, icon: "🍽️" },
    { time: "12:30", activity: "Power Nap", type: "break", duration: 20, icon: "😴" },
    { time: "13:00", activity: "Study Session 4 (CS Technical)", type: "study", duration: 90, icon: "💻" },
    { time: "14:30", activity: "Error Log + Revision", type: "revision", duration: 30, icon: "📝" },
    { time: "15:00", activity: "Evening Walk + Water", type: "health", duration: 15, icon: "🚶" },
    { time: "15:15", activity: "Study Session 5 (Mock/PYQs)", type: "mock", duration: 60, icon: "📊" },
    { time: "16:15", activity: "Free Time / Buffer", type: "break", duration: 45, icon: "⏰" },
    { time: "17:00", activity: "Revision of Morning Topics", type: "revision", duration: 60, icon: "🔄" },
    { time: "18:00", activity: "Evening Break", type: "break", duration: 60, icon: "🎧" },
    { time: "19:00", activity: "Dinner + Water", type: "break", duration: 30, icon: "🍽️" },
    { time: "19:30", activity: "Light Revision / Flashcards", type: "revision", duration: 30, icon: "📇" },
    { time: "20:00", activity: "Plan Tomorrow + Wrap-up", type: "break", duration: 30, icon: "📋" },
    { time: "20:30", activity: "Free Time / Family", type: "break", duration: 90, icon: "👨‍👩‍👧" },
    { time: "22:00", activity: "Sleep (7-8 hours)", type: "break", duration: 420, icon: "😴" },
  ];

  const handleAddSlot = () => {
    if (!newSlot.activity.trim()) return;
    addCustomTask({
      title: newSlot.activity,
      type: newSlot.type,
      priority: 2,
      scheduled_time: newSlot.time,
      completed: false,
    });
    setShowAddSlot(false);
    setNewSlot({ time: "08:00", activity: "", type: "study", duration: 60 });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "study": return "bg-blue-900/30 border-blue-800 text-blue-300";
      case "health": return "bg-emerald-900/30 border-emerald-800 text-emerald-300";
      case "break": return "bg-amber-900/30 border-amber-800 text-amber-300";
      case "mock": return "bg-purple-900/30 border-purple-800 text-purple-300";
      case "revision": return "bg-orange-900/30 border-orange-800 text-orange-300";
      default: return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      study: "📚",
      health: "💪",
      break: "☕",
      mock: "📊",
      revision: "🔄",
    };
    return icons[type] || "📌";
  };

  const getTotalStudyHours = () => {
    const studySlots = defaultTimetable.filter(s => s.type === "study");
    const totalMinutes = studySlots.reduce((sum, slot) => sum + slot.duration, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const getTotalHealthActivities = () => {
    return defaultTimetable.filter(s => s.type === "health").length;
  };

  const getTotalRevisionTime = () => {
    const revisionSlots = defaultTimetable.filter(s => s.type === "revision");
    const totalMinutes = revisionSlots.reduce((sum, slot) => sum + slot.duration, 0);
    return totalMinutes;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Daily Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete time-blocked schedule for maximum productivity
          </p>
        </div>
        <button
          onClick={() => setShowAddSlot(!showAddSlot)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={14} />
          Add Slot
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-semibold text-blue-400">{getTotalStudyHours()}h</div>
          <div className="text-[10px] text-blue-300 mt-0.5">Study Time</div>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-semibold text-emerald-400">{getTotalHealthActivities()}</div>
          <div className="text-[10px] text-emerald-300 mt-0.5">Health Activities</div>
        </div>
        <div className="bg-orange-900/30 border border-orange-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-semibold text-orange-400">{getTotalRevisionTime()}m</div>
          <div className="text-[10px] text-orange-300 mt-0.5">Revision Time</div>
        </div>
      </div>

      {/* Add Slot Form */}
      {showAddSlot && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={newSlot.time}
              onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
            />
            <select
              value={newSlot.type}
              onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
            >
              <option value="study">Study</option>
              <option value="health">Health</option>
              <option value="break">Break</option>
              <option value="mock">Mock</option>
              <option value="revision">Revision</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Activity (e.g., Quant PYQs, Morning Walk)"
            value={newSlot.activity}
            onChange={(e) => setNewSlot({ ...newSlot, activity: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newSlot.duration || ""}
              onChange={(e) => setNewSlot({ ...newSlot, duration: Number(e.target.value) })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddSlot(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Time-Blocked Schedule (5AM - 10PM)
        </h3>
        {defaultTimetable.map((slot, index) => {
          const isSleep = slot.activity.includes("Sleep");
          const isWake = slot.activity.includes("Wake");
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getTypeColor(slot.type)} ${
                isSleep ? "opacity-50" : ""
              } ${isWake ? "ring-2 ring-emerald-500" : ""}`}
            >
              <div className="flex-shrink-0 text-center min-w-[60px]">
                <div className="text-sm font-mono font-semibold">{slot.time}</div>
                <div className="text-[10px] opacity-70">{slot.duration}m</div>
              </div>
              
              <div className="text-xl">{slot.icon}</div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">{slot.activity}</div>
                <div className="text-[10px] opacity-70 capitalize">{slot.type}</div>
              </div>

              {slot.type === "study" && (
                <div className="text-[10px] px-2 py-1 bg-blue-800/50 rounded">
                  Focus
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-emerald-300 mb-2 flex items-center gap-2">
            <Sun size={14} />
            Morning Routine
          </h4>
          <div className="text-xs text-emerald-400 space-y-1">
            <div>✅ Wake at 5:00 AM sharp</div>
            <div>✅ 3km brisk walk</div>
            <div>✅ 20-30 min exercise</div>
            <div>✅ Cold water splash</div>
          </div>
        </div>
        <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
            <BookOpen size={14} />
            Study Blocks
          </h4>
          <div className="text-xs text-blue-400 space-y-1">
            <div>📚 5 focused sessions</div>
            <div>⏱️ 25+5 Pomodoro cycles</div>
            <div>🎯 P1 topics in morning</div>
            <div>📝 PYQs after each topic</div>
          </div>
        </div>
        <div className="bg-amber-950/30 border border-amber-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-amber-300 mb-2 flex items-center gap-2">
            <Coffee size={14} />
            Break Strategy
          </h4>
          <div className="text-xs text-amber-400 space-y-1">
            <div>☕ 5-15 min between sessions</div>
            <div>🚶 Walk during long breaks</div>
            <div>💧 Hydrate every break</div>
            <div>😴 20-min power nap after lunch</div>
          </div>
        </div>
        <div className="bg-purple-950/30 border border-purple-900 rounded-xl p-4">
          <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
            <Moon size={14} />
            Evening Wind-down
          </h4>
          <div className="text-xs text-purple-400 space-y-1">
            <div>🍽️ Light dinner by 7:30 PM</div>
            <div>📇 Flashcard revision</div>
            <div>📋 Plan tomorrow</div>
            <div>😴 Sleep by 10:00 PM</div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">⚡ Pro Tips for Maximum Productivity</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Follow the timetable strictly for first 21 days to build habit</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Use phone timer for Pomodoro (25 min study + 5 min break)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Keep water bottle visible - sip every 15-20 minutes</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>No phone during study blocks - keep in another room</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Power nap exactly 20 min - set multiple alarms</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Evening revision should be light - no new topics</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Sleep 7-8 hours non-negotiable - critical for memory</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Sunday: Reduce to 4h study, increase rest & family time</span>
          </div>
        </div>
      </div>

      {/* Weekly Variation */}
      <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-3">📅 Weekly Schedule Variation</h4>
        <div className="space-y-2 text-xs text-blue-400">
          <div className="flex justify-between items-center">
            <span><strong>Mon-Sat:</strong> Full schedule (6-8h study)</span>
            <span className="px-2 py-1 bg-blue-800/50 rounded">Regular Days</span>
          </div>
          <div className="flex justify-between items-center">
            <span><strong>Sunday:</strong> 50% study + 50% rest</span>
            <span className="px-2 py-1 bg-emerald-800/50 rounded">Recovery Day</span>
          </div>
          <div className="flex justify-between items-center">
            <span><strong>Mock Days (3x/week):</strong> Replace Session 5 with full mock</span>
            <span className="px-2 py-1 bg-purple-800/50 rounded">Test Days</span>
          </div>
          <div className="flex justify-between items-center">
            <span><strong>Revision Days:</strong> No new topics, only revision</span>
            <span className="px-2 py-1 bg-orange-800/50 rounded">Consolidation</span>
          </div>
        </div>
      </div>
    </div>
  );
}