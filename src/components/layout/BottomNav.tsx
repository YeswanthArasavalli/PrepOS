import { NavLink } from "react-router-dom";
import { Home, ListTodo, Heart, BookOpen, Target, BarChart2 } from "lucide-react";

const NAV = [
  { to: "/",          icon: Home,      label: "Home"   },
  { to: "/planner",   icon: ListTodo,  label: "Plan"   },
  { to: "/health",    icon: Heart,     label: "Health" },
  { to: "/study",     icon: BookOpen,  label: "Study"  },
  { to: "/mocks",     icon: Target,    label: "Mocks"  },
  { to: "/analytics", icon: BarChart2, label: "Stats"  },
];

export default function BottomNav() {
  return (
    <nav className="bg-slate-900 border-t border-slate-800 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`
            }>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
