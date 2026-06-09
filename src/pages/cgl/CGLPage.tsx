import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePrepData } from "../../hooks/usePrepData";
import { daysSincePrepStart, readinessColor } from "../../lib/formulas";
import { EXAMS, EXAM_INTEL, TOPICS } from "../../lib/constants";
import { Target, BookOpen, Trophy, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function CGLPage() {
  const { profile } = useAuth();
  const { mockScores, topicProgressMap } = usePrepData();
  
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "mocks" | "strategy">("overview");

  if (!profile) return null;

  const day = daysSincePrepStart(profile.prep_start_date);
  const cglExam = EXAMS.find(e => e.id === "cgl");
  const intel = EXAM_INTEL.cgl;
  
  // Filter CGL-related topics
  const cglTopics = Object.entries(TOPICS)
    .filter(([subject]) => ["Quant", "Reasoning", "English", "GK"].includes(subject))
    .flatMap(([_, topics]) => topics)
    .filter(t => t.exams.includes("SSC"));

  const completedTopics = cglTopics.filter(t => topicProgressMap[t.id]?.is_done).length;
  const completionPct = Math.round((completedTopics / cglTopics.length) * 100);

  // CGL Mock scores
  const cglMocks = mockScores.filter(m => m.exam_id === "cgl");
  const avgAccuracy = cglMocks.length > 0 
    ? Math.round(cglMocks.slice(-5).reduce((sum, m) => sum + m.accuracy_pct, 0) / Math.min(cglMocks.length, 5))
    : 0;

  const readiness = readinessColor(avgAccuracy);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="text-red-400" size={24} />
              SSC CGL Master Track
            </h1>
            <p className="text-xs text-red-300 mt-1">
              Master Exam • Tier 1 + Tier 2 • {day}/140 days
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: readiness }}>{avgAccuracy}%</div>
            <div className="text-[10px] text-red-300">Current Readiness</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-white">{cglMocks.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Mocks Taken</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-white">{completedTopics}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Topics Done</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-white">{intel.safe}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Safe Score</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-white">{intel.target}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target Score</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: Target },
          { id: "syllabus", label: "Syllabus", icon: BookOpen },
          { id: "mocks", label: "Mock Analysis", icon: TrendingUp },
          { id: "strategy", label: "Strategy", icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon size={14} className="inline mr-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Exam Pattern */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Exam Pattern</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <span><strong>Tier 1:</strong> 100 Qs • 200 Marks • 60 min</span>
                <span className="text-red-400">-0.5 neg</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <span><strong>Tier 2:</strong> Maths + English + Stats + GS</span>
                <span className="text-red-400">Qualifying</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <span><strong>Total Stages:</strong> Tier 1 → Tier 2 → Skill Test</span>
                <span className="text-emerald-400">3 stages</span>
              </div>
            </div>
          </div>

          {/* Cut-off Trends */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Cut-off Trends</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Previous Year", value: intel.prev, color: "text-blue-400" },
                { label: "Expected 2026", value: intel.expected, color: "text-amber-400" },
                { label: "Safe Score", value: intel.safe, color: "text-emerald-400" },
                { label: "Target Score", value: intel.target, color: "text-red-400" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-3 text-center">{intel.note}</p>
          </div>

          {/* Priority Subjects */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Subject Priority</h3>
            <div className="space-y-3">
              {[
                { name: "Quantitative Aptitude", weight: "35%", priority: "P1", color: "text-red-400" },
                { name: "Reasoning", weight: "25%", priority: "P1", color: "text-red-400" },
                { name: "English", weight: "25%", priority: "P1", color: "text-red-400" },
                { name: "General Awareness", weight: "15%", priority: "P2", color: "text-amber-400" },
              ].map(sub => (
                <div key={sub.name} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <div>
                    <div className="text-sm text-white">{sub.name}</div>
                    <div className="text-[10px] text-slate-500">Weight: {sub.weight}</div>
                  </div>
                  <span className={`text-xs font-bold ${sub.color}`}>{sub.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="space-y-4">
          {["Quant", "Reasoning", "English", "GK"].map(subject => {
            const subjectTopics = TOPICS[subject] || [];
            const done = subjectTopics.filter(t => topicProgressMap[t.id]?.is_done).length;
            const pct = Math.round((done / subjectTopics.length) * 100);
            
            return (
              <div key={subject} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">{subject}</h3>
                  <span className="text-xs text-slate-400">{done}/{subjectTopics.length} topics</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full mb-3">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {subjectTopics.slice(0, 5).map(topic => (
                    <div key={topic.id} className="flex items-center justify-between text-xs p-2 bg-slate-800 rounded">
                      <span className="text-slate-300">{topic.n}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        topicProgressMap[topic.id]?.is_done 
                          ? "bg-emerald-900/30 text-emerald-400" 
                          : "bg-slate-700 text-slate-400"
                      }`}>
                        {topicProgressMap[topic.id]?.is_done ? "✓ Done" : topic.p}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "mocks" && (
        <div className="space-y-4">
          {cglMocks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Target size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No CGL mocks taken yet</p>
              <p className="text-xs mt-1">Start with Topic Tests → Sectional Mocks → Full Mocks</p>
            </div>
          ) : (
            <>
              {/* Mock Trend */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-3">Mock Performance Trend</h3>
                <div className="space-y-2">
                  {cglMocks.slice(-5).reverse().map((mock, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">
                        Mock #{cglMocks.length - i}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-white">
                          {mock.score}/{mock.total}
                        </div>
                        <div 
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: `${readinessColor(mock.accuracy_pct)}20`,
                            color: readinessColor(mock.accuracy_pct)
                          }}
                        >
                          {mock.accuracy_pct}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Tips */}
              <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-300 mb-2">📊 Mock Analysis Tips</h4>
                <div className="text-xs text-blue-400 space-y-1">
                  <div>✓ Spend 2 hours analyzing every 1-hour mock</div>
                  <div>✓ Identify weak topics from error log</div>
                  <div>✓ Focus on accuracy first, speed later</div>
                  <div>✓ Attempt only 70%+ confidence questions</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "strategy" && (
        <div className="space-y-4">
          {/* Phase-wise Strategy */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">60-Day Strategy</h3>
            <div className="space-y-3">
              {[
                { phase: "Days 1-15", focus: "Foundation", tasks: ["Quant P1: %, Ratio, Avg", "Reasoning P1: Series, Analogy", "English RC + Grammar", "GK Science basics"] },
                { phase: "Days 16-30", focus: "Core Build", tasks: ["Quant P1+P2 complete", "Reasoning all types", "English Tier-2 topics", "GK History + Polity"] },
                { phase: "Days 31-45", focus: "Mock Phase", tasks: ["2 full mocks/week", "Sectional mocks daily", "Error log analysis", "Weak topic revision"] },
                { phase: "Days 46-60", focus: "Final Sprint", tasks: ["Daily full mocks", "PYQ re-attempt", "Formula revision", "No new topics"] },
              ].map((p, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400">{p.phase}</span>
                    <span className="text-[10px] text-slate-400">{p.focus}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {p.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Important Tips */}
          <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-4">
            <h4 className="text-sm font-medium text-emerald-300 mb-2">🎯 Selection Tips</h4>
            <div className="text-xs text-emerald-400 space-y-2">
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Negative Marking:</strong> -0.5 per wrong answer. Never guess below 70% confidence.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Sectional Timing:</strong> Spend max 20 min per section in Tier 1.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Tier 2 Focus:</strong> Start Tier 2 preparation from Day 30 onwards.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Revision:</strong> Last 15 days only for revision, no new topics.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}