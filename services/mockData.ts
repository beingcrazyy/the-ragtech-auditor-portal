
import { Company, Document, Audit, AuditRunStatus, FindingSeverity, FindingStatus, CompanyState, DocumentState } from '../types';

// Updated Mock Data with Explicit States

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Acme Corp', industry: 'FinTech', country: 'USA', createdDate: '2023-10-15', documentCount: 12, state: CompanyState.COMPLIANT, lastAuditDate: '2024-03-10' },
  { id: '2', name: 'Globex Inc', industry: 'Healthcare', country: 'Germany', createdDate: '2023-11-02', documentCount: 8, state: CompanyState.NON_COMPLIANT, lastAuditDate: '2024-02-15' },
  { id: '3', name: 'Soylent Corp', industry: 'Manufacturing', country: 'Japan', createdDate: '2024-01-20', documentCount: 0, state: CompanyState.ONBOARDING },
  { id: '4', name: 'Umbrella Corp', industry: 'Biotech', country: 'USA', createdDate: '2024-02-10', documentCount: 24, state: CompanyState.NON_COMPLIANT, lastAuditDate: '2024-01-30' },
];

const MOCK_DOCUMENTS: Document[] = [
  { 
    id: 'd1', 
    name: 'Q4_Financials.pdf', 
    type: 'Financial Report',
    extension: 'pdf',
    uploadedDate: '2024-03-01', 
    status: DocumentState.READY, 
    companyId: '1',
    summary: 'Contains balance sheet and income statement for Q4 2023. Revenue shows 15% YoY growth.',
    url: '#' 
  },
  { 
    id: 'd2', 
    name: 'AML_Policy_v2.pdf', 
    type: 'Policy', 
    extension: 'pdf',
    uploadedDate: '2024-03-02', 
    status: DocumentState.READY, 
    companyId: '1',
    summary: 'Standard Anti-Money Laundering policy document. Last updated Jan 2024. Missing section 4.2 regarding crypto assets.',
    url: '#'
  },
  { 
    id: 'd3', 
    name: 'Employee_Handbook.docx', 
    type: 'HR Policy', 
    extension: 'docx',
    uploadedDate: '2024-03-05', 
    status: DocumentState.READY, 
    companyId: '1',
    summary: 'General HR guidelines. Compliant with federal labor laws.',
    url: '#'
  },
  {
    id: 'd4',
    name: 'Transaction_Log_2024.csv',
    type: 'Transaction Data',
    extension: 'csv',
    uploadedDate: '2024-03-06', 
    status: DocumentState.READY, 
    companyId: '1',
    summary: 'Raw transaction logs for Q1 audit.',
    url: '#'
  },
  {
    id: 'd5',
    name: 'Office_Compliance_Cert.png',
    type: 'Certificate',
    extension: 'png',
    uploadedDate: '2024-03-07', 
    status: DocumentState.READY, 
    companyId: '1',
    summary: 'ISO 27001 Certificate scan.',
    url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000'
  }
];

const MOCK_AUDITS: Audit[] = [
  {
    id: 'a1',
    companyId: '1',
    date: '2024-03-10',
    status: AuditRunStatus.COMPLETED,
    summary: 'The audit indicates strong compliance with minor documentation gaps in AML policy formatting. Financial reporting adheres to GAAP standards with high confidence.',
    metrics: { hardFailures: 0, softFailures: 2, confidenceScore: 98 },
    findings: [
      { id: 'f1', ruleId: 'R-102', type: FindingSeverity.SOFT, description: 'Missing version control meta-tag in AML Policy', confidence: 0.95, status: FindingStatus.FLAGGED },
      { id: 'f2', ruleId: 'R-505', type: FindingSeverity.HARD, description: 'Q4 Revenue matches bank statements', confidence: 0.99, status: FindingStatus.VERIFIED }
    ],
    progress: 100
  }
];

// Service Layer Simulation
export const api = {
  getCompanies: async (): Promise<Company[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_COMPANIES]), 600));
  },

  createCompany: async (company: Omit<Company, 'id' | 'createdDate' | 'documentCount' | 'state' | 'lastAuditDate'>): Promise<Company> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany: Company = {
          ...company,
          id: Math.random().toString(36).substr(2, 9),
          createdDate: new Date().toISOString().split('T')[0],
          documentCount: 0,
          state: CompanyState.ONBOARDING
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

  getUploadConfig: async (file: File, meta: any): Promise<{ uploadUrl: string; documentId: string }> => {
     return new Promise((resolve) => {
         setTimeout(() => {
             const docId = Math.random().toString(36).substr(2, 9);
             resolve({
                 uploadUrl: `https://mock-cloud-storage.com/bucket/${docId}?signature=xyz`,
                 documentId: docId
             });
         }, 400);
     });
  },

  confirmUpload: async (documentId: string): Promise<Document> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const doc = MOCK_DOCUMENTS.find(d => d.id === documentId);
            if (doc) {
                doc.status = DocumentState.READY; // Transition to READY
                resolve(doc);
            } else {
                resolve({} as Document);
            }
        }, 500);
    });
  },

  startAudit: async (companyId: string): Promise<Audit> => {
    const auditId = Math.random().toString(36).substr(2, 9);
    
    // Update company state
    const company = MOCK_COMPANIES.find(c => c.id === companyId);
    if (company) {
        company.state = CompanyState.AUDIT_IN_PROGRESS;
    }

    const newAudit: Audit = {
      id: auditId,
      companyId,
      date: new Date().toISOString().split('T')[0],
      status: AuditRunStatus.QUEUED,
      summary: 'Initializing audit protocols...',
      metrics: { hardFailures: 0, softFailures: 0, confidenceScore: 0 },
      findings: [],
      progress: 0
    };
    MOCK_AUDITS.push(newAudit);

    // Simulate background processing
    let progress = 0;
    const interval = setInterval(() => {
        const target = MOCK_AUDITS.find(a => a.id === auditId);
        const targetCompany = MOCK_COMPANIES.find(c => c.id === companyId);
        
        if (!target) { clearInterval(interval); return; }

        if (progress < 100) {
            progress += 5;
            target.progress = progress;
            target.status = AuditRunStatus.RUNNING;
            target.summary = `Analyzing document batch ${Math.ceil(progress/20)}...`;
        } else {
            clearInterval(interval);
            target.status = AuditRunStatus.COMPLETED;
            target.summary = 'Audit completed successfully. All documents processed.';
            target.metrics = { hardFailures: 0, softFailures: 2, confidenceScore: 94 };
            target.findings = [
                { id: 'f1', ruleId: 'R-AM-01', type: FindingSeverity.SOFT, description: 'AML Policy version mismatch in header vs footer', confidence: 0.92, status: FindingStatus.FLAGGED },
                { id: 'f2', ruleId: 'R-FN-04', type: FindingSeverity.HARD, description: 'Q4 Revenue reconciliation matches bank ledger', confidence: 0.99, status: FindingStatus.VERIFIED },
            ];
            
            // State Transition: Company Audit Finish
            if (targetCompany) {
                targetCompany.state = CompanyState.NON_COMPLIANT; // Based on mock findings
                targetCompany.lastAuditDate = new Date().toISOString().split('T')[0];
            }
        }
    }, 500);

    return newAudit;
  },

  getAudit: async (id: string): Promise<Audit | undefined> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUDITS.find(a => a.id === id)), 400));
  }
};
