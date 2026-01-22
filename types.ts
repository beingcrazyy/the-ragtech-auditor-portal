
export enum CompanyState {
  ONBOARDING = 'ONBOARDING',
  READY_TO_AUDIT = 'READY_TO_AUDIT',
  AUDIT_IN_PROGRESS = 'AUDIT_IN_PROGRESS',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT'
}

export enum DocumentState {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export enum AuditRunStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum FindingSeverity {
  HARD = 'HARD',
  SOFT = 'SOFT'
}

export enum FindingStatus {
  VERIFIED = 'VERIFIED',
  FLAGGED = 'FLAGGED',
  FAILED = 'FAILED'
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  country: string;
  createdDate: string;
  documentCount: number;
  state: CompanyState; // Explicit State Machine field
  lastAuditDate?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  extension: string;
  uploadedDate: string;
  status: DocumentState; // Explicit State Machine field
  companyId: string;
  summary?: string;
  url?: string;
  uploadProgress?: number;
  errorMessage?: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  type: FindingSeverity;
  description: string;
  confidence: number;
  status: FindingStatus;
}

export interface Audit {
  id: string;
  companyId: string;
  date: string;
  status: AuditRunStatus; // Explicit State Machine field
  summary: string;
  metrics: {
    hardFailures: number;
    softFailures: number;
    confidenceScore: number;
  };
  findings: Finding[];
  progress?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
