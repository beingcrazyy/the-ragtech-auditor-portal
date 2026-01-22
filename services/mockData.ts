import { Company, Document, Audit, AuditStatus, FindingSeverity, FindingStatus } from '../types';

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Acme Corp', industry: 'FinTech', country: 'USA', createdDate: '2023-10-15', documentCount: 12, lastAuditStatus: FindingStatus.VERIFIED },
  { id: '2', name: 'Globex Inc', industry: 'Healthcare', country: 'Germany', createdDate: '2023-11-02', documentCount: 8, lastAuditStatus: FindingStatus.FLAGGED },
  { id: '3', name: 'Soylent Corp', industry: 'Manufacturing', country: 'Japan', createdDate: '2024-01-20', documentCount: 5, lastAuditStatus: null },
  { id: '4', name: 'Umbrella Corp', industry: 'Biotech', country: 'USA', createdDate: '2024-02-10', documentCount: 24, lastAuditStatus: FindingStatus.FAILED },
];

const MOCK_DOCUMENTS: Document[] = [
  { 
    id: 'd1', 
    name: 'Q4_Financials.pdf', 
    type: 'Financial Report', 
    uploadedDate: '2024-03-01', 
    status: 'Uploaded', 
    companyId: '1',
    summary: 'Contains balance sheet and income statement for Q4 2023. Revenue shows 15% YoY growth.' 
  },
  { 
    id: 'd2', 
    name: 'AML_Policy_v2.pdf', 
    type: 'Policy', 
    uploadedDate: '2024-03-02', 
    status: 'Uploaded', 
    companyId: '1',
    summary: 'Standard Anti-Money Laundering policy document. Last updated Jan 2024. Missing section 4.2 regarding crypto assets.'
  },
  { 
    id: 'd3', 
    name: 'Employee_Handbook.pdf', 
    type: 'HR Policy', 
    uploadedDate: '2024-03-05', 
    status: 'Uploaded', 
    companyId: '1',
    summary: 'General HR guidelines. Compliant with federal labor laws.'
  },
];

const MOCK_AUDITS: Audit[] = [
  {
    id: 'a1',
    companyId: '1',
    date: '2024-03-10',
    status: AuditStatus.COMPLETED,
    summary: 'The audit indicates strong compliance with minor documentation gaps in AML policy formatting. Financial reporting adheres to GAAP standards with high confidence.',
    metrics: { hardFailures: 0, softFailures: 2, confidenceScore: 98 },
    findings: [
      { id: 'f1', ruleId: 'R-102', type: FindingSeverity.SOFT, description: 'Missing version control meta-tag in AML Policy', confidence: 0.95, status: FindingStatus.FLAGGED },
      { id: 'f2', ruleId: 'R-505', type: FindingSeverity.HARD, description: 'Q4 Revenue matches bank statements', confidence: 0.99, status: FindingStatus.VERIFIED }
    ]
  }
];

// Service Layer Simulation
export const api = {
  getCompanies: async (): Promise<Company[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_COMPANIES]), 600));
  },

  createCompany: async (company: Omit<Company, 'id' | 'createdDate' | 'documentCount' | 'lastAuditStatus'>): Promise<Company> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany: Company = {
          ...company,
          id: Math.random().toString(36).substr(2, 9),
          createdDate: new Date().toISOString().split('T')[0],
          documentCount: 0,
          lastAuditStatus: null
        };
        MOCK_COMPANIES.push(newCompany);
        resolve(newCompany);
      }, 800);
    });
  },

  getDocuments: async (companyId?: string): Promise<Document[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (companyId) {
          resolve(MOCK_DOCUMENTS.filter(d => d.companyId === companyId));
        } else {
          resolve([...MOCK_DOCUMENTS]);
        }
      }, 500);
    });
  },

  uploadDocument: async (file: File, meta: any): Promise<Document> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const doc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: meta.type || 'Unknown',
          uploadedDate: new Date().toISOString().split('T')[0],
          status: 'Uploaded',
          companyId: meta.companyId || '1',
          summary: 'Pending analysis...'
        };
        MOCK_DOCUMENTS.push(doc);
        resolve(doc);
      }, 1500);
    });
  },

  startAudit: async (companyId: string): Promise<Audit> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const audit: Audit = {
          id: Math.random().toString(36).substr(2, 9),
          companyId,
          date: new Date().toISOString().split('T')[0],
          status: AuditStatus.QUEUED,
          summary: '',
          metrics: { hardFailures: 0, softFailures: 0, confidenceScore: 0 },
          findings: []
        };
        MOCK_AUDITS.push(audit);
        resolve(audit);
      }, 500);
    });
  },

  getAudit: async (id: string): Promise<Audit | undefined> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUDITS.find(a => a.id === id)), 400));
  }
};