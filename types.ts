export enum AuditStatus {
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
  lastAuditStatus: FindingStatus | null;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  status: 'Uploaded' | 'Processing' | 'Failed';
  companyId: string;
  summary?: string;
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
  status: AuditStatus;
  summary: string;
  metrics: {
    hardFailures: number;
    softFailures: number;
    confidenceScore: number;
  };
  findings: Finding[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}