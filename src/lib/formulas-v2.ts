// PrepOS Qwen Ultimate Edition — Enhanced Formulas V2
// All calculations for Readiness V2, Health V2, Execution Mode, Adaptive Routing

export interface ReadinessComponents {
  syllabus: number;
  mocks: number;
  revision: number;
  pyq: number;
  consistency: number;
}

export interface HealthComponents {
  wake: number;
  sleep: number;
  steps: number;
  water: number;
  exercise: number;
  strength: number;
}

export interface AdaptiveAllocation {
  subject: string;
  currentReadiness: number;
  baseAllocation: number;
  adjustedAllocation: number;
  boost: number;
  label: string;
}

// ── READINESS V2 ────────────────────────────────────────────
// Formula: 30% Syllabus + 25% Mock + 20% Revision + 15% PYQ + 10% Consistency
export function calcReadinessV2(
  components: ReadinessComponents
): number {
  const { syllabus, mocks, revision, pyq, consistency } = components;
  
  const readiness = 
    Math.min(100, syllabus) * 0.30 +
    Math.min(100, mocks) * 0.25 +
    Math.min(100, revision) * 0.20 +
    Math.min(100, pyq) * 0.15 +
    Math.min(100, consistency) * 0.10;
  
  return Math.round(readiness);
}

export function calcSyllabusCompletion(doneTopics: number, totalTopics: number): number {
  return Math.round((doneTopics / Math.max(totalTopics, 1)) * 100);
}

export function calcMockAccuracy(mockScores: { accuracy_pct: number }[]): number {
  if (mockScores.length === 0) return 0;
  const recent = mockScores.slice(-5);
  const avg = recent.reduce((sum, m) => sum + m.accuracy_pct, 0) / recent.length;
  return Math.round(avg);
}

export function calcRevisionCompletion(revisionLog: { done: boolean }[]): number {
  if (revisionLog.length === 0) return 0;
  const done = revisionLog.filter(r => r.done).length;
  return Math.round((done / revisionLog.length) * 100);
}

export function calcPYQCompletion(pyqs: { done: boolean }[]): number {
  if (pyqs.length === 0) return 0;
  const done = pyqs.filter(p => p.done).length;
  return Math.round((done / pyqs.length) * 100);
}

export function calcConsistency(streakDays: number, totalDays: number): number {
  return Math.min(100, Math.round((streakDays / Math.max(totalDays, 1)) * 100));
}

// ── HEALTH V2 ───────────────────────────────────────────────
// Formula: Wake(20%) + Sleep(20%) + Steps(20%) + Water(15%) + Exercise(15%) + Strength(10%)
export function calcHealthV2(components: HealthComponents): number {
  const { wake, sleep, steps, water, exercise, strength } = components;
  
  const health = 
    Math.min(1, wake) * 20 +
    Math.min(1, sleep) * 20 +
    Math.min(1, steps) * 20 +
    Math.min(1, water) * 15 +
    Math.min(1, exercise) * 15 +
    Math.min(1, strength) * 10;
  
  return Math.round(health);
}

export function calcHealthReadiness(healthLogs: HealthComponents[]): number {
  if (healthLogs.length === 0) return 0;
  const recent = healthLogs.slice(-7);
  const avgHealth = recent.reduce((sum, h) => sum + calcHealthV2(h), 0) / recent.length;
  return Math.round(avgHealth);
}

// ── EXECUTION SCORE ─────────────────────────────────────────
// Formula: Study(40%) + Mocks(30%) + Revisions(20%) + Health(10%)
export function calcExecutionScore(data: {
  studyHours: number;
  mocksDone: number;
  revisionsDone: number;
  healthScore: number;
}): number {
  const { studyHours, mocksDone, revisionsDone, healthScore } = data;
  
  const studyPct = Math.min(100, Math.round((studyHours / 56) * 100));
  const mockPct = Math.min(100, Math.round((mocksDone / 7) * 100));
  const revPct = Math.min(100, Math.round((revisionsDone / 7) * 100));
  const healthPct = Math.min(100, healthScore);
  
  const execution = 
    studyPct * 0.40 +
    mockPct * 0.30 +
    revPct * 0.20 +
    healthPct * 0.10;
  
  return Math.round(execution);
}

export function calcExecutionRatio(planningHours: number, studyHours: number): number {
  if (studyHours === 0) return planningHours > 0 ? Infinity : 0;
  return planningHours / studyHours;
}

export function getExecutionMode(ratio: number, mockCount: number, doneTopics: number): {
  mode: 'execution' | 'planning' | 'danger';
  message: string;
  level: 'great' | 'ok' | 'warn' | 'danger';
} {
  if (ratio >= 1.0) {
    return {
      mode: 'planning',
      message: 'Over-planning detected. Stop planning. Start executing.',
      level: 'danger'
    };
  }
  if (ratio >= 0.5) {
    return {
      mode: 'planning',
      message: 'Planning hours high. Shift to execution mode.',
      level: 'warn'
    };
  }
  if (mockCount === 0 && doneTopics < 3) {
    return {
      mode: 'execution',
      message: 'Execution Mode: No mocks, few topics. Execute now.',
      level: 'warn'
    };
  }
  return {
    mode: 'execution',
    message: 'Good balance. Keep executing.',
    level: 'great'
  };
}

// ── ADAPTIVE ROUTING ───────────────────────────────────────
// If < 50%: Boost +12%
// If 50-65%: Boost +5%
// If > 80%: Maintain -8%
export function calcAdaptiveRouting(
  subjects: { name: string; readiness: number; baseAllocation: number }[]
): AdaptiveAllocation[] {
  return subjects.map(subject => {
    const { name, readiness, baseAllocation } = subject;
    let boost = 0;
    let label = 'Maintain';
    
    if (readiness < 50) {
      boost = 12;
      label = 'Weak - Boost';
    } else if (readiness < 65) {
      boost = 5;
      label = 'Building - Slight Boost';
    } else if (readiness > 80) {
      boost = -8;
      label = 'Strong - Maintain';
    } else {
      label = 'On Track';
    }
    
    const adjustedAllocation = Math.max(10, baseAllocation + boost);
    
    return {
      subject: name,
      currentReadiness: readiness,
      baseAllocation,
      adjustedAllocation,
      boost,
      label
    };
  });
}

export function normalizeAllocations(allocations: AdaptiveAllocation[]): AdaptiveAllocation[] {
  const total = allocations.reduce((sum, a) => sum + a.adjustedAllocation, 0);
  return allocations.map(a => ({
    ...a,
    adjustedAllocation: Math.round((a.adjustedAllocation / total) * 100)
  }));
}

// ── STREAK TRACKING ────────────────────────────────────────
export function calcStreak(activities: { date: string; completed: boolean }[], type: string): number {
  if (activities.length === 0) return 0;
  
  const sorted = activities.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  for (let i = 0; i < sorted.length; i++) {
    const activity = sorted[i];
    const expectedDate = i === 0 ? today : 
      new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    
    if (activity.date === expectedDate && activity.completed) {
      streak++;
    } else if (i === 0 && activity.date === yesterday && activity.completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getRecoveryMode(missedDays: number): 'normal' | 'recovery' | 'emergency' | 'rebuild' {
  if (missedDays >= 10) return 'rebuild';
  if (missedDays >= 5) return 'emergency';
  if (missedDays >= 2) return 'recovery';
  return 'normal';
}

// ── REVISION PRIORITY ──────────────────────────────────────
export function calcRevisionPriority(overdueDays: number, readiness: number): number {
  if (overdueDays > 7) return 1; // Critical
  if (overdueDays > 3) return 2; // High
  if (overdueDays > 0) return 3; // Medium
  if (readiness < 50) return 2; // Weak topic
  return 4; // Normal
}

// ── EXAM INTELLIGENCE ──────────────────────────────────────
export function getReadinessColor(readiness: number): string {
  if (readiness >= 70) return '#1A8F68'; // Green
  if (readiness >= 40) return '#B06B0F'; // Amber
  return '#C94B2A'; // Red
}

export function getReadinessStatus(readiness: number): string {
  if (readiness >= 70) return 'On Track';
  if (readiness >= 40) return 'Needs Work';
  return 'Danger Zone';
}

export function projectScore(currentReadiness: number, daysRemaining: number): number {
  const improvementRate = 0.3; // 0.3% per day average
  const projectedImprovement = daysRemaining * improvementRate;
  return Math.min(99, Math.round(currentReadiness + projectedImprovement));
}