import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Heart, BookOpen, Target, BarChart2, Zap, Settings, LogOut, Calendar, ListTodo, BookMarked, Clock } from "lucide-react";

const NAV = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { to: "/planner",   icon: ListTodo,        label: "Planner"   },
  { to: "/timetable", icon: Clock,           label: "Timetable" },
  { to: "/health",    icon: Heart,           label: "Health"    },
  { to: "/study",     icon: BookOpen,        label: "Study"     },
  { to: "/mocks",     icon: Target,          label: "Mocks"     },
  { to: "/resources", icon: BookMarked,      label: "Resources" },
  { to: "/weekly",    icon: Calendar,        label: "Weekly"    },
  { to: "/analytics", icon: BarChart2,       label: "Analytics" },
  { to: "/jad",       icon: Zap,             label: "JAD Track" },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 px-3 py-4">
      <div className="px-3 mb-6">
        <div className="text-base font-semibold text-white">PrepOS</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Preparation Operating System</div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-white text-slate-950 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800"}`
            }>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-0.5 pt-3 border-t border-slate-800">
        <NavLink to="/settings"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-white text-slate-950" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
          <Settings size={16} />Settings
        </NavLink>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950 transition-colors">
          <LogOut size={16} />Sign Out
        </button>
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
            {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-300 truncate">{profile?.display_name}</p>
            <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
