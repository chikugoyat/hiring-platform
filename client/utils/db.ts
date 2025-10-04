import Dexie, { Table } from "dexie";

export type JobStatus = "active" | "upcoming" | "archived" | "closed";

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  tags: string[];
  order: number;
  description: string;
  requirements: string[];
  stipend?: string;
  deadline?: string; // ISO date
  scope?: string;
  createdAt: number;
}

export type CandidateStage =
  | "applied"
  | "screen"
  | "tech"
  | "offer"
  | "hired"
  | "rejected";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: CandidateStage;
  resumeUrl?: string;
  skills?: string[];
  address?: string;
  age?: number;
  experience?: number;
  linkedin?: string;
  gender?: string;
  createdAt: number;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  type: "stage_change" | "note";
  stage?: CandidateStage;
  note?: string;
  at: number;
}

export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "short_text"
  | "long_text"
  | "numeric"
  | "file";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[]; // for choice
  numericRange?: { min?: number; max?: number };
  maxLength?: number;
  // conditional visibility
  showIf?: {
    questionId: string;
    equals: string | number | boolean;
  };
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentBuilder {
  jobId: string;
  sections: AssessmentSection[]; // we will create three sections as three assignments
  updatedAt: number;
}

export interface AssessmentResponse {
  id: string; // `${candidateId}-${jobId}-${timestamp}`
  candidateId: string;
  jobId: string;
  answers: Record<string, any>; // questionId -> answer
  at: number;
}

export class TalentDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  timelines!: Table<CandidateTimelineEvent, string>;
  assessments!: Table<AssessmentBuilder, string>; // key: jobId
  responses!: Table<AssessmentResponse, string>;
  meta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("talent-flow-db");
    this.version(1).stores({
      jobs: "id, slug, status, order, createdAt",
      candidates: "id, jobId, stage, createdAt",
      timelines: "id, candidateId, at",
      assessments: "jobId, updatedAt",
      responses: "id, jobId, candidateId, at",
      meta: "key",
    });
  }
}

export const db = new TalentDB();
