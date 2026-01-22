
import { CompanyState, DocumentState, AuditRunStatus } from '../types';

/**
 * Domain State Machine Service
 * Centralizes the logic for allowed transitions and state-based capabilities.
 */

// --- 1. Company State Machine ---

const COMPANY_TRANSITIONS: Record<CompanyState, CompanyState[]> = {
  [CompanyState.ONBOARDING]: [CompanyState.READY_TO_AUDIT],
  [CompanyState.READY_TO_AUDIT]: [CompanyState.AUDIT_IN_PROGRESS, CompanyState.ONBOARDING],
  [CompanyState.AUDIT_IN_PROGRESS]: [CompanyState.COMPLIANT, CompanyState.NON_COMPLIANT, CompanyState.READY_TO_AUDIT],
  [CompanyState.COMPLIANT]: [CompanyState.AUDIT_IN_PROGRESS, CompanyState.READY_TO_AUDIT],
  [CompanyState.NON_COMPLIANT]: [CompanyState.AUDIT_IN_PROGRESS, CompanyState.READY_TO_AUDIT],
};

export const companyMachine = {
  canTransition: (current: CompanyState, next: CompanyState): boolean => {
    return COMPANY_TRANSITIONS[current]?.includes(next) || false;
  },
  
  // UI Capability Checks
  canUploadDocs: (state: CompanyState): boolean => {
    return state !== CompanyState.AUDIT_IN_PROGRESS;
  },
  
  canStartAudit: (state: CompanyState): boolean => {
    return [
      CompanyState.READY_TO_AUDIT, 
      CompanyState.COMPLIANT, 
      CompanyState.NON_COMPLIANT
    ].includes(state);
  },

  getBadgeColor: (state: CompanyState): 'gray' | 'blue' | 'yellow' | 'green' | 'red' => {
    switch (state) {
      case CompanyState.ONBOARDING: return 'gray';
      case CompanyState.READY_TO_AUDIT: return 'blue';
      case CompanyState.AUDIT_IN_PROGRESS: return 'yellow';
      case CompanyState.COMPLIANT: return 'green';
      case CompanyState.NON_COMPLIANT: return 'red';
    }
  },

  getLabel: (state: CompanyState): string => {
    switch (state) {
      case CompanyState.ONBOARDING: return 'Onboarding';
      case CompanyState.READY_TO_AUDIT: return 'Ready to Audit';
      case CompanyState.AUDIT_IN_PROGRESS: return 'Auditing...';
      case CompanyState.COMPLIANT: return 'Compliant';
      case CompanyState.NON_COMPLIANT: return 'Flagged';
    }
  }
};

// --- 2. Document State Machine ---

const DOC_TRANSITIONS: Record<DocumentState, DocumentState[]> = {
  [DocumentState.UPLOADING]: [DocumentState.PROCESSING, DocumentState.ERROR],
  [DocumentState.PROCESSING]: [DocumentState.READY, DocumentState.ERROR],
  [DocumentState.READY]: [], // Final (unless archived/deleted)
  [DocumentState.ERROR]: [DocumentState.UPLOADING], // Retry
};

export const documentMachine = {
  canTransition: (current: DocumentState, next: DocumentState): boolean => {
    return DOC_TRANSITIONS[current]?.includes(next) || false;
  },
  
  isProcessing: (state: DocumentState): boolean => {
    return [DocumentState.UPLOADING, DocumentState.PROCESSING].includes(state);
  }
};

// --- 3. Audit Run State Machine ---

export const auditMachine = {
  isRunning: (status: AuditRunStatus): boolean => {
    return [AuditRunStatus.QUEUED, AuditRunStatus.RUNNING].includes(status);
  },

  canCancel: (status: AuditRunStatus): boolean => {
    return [AuditRunStatus.QUEUED].includes(status);
  }
};
