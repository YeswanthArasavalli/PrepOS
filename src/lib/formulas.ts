// All calculation functions from V5.1 — pure TypeScript, no side effects

export interface AssessmentScores { quant:number; reasoning:number; english:number; gk:number; cs:number; }
export interface HealthLog { id:string; log_date:string; wake:number; sleep:number; water:number; exercise:number; steps:number; strength:number; health_score:number; }
export interface MockScore { id:string; exam_id:string; accuracy_pct:number; test_date:string; }
export interface WeekLog { study_hours:number; mocks_done:number; revisions_done:number; plan_hours:number; }
export interface StreakCounts { wake:number; sleep:number; water:number; steps:number; exercise:number; }
export interface WeakRoutingResult { name:string; pct:number; alloc:number; hex:string; label:string; }
export interface RealityCheck { level:"danger"|"warn"|"ok"|"great"; msg:string; }
export type LazyMode = "start"|"normal"|"recovery"|"emergency"|"rebuild";

// PATCH 6: Health V2 — Wake20+Sleep20+Steps20+Water15+Exercise15+Strength10
export function calcHealth(logs: HealthLog[]): number {
  const recent = logs.slice(0, 7);
  if (!recent.length) return 0;
  const avg = (k: keyof HealthLog) => recent.reduce((s,d) => s + (Number(d[k]) || 0), 0) / recent.length;
  return Math.round(Math.min(1,avg("wake"))*20 + Math.min(1,avg("sleep"))*20 + Math.min(1,avg("steps"))*20 + Math.min(1,avg("water"))*15 + Math.min(1,avg("exercise"))*15 + Math.min(1,avg("strength"))*10);
}

// PATCH 4: Readiness V2 — 30/25/20/15/10 formula
export function calcReadiness(profile: AssessmentScores, topicsDoneMap: Record<string,boolean>, mockScores: MockScore[], healthScore: number, day: number, totalTopics: number, doneTopics: number) {
  const p = (k: keyof AssessmentScores) => Math.min(100, (profile[k] || 0) * 11);
  const donePct = doneTopics / Math.max(totalTopics, 1) * 100;
  const mAcc = (eid: string) => { const m = mockScores.filter(x => x.exam_id === eid); return m.length ? Math.round(m.slice(0,5).reduce((s,x) => s+x.accuracy_pct,0)/Math.min(m.length,5)) : 0; };
  const rev = Math.round(Object.values(topicsDoneMap).filter(Boolean).length / Math.max(totalTopics,1) * 100);
  const con = Math.min(100, Math.round(day / 140 * 100));
  const hp  = (healthScore / 100) * 5;
  const common = Math.round((p("quant")+p("reasoning")+p("english")+p("gk"))/4);
  const cs = p("cs");
  const v2 = ({syl,mock}:{syl:number;mock:number}) => Math.min(99, Math.round(syl*0.30+mock*0.25+rev*0.20+syl*0.15+con*0.10+hp));
  return {
    cgl:  v2({syl:Math.round((donePct+common)/2),           mock:mAcc("cgl")}),
    chsl: v2({syl:Math.round((donePct+common)/2),           mock:mAcc("chsl")}),
    ntpc: v2({syl:Math.round((donePct+common)/2),           mock:mAcc("ntpc")}),
    mts:  v2({syl:Math.min(99,Math.round((donePct+common)/2*1.1)), mock:mAcc("mts")}),
    coal: v2({syl:Math.round((donePct*0.5+cs*0.5)),         mock:mAcc("coal")}),
    net:  v2({syl:Math.round((donePct*0.5+cs*0.5)),         mock:mAcc("net")}),
    jad:  v2({syl:Math.round((donePct*0.4+cs*0.6)),         mock:mAcc("jad")}),
  };
}

// PATCH 3: Auto Weakness Routing
export function calcWeakRouting(profile: AssessmentScores): WeakRoutingResult[] {
  const p = (k: keyof AssessmentScores) => Math.min(100,(profile[k]||0)*11);
  const subs = [
    {name:"Quant",    pct:p("quant"),     base:28},
    {name:"CS/Tech",  pct:p("cs"),        base:22},
    {name:"GK",       pct:p("gk"),        base:20},
    {name:"English",  pct:p("english"),   base:15},
    {name:"Reasoning",pct:p("reasoning"), base:15},
  ];
  const boosted = subs.map(s => { let a=s.base; if(s.pct>80)a=Math.max(10,s.base-8); else if(s.pct<50)a=s.base+12; else if(s.pct<65)a=s.base+5; return {...s,alloc:a}; });
  const total = boosted.reduce((s,x)=>s+x.alloc,0);
  return boosted.map(s=>({...s,alloc:Math.round(s.alloc/total*100),hex:s.pct>80?"#1A8F68":s.pct<50?"#C94B2A":"#B06B0F",label:s.pct>80?"Strong — Maintain":s.pct<50?"Weak — Boost":"Building"}));
}

// PATCH 5: Anti-Lazy Streaks
export function calcStreaks(healthLogs: HealthLog[]): StreakCounts {
  const today = new Date(); today.setHours(0,0,0,0);
  const streak = (check: (h:HealthLog)=>boolean) => {
    let n=0;
    for(let i=0;i<30;i++){
      const d=new Date(today); d.setDate(d.getDate()-i);
      const ds=d.toISOString().split("T")[0];
      const e=healthLogs.find(h=>h.log_date===ds);
      if(e&&check(e))n++; else if(i===0)continue; else break;
    }
    return n;
  };
  return {wake:streak(h=>h.wake>=1),sleep:streak(h=>h.sleep>=1),water:streak(h=>h.water>=0.9),steps:streak(h=>h.steps>=0.9),exercise:streak(h=>h.exercise>=1)};
}

export function getAntiLazyMode(healthLogs: HealthLog[]): LazyMode {
  if(healthLogs.length<3)return"start";
  const days=Math.floor((Date.now()-new Date(healthLogs[0]?.log_date||0).getTime())/86400000);
  if(days>=10)return"rebuild"; if(days>=5)return"emergency"; if(days>=2)return"recovery"; return"normal";
}

// PATCH B: Weekly Execution Score
export function calcExecScore(weekLog: WeekLog, healthScore: number): number {
  const studyPct=Math.min(100,Math.round(weekLog.study_hours/56*100));
  const mockPct=Math.min(100,Math.round(weekLog.mocks_done/7*100));
  const revPct=Math.min(100,Math.round(weekLog.revisions_done/7*100));
  return Math.round(studyPct*0.40+mockPct*0.25+revPct*0.20+Math.min(100,healthScore)*0.15);
}

// PATCH C: Reality Check
export function getRealityCheck(planHrs: number, studyHrs: number): RealityCheck|null {
  if(studyHrs===0&&planHrs===0)return null;
  const ratio=planHrs/Math.max(studyHrs,1);
  if(ratio>=1.0)return{level:"danger",msg:`You spent ${planHrs}h planning and ${studyHrs}h studying. The exam does not care about your plan.`};
  if(ratio>=0.5)return{level:"warn",  msg:`Planning: ${planHrs}h. Study: ${studyHrs}h. Every hour redesigning = 1 hour not on PYQs.`};
  if(ratio>=0.3)return{level:"ok",    msg:`Planning: ${planHrs}h. Study: ${studyHrs}h. Acceptable balance. Keep execution higher.`};
  return{level:"great",msg:`Study: ${studyHrs}h. Planning: ${planHrs}h. This is what a topper looks like.`};
}

export function isExecutionMode(day:number,mockCount:number,doneTopics:number):boolean{return day>=14&&mockCount===0&&doneTopics<3;}
export function readinessColor(pct:number):string{if(pct>=70)return"#1A8F68";if(pct>=40)return"#B06B0F";return"#C94B2A";}
export function daysSincePrepStart(prepStart="2026-06-13"):number{return Math.max(0,Math.floor((Date.now()-new Date(prepStart).getTime())/86400000));}

// PATCH 11: Daily Plan Completion
export function calcDailyCompletion(tasks: { completed: boolean }[]): number {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
}

// PATCH 13: Revision Queue Priority
export function calcRevisionPriority(dueAt: string, overdueDays: number): number {
  if (overdueDays > 7) return 1;
  if (overdueDays > 3) return 2;
  if (overdueDays > 0) return 3;
  return 4;
}

// PATCH 15: Weekly Success Score
export function calcWeeklySuccess(actual: { studyHours: number; mocks: number; revisions: number }, 
                                   target: { studyHours: number; mocks: number; revisions: number }): number {
  const studyPct = Math.min(100, Math.round((actual.studyHours / target.studyHours) * 100));
  const mockPct = Math.min(100, Math.round((actual.mocks / target.mocks) * 100));
  const revPct = Math.min(100, Math.round((actual.revisions / target.revisions) * 100));
  return Math.round(studyPct * 0.40 + mockPct * 0.30 + revPct * 0.30);
}

// PATCH 17: Mock Analytics Improvement Score
export function calcMockImprovement(current: { attempted: number; correct: number; time_lost: number },
                                     previous: { attempted: number; correct: number; time_lost: number }): number {
  const accuracyImprovement = ((current.correct / current.attempted) - (previous.correct / previous.attempted)) * 100;
  const timeImprovement = previous.time_lost - current.time_lost;
  return Math.round(accuracyImprovement * 2 + timeImprovement * 0.5);
}

export interface RecoveryPlan {
  type: "normal" | "recovery" | "emergency" | "rebuild";
  action: "continue" | "catch_up" | "reset" | "restart";
  tasks?: string[];
}

// ADAPTIVE: Recovery Plan Generator
export function generateRecoveryPlan(missedDays: number, weakSubjects: string[]): RecoveryPlan {
  if (missedDays === 0) return { type: "normal", action: "continue" };
  if (missedDays <= 2) return { 
    type: "recovery", 
    action: "catch_up",
    tasks: ["Complete 1 missed topic", "Maintain health routine", "No new topics today"]
  };
  if (missedDays <= 5) return {
    type: "emergency",
    action: "reset",
    tasks: [
      "Pause all new topics for 2 days",
      "Only P1 topics: %, Ratio, Average",
      "Reduce GK to flashcards (15 min)",
      "Maintain 5AM wake + walk"
    ]
  };
  return {
    type: "rebuild",
    action: "restart",
    tasks: [
      "Drop to minimum viable plan",
      "Keep only CGL + 1 other exam",
      "P1 topics only for 1 week",
      "Full rest day this week"
    ]
  };
}

// PATCH 12: Today's Top Tasks Generator
export interface TopTask {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  reason: string;
  estimatedMinutes: number;
}

export function generateTopTasks(
  overdueRevisions: any[],
  errorLogs: any[],
  weakSubjects: string[],
  upcomingExams: string[]
): TopTask[] {
  const tasks: TopTask[] = [];

  // 1. Add overdue revisions (highest priority)
  overdueRevisions.slice(0, 3).forEach((rev, i) => {
    tasks.push({
      id: `rev-${i}`,
      title: `Revise: ${rev.topic_name}`,
      priority: "high",
      reason: `Overdue by ${Math.floor((Date.now() - new Date(rev.due_at).getTime()) / 86400000)} days`,
      estimatedMinutes: 45,
    });
  });

  // 2. Add weak subject practice
  if (errorLogs.length > 0) {
    const topErrorSubject = errorLogs[0]?.subject || weakSubjects[0];
    if (topErrorSubject) {
      tasks.push({
        id: "weak-practice",
        title: `${topErrorSubject} PYQs (20 questions)`,
        priority: "high",
        reason: "Most errors in last 14 days",
        estimatedMinutes: 60,
      });
    }
  }

  // 3. Add health tasks
  tasks.push({
    id: "health-walk",
    title: "Morning Walk 3km",
    priority: "high",
    reason: "Health V2: 20% weight",
    estimatedMinutes: 45,
  });

  tasks.push({
    id: "health-exercise",
    title: "Exercise + Strength",
    priority: "high",
    reason: "Health V2: 25% weight",
    estimatedMinutes: 30,
  });

  // 4. Add mock if none taken recently
  if (upcomingExams.length > 0) {
    tasks.push({
      id: "mock-task",
      title: `${upcomingExams[0]} Full Mock`,
      priority: "medium",
      reason: "Mock frequency: 1/week target",
      estimatedMinutes: 120,
    });
  }

  return tasks.slice(0, 5);
}
