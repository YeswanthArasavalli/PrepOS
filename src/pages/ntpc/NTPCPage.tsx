import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePrepData } from "../../hooks/usePrepData";
import { daysSincePrepStart, readinessColor } from "../../lib/formulas";
import { EXAMS, EXAM_INTEL, TOPICS } from "../../lib/constants";
import { Train, BookOpen, Trophy, TrendingUp, Clock, CheckCircle, AlertTriangle, Target } from "lucide-react";

export default function NTPCPage() {
  const { profile } = useAuth();
  const { mockScores, topicProgressMap } = usePrepData();
  
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "mocks" | "strategy">("overview");

  if (!profile) return null;

  const day = daysSincePrepStart(profile.prep_start_date);
  const ntpcExam = EXAMS.find(e => e.id === "ntpc");
  const intel = EXAM_INTEL.ntpc;
  
  // Filter NTPC-related topics
  const ntpcTopics = [
    ...TOPICS["Quant"].filter(t => t.exams.includes("NTPC")),
    ...TOPICS["Reasoning"].filter(t => t.exams.includes("NTPC")),
    ...TOPICS["GK"].filter(t => t.exams.includes("NTPC")),
  ];

  const completedTopics = ntpcTopics.filter(t => topicProgressMap[t.id]?.is_done).length;
  const completionPct = Math.round((completedTopics / ntpcTopics.length) * 100);

  // NTPC Mock scores
  const ntpcMocks = mockScores.filter(m => m.exam_id === "ntpc");
  const avgAccuracy = ntpcMocks.length > 0 
    ? Math.round(ntpcMocks.slice(-5).reduce((sum, m) => sum + m.accuracy_pct, 0) / Math.min(ntpcMocks.length, 5))
    : 0;

  const readiness = readinessColor(avgAccuracy);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Train className="text-blue-400" size={24} />
              RRB NTPC Track
            </h1>
            <p className="text-xs text-blue-300 mt-1">
              Graduate Level • CBT 1 + CBT 2 • {day}/140 days
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: readiness }}>{avgAccuracy}%</div>
            <div className="text-[10px] text-blue-300">Current Readiness</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-white">{ntpcMocks.length}</div>
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
                ? "border-blue-500 text-blue-400"
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
                <span><strong>CBT 1:</strong> 100 Qs • 100 Marks • 90 min</span>
                <span className="text-blue-400">-0.33 neg</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <span><strong>CBT 2:</strong> 120 Qs • 120 Marks • 90 min</span>
                <span className="text-blue-400">-0.33 neg</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                <span><strong>Sections:</strong> Maths • Reasoning • GA • GS</span>
                <span className="text-emerald-400">4 sections</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-950/30 border border-blue-900 rounded">
              <p className="text-[10px] text-blue-300">{intel.note}</p>
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
                { label: "Target Score", value: intel.target, color: "text-blue-400" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Advantage */}
          <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-4">
            <h4 className="text-sm font-medium text-emerald-300 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} />
              NTPC Advantage
            </h4>
            <div className="text-xs text-emerald-400 space-y-2">
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Lower Negative Marking:</strong> -0.33 vs -0.5 in SSC. You can attempt more questions!</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>GK Weightage:</strong> 40-50 questions from GA/GS. Strong GK = easy selection.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>SSC Overlap:</strong> 85% syllabus same as SSC CGL. No extra preparation needed.</span>
              </div>
            </div>
          </div>

          {/* Subject Priority */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Subject Priority</h3>
            <div className="space-y-3">
              {[
                { name: "General Awareness", weight: "40%", priority: "P1", color: "text-blue-400" },
                { name: "Mathematics", weight: "30%", priority: "P1", color: "text-blue-400" },
                { name: "Reasoning", weight: "30%", priority: "P1", color: "text-blue-400" },
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
          {["Quant", "Reasoning", "GK"].map(subject => {
            const subjectTopics = (TOPICS[subject] || []).filter(t => t.exams.includes("NTPC"));
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
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {subjectTopics.slice(0, 6).map(topic => (
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

          {/* Current Affairs Special */}
          <div className="bg-amber-950/30 border border-amber-900 rounded-xl p-4">
            <h4 className="text-sm font-medium text-amber-300 mb-2">📰 Current Affairs (Critical for NTPC)</h4>
            <div className="text-xs text-amber-400 space-y-2">
              <p>NTPC asks 15-20 questions from Current Affairs (last 6 months).</p>
              <div className="space-y-1">
                <div>• National & International News</div>
                <div>• Sports & Awards</div>
                <div>• Govt Schemes & Policies</div>
                <div>• Science & Technology</div>
                <div>• Appointments & Rankings</div>
              </div>
              <p className="mt-2"><strong>Daily Target:</strong> 45 minutes of CA reading</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "mocks" && (
        <div className="space-y-4">
          {ntpcMocks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Train size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No NTPC mocks taken yet</p>
              <p className="text-xs mt-1">Start from Day 30: CBT 1 pattern mocks</p>
            </div>
          ) : (
            <>
              {/* Mock Trend */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-3">Mock Performance Trend</h3>
                <div className="space-y-2">
                  {ntpcMocks.slice(-5).reverse().map((mock, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">
                        Mock #{ntpcMocks.length - i}
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

              {/* Attempt Strategy */}
              <div className="bg-blue-950/30 border border-blue-900 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-300 mb-2">🎯 Attempt Strategy (-0.33 Penalty)</h4>
                <div className="text-xs text-blue-400 space-y-2">
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span><strong>Safe Attempts:</strong> 70%+ confidence = attempt</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span><strong>Calculated Risk:</strong> 50-70% confidence = attempt if you can eliminate 2 options</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span><strong>Avoid:</strong> Below 50% = skip (negative marking hurts less but still matters)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span><strong>Target Attempts:</strong> 75-85 questions out of 100 for safe selection</span>
                  </div>
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
            <h3 className="text-sm font-medium text-white mb-3">100-Day Strategy</h3>
            <div className="space-y-3">
              {[
                { phase: "Days 1-30", focus: "Foundation", tasks: ["Quant basics (%, Ratio, Avg)", "Reasoning P1 topics", "GK Science + History", "Daily CA reading"] },
                { phase: "Days 31-60", focus: "Core Build", tasks: ["Complete all P1+P2 topics", "Start CBT 1 mocks (2/week)", "CA last 6 months revision", "Weak topic improvement"] },
                { phase: "Days 61-85", focus: "Mock Phase", tasks: ["Daily CBT 1 mocks", "Sectional tests for CBT 2", "Speed + accuracy focus", "Previous year papers"] },
                { phase: "Days 86-100", focus: "Final Sprint", tasks: ["Only revision", "CA final revision", "Formula sheets", "Mock analysis only"] },
              ].map((p, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400">{p.phase}</span>
                    <span className="text-[10px] text-slate-400">{p.focus}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {p.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
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
            <h4 className="text-sm font-medium text-emerald-300 mb-2">🚂 NTPC Selection Tips</h4>
            <div className="text-xs text-emerald-400 space-y-2">
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Stage 1:</strong> CBT 1 is qualifying. Just clear cutoffs (30% UR, 25% others).</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Stage 2:</strong> CBT 2 score matters for final merit. Focus here.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>GK is King:</strong> 40-50 questions from GA. Daily CA reading is non-negotiable.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span><strong>Speed Test:</strong> 90 minutes for 100 Qs. Practice with timer from Day 30.</span>
              </div>
            </div>
          </div>

          {/* Post Preference */}
          <div className="bg-purple-950/30 border border-purple-900 rounded-xl p-4">
            <h4 className="text-sm font-medium text-purple-300 mb-2">📋 Popular NTPC Posts</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-400">
              <div className="p-2 bg-purple-900/20 rounded">Station Master</div>
              <div className="p-2 bg-purple-900/20 rounded">Goods Guard</div>
              <div className="p-2 bg-purple-900/20 rounded">Junior Clerk</div>
              <div className="p-2 bg-purple-900/20 rounded">Sr. Clerk</div>
              <div className="p-2 bg-purple-900/20 rounded">Ticket Clerk</div>
              <div className="p-2 bg-purple-900/20 rounded">Commercial Apprentice</div>
            </div>
            <p className="text-[10px] text-purple-400 mt-2">Final post allocation based on CBT 2 merit + preference order</p>
          </div>
        </div>
      )}
    </div>
  );
}