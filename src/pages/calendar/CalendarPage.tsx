import { useState } from "react";
import { useStudyCalendar } from "../../hooks/useStudyCalendar";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const { calendarDays, upsertDay, getMonthData, getStats, recoveryPlan, isRecoveryMode } = useStudyCalendar();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const stats = getStats();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDayType = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const day = calendarDays.find((d) => d.calendar_date === dateStr);
    return day?.day_type || null;
  };

  const getDayColor = (dayType: string | null) => {
    switch (dayType) {
      case "study": return "bg-blue-900/50 border-blue-800 text-blue-300";
      case "mock": return "bg-purple-900/50 border-purple-800 text-purple-300";
      case "revision": return "bg-amber-900/50 border-amber-800 text-amber-300";
      case "rest": return "bg-emerald-900/50 border-emerald-800 text-emerald-300";
      case "missed": return "bg-red-900/50 border-red-800 text-red-300";
      default: return "bg-slate-800/30 border-slate-700 text-slate-600";
    }
  };

  const getDayLabel = (dayType: string | null) => {
    switch (dayType) {
      case "study": return "📚";
      case "mock": return "📝";
      case "revision": return "🔄";
      case "rest": return "😴";
      case "missed": return "❌";
      default: return "";
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const currentType = getDayType(date);
    
    const types: Array<"study" | "mock" | "revision" | "rest" | "missed"> = 
      ["study", "mock", "revision", "rest", "missed"];
    
    const currentIndex = currentType ? types.indexOf(currentType as any) : -1;
    const nextType = types[(currentIndex + 1) % types.length];
    
    upsertDay({
      calendar_date: dateStr,
      day_type: nextType,
      study_hours: nextType === "study" ? 6 : 0,
      mocks_done: nextType === "mock" ? 1 : 0,
      health_score: nextType === "rest" ? 100 : 0,
      execution_score: 0,
    });
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const monthData = getMonthData(currentMonth.year, currentMonth.month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Study Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track study days, mocks, revisions, and rest
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm font-medium text-white">
            {monthNames[currentMonth.month]} {currentMonth.year}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Recovery Banner */}
      {isRecoveryMode && (
        <div className="px-4 py-3 bg-red-950/50 border border-red-900 rounded-xl">
          <p className="text-sm font-medium text-red-300">
            Recovery Mode: {recoveryPlan?.missed_days} missed days detected
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            System is adjusting your plan automatically. Focus on catching up gradually.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Study", value: stats.studyDays, color: "text-blue-400", bg: "bg-blue-900/30" },
          { label: "Mocks", value: stats.mockDays, color: "text-purple-400", bg: "bg-purple-900/30" },
          { label: "Revision", value: stats.totalDays - stats.studyDays - stats.mockDays - stats.missedDays - stats.restDays, color: "text-amber-400", bg: "bg-amber-900/30" },
          { label: "Rest", value: stats.restDays, color: "text-emerald-400", bg: "bg-emerald-900/30" },
          { label: "Missed", value: stats.missedDays, color: "text-red-400", bg: "bg-red-900/30" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-${stat.color.split('-')[1]}-800 rounded-xl p-3 text-center`}>
            <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentMonth.year, currentMonth.month, day);
            const dayType = getDayType(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(date)}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                  isToday ? "ring-2 ring-white" : ""
                } ${getDayColor(dayType)}`}
              >
                <span className="text-xs font-medium">{day}</span>
                <span className="text-lg mt-0.5">{getDayLabel(dayType)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Legend</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { type: "study", label: "Study Day", icon: "📚", color: "bg-blue-900/50 border-blue-800" },
            { type: "mock", label: "Mock Day", icon: "📝", color: "bg-purple-900/50 border-purple-800" },
            { type: "revision", label: "Revision", icon: "🔄", color: "bg-amber-900/50 border-amber-800" },
            { type: "rest", label: "Rest Day", icon: "😴", color: "bg-emerald-900/50 border-emerald-800" },
            { type: "missed", label: "Missed", icon: "❌", color: "bg-red-900/50 border-red-800" },
          ].map((item) => (
            <div key={item.type} className={`${item.color} rounded-lg p-2 text-center`}>
              <div className="text-sm mb-1">{item.icon}</div>
              <div className="text-[9px] text-slate-300">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          💡 Tap any day to cycle through day types
        </p>
      </div>

      {/* Monthly Summary */}
      {monthData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Monthly Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Average Health Score</span>
              <span className="text-white font-medium">{stats.avgHealth}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Average Execution Score</span>
              <span className="text-white font-medium">{stats.avgExecution}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Days Tracked</span>
              <span className="text-white font-medium">{stats.totalDays}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}