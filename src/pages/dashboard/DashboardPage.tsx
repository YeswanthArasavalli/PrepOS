import { useAuth }      from "../../context/AuthContext";
import { usePrepData }  from "../../hooks/usePrepData";
import { calcHealth, calcReadiness, calcWeakRouting, calcStreaks,
         getAntiLazyMode, isExecutionMode, getRealityCheck,
         calcExecScore, readinessColor, daysSincePrepStart } from "../../lib/formulas";
import { EXAMS, EXAM_INTEL } from "../../lib/constants";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, TrendingUp, Zap } from "lucide-react";
import UltimateDashboard from "./UltimateDashboard";

function Bar({v,c,h="h-1.5"}:{v:number;c:string;h?:string}) {
  return <div className={`w-full ${h} rounded-full bg-slate-800`}><div className={`${h} rounded-full transition-all duration-500`} style={{width:`${Math.min(100,v)}%`,background:c}}/></div>;
}

const LAZY_CFG: Record<string,{bg:string;txt:string;msg:string}> = {
  rebuild:  {bg:"bg-red-950 border-red-900",   txt:"text-red-300",   msg:"10+ days inactive. REBUILD MODE. Just 1 thing: walk + 1 topic."},
  emergency:{bg:"bg-amber-950 border-amber-900",txt:"text-amber-300", msg:"5+ days missed. EMERGENCY RESET. Walk 2km + 10 PYQs + log health."},
  recovery: {bg:"bg-orange-950 border-orange-900",txt:"text-orange-300",msg:"2-4 days missed. RECOVERY PLAN active. Catch up without cramming."},
};

export default function DashboardPage() {
  const { profile }   = useAuth();
  const { healthLogs, mockScores, topicProgressMap, weekLogs, overdueRevisions, analyticsSummary } = usePrepData();
  if (!profile) return null;

  // Use Ultimate Dashboard for V2 experience
  return <UltimateDashboard />;
}
