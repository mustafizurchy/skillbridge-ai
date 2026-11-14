export const skillIds = [
  "sql-data-modeling",
  "api-design-validation",
  "auth-security-boundaries",
  "react-state-architecture",
  "async-error-handling",
  "testing-verification",
] as const;
export type SkillId = (typeof skillIds)[number];
export interface Competency {
  id: SkillId;
  name: string;
  short: string;
  target: number;
  prerequisites: SkillId[];
  objective: string;
  resource: string;
}
export interface Question {
  id: string;
  family: string;
  skill: SkillId;
  prompt: string;
  options: string[];
}
export interface Outcome {
  questionId: string;
  family: string;
  skill: SkillId;
  correct: boolean;
  eligible: boolean;
  answer: number;
  correctAnswer: number;
  explanation: string;
}
export interface Attempt {
  id: string;
  kind: "diagnostic" | "checkpoint";
  questions: Question[];
  status: "issued" | "submitted";
  createdAt: string;
  outcomes?: Outcome[];
  score?: number;
  passed?: boolean;
  submittedAt?: string;
}
export interface Evidence {
  id: string;
  at: string;
  type: "assessment" | "practical";
  source: "Sample student" | "Server graded" | "Curated Rubric";
  attemptId?: string;
  outcomes?: Outcome[];
  submission?: Record<string, string>;
  rubric?: { criterion: string; met: boolean; explanation: string }[];
}
export interface Profile {
  name: string;
  context: string;
  weeklyHours: number;
  preferences: string;
  selfReport: Partial<Record<SkillId, number>>;
  onboarded: boolean;
}
export interface Task {
  id: string;
  skill: SkillId;
  title: string;
  minutes: number;
  week: number;
  why: string;
  objective: string;
  resource: string;
  practice: string;
  prerequisites: SkillId[];
}
export interface Roadmap {
  id: string;
  parentId: string | null;
  createdAt: string;
  status: "active" | "accepted" | "proposed" | "rejected";
  reasons: string[];
  tasks: Task[];
  fingerprint: string;
  targetWeights?: Record<SkillId, number>;
  requirementQuotes?: { skill: SkillId; quote: string }[];
}
export interface SkillScore {
  id: SkillId;
  score: number | null;
  count: number;
  state: "Assessed" | "Insufficient evidence" | "Unassessed";
  weight: number;
}
export interface Summary {
  skills: SkillScore[];
  score: number | null;
  coverage: number;
}
export interface Workspace {
  profile: Profile;
  assessments: Attempt[];
  evidence: Evidence[];
  roadmaps: Roadmap[];
  activeRoadmapId: string;
  taskProgress: Record<string, boolean>;
  studyLogs: { id: string; at: string; hours: number; note: string }[];
  messages: {
    id: string;
    at: string;
    question: string;
    answer: string;
    source: string;
  }[];
  weights: Record<SkillId, number>;
  expiresAt: number | null;
  aiUsed: number;
  version: number;
}
export interface View extends Workspace {
  summary: Summary;
  demo: boolean;
  storage: string;
  competencies: Competency[];
  csrf: string;
  aiConfigured: boolean;
}
