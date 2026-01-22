import React, { useState, useEffect } from 'react';
import { Button, Badge, Input, Modal, Select } from '../components/Shared';
import { Plus, Search, FileText, UploadCloud, Play, Activity, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Company, Document, Audit, AuditStatus, FindingSeverity, FindingStatus } from '../types';
import { api } from '../services/mockData';

interface CompanyListProps {
  onSelectCompany: (id: string | null) => void;
  selectedCompanyId: string | null;
}

export const CompanyList: React.FC<CompanyListProps> = ({ onSelectCompany, selectedCompanyId }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', country: '', description: '' });

  // Detail View State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentAudit, setCurrentAudit] = useState<Audit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadCompanyDetails(selectedCompanyId);
    } else {
      setSelectedCompany(null);
    }
  }, [selectedCompanyId, companies]);

  const loadCompanies = async () => {
    setIsLoading(true);
    const data = await api.getCompanies();
    setCompanies(data);
    setIsLoading(false);
  };

  const loadCompanyDetails = async (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setSelectedCompany(company);
      const docs = await api.getDocuments(id);
      setDocuments(docs);
      const audit = await api.getAudit(id);
      if (audit) setCurrentAudit(audit);
      else setCurrentAudit(null);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createCompany(newCompany);
    setIsModalOpen(false);
    setNewCompany({ name: '', industry: '', country: '', description: '' });
    await loadCompanies();
    onSelectCompany(created.id);
  };

  const handleStartAudit = async () => {
    if (!selectedCompanyId) return;
    setIsAuditing(true);
    setProgress(0);
    setCurrentAudit(null);

    const interval = setInterval(() => {
      setProgress(prev => (prev >= 90 ? prev : prev + 10));
    }, 300);

    const audit = await api.startAudit(selectedCompanyId);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const completedAudit: Audit = {
        ...audit,
        status: AuditStatus.COMPLETED,
        summary: `Audit completed for ${selectedCompany?.name}. The system analyzed ${documents.length} documents. Overall compliance is strong, but there are minor discrepancies in the AML policy versioning compared to the internal controls register. Financial data appears consistent.`,
        metrics: { hardFailures: 0, softFailures: 2, confidenceScore: 94 },
        findings: [
          { id: 'f1', ruleId: 'R-AM-01', type: FindingSeverity.SOFT, description: 'AML Policy version mismatch in header vs footer', confidence: 0.92, status: FindingStatus.FLAGGED },
          { id: 'f2', ruleId: 'R-FN-04', type: FindingSeverity.HARD, description: 'Q4 Revenue reconciliation matches bank ledger', confidence: 0.99, status: FindingStatus.VERIFIED },
          { id: 'f3', ruleId: 'R-HR-02', type: FindingSeverity.SOFT, description: 'Employee handbook missing remote work clause', confidence: 0.85, status: FindingStatus.FLAGGED },
        ]
      };
      setCurrentAudit(completedAudit);
      setIsAuditing(false);
    }, 3000);
  };

  const industryOptions = [
    { value: 'FinTech', label: 'FinTech' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Biotech', label: 'Biotech' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
  ];

  const countryOptions = [
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Canada', label: 'Canada' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">

      {/* LEFT PANE: Master List */}
      <div className={`${selectedCompanyId ? 'lg:w-1/3 hidden lg:flex' : 'w-full'} flex-col bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-slate-50 overflow-hidden`}>
        <div className="p-6 border-b border-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Companies</h2>
            <button onClick={() => setIsModalOpen(true)} className="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none text-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 placeholder-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {companies.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectCompany(c.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedCompanyId === c.id
                  ? 'bg-brand-50 border-brand-200 shadow-sm ring-1 ring-brand-200'
                  : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${selectedCompanyId === c.id ? 'text-brand-900' : 'text-slate-900'}`}>{c.name}</h3>
                <Badge color={c.lastAuditStatus === FindingStatus.VERIFIED ? 'green' : c.lastAuditStatus === FindingStatus.FAILED ? 'red' : 'gray'}>
                  {c.lastAuditStatus || 'New'}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-slate-500 space-x-3">
                <span>{c.industry}</span>
                <span>•</span>
                <span>{c.documentCount} Docs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Detail View */}
      {selectedCompanyId && selectedCompany ? (
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-slate-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{selectedCompany.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">{selectedCompany.country}</span>
              </div>
              <p className="text-slate-500 text-sm">Automated Compliance Audit Workflow</p>
            </div>
            <div className="lg:hidden">
              <Button variant="secondary" onClick={() => onSelectCompany(null)} className="px-4 py-2">Back</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">

            {/* Step 1 & 2: Documents */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-3">1</span>
                  Regulatory Documents
                </h3>
                <button className="text-sm font-bold text-brand-600 flex items-center hover:underline">
                  <UploadCloud className="w-4 h-4 mr-1" /> Upload New
                </button>
              </div>

              <div className="grid gap-4">
                {documents.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                    No documents uploaded yet.
                  </div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="group p-4 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{doc.type} • {doc.uploadedDate}</p>
                            {doc.summary && (
                              <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                                {doc.summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                          <span className="text-xs font-bold text-slate-500">Ready</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Step 3: Audit Action */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs mr-3">2</span>
                  Compliance Audit
                </h3>
              </div>

              {!isAuditing && !currentAudit && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
                  <div>
                    <h4 className="font-bold text-lg">Ready to Analyze</h4>
                    <p className="text-slate-400 text-sm mt-1">AI engine will verify {documents.length} documents against global regulations.</p>
                  </div>
                  <button
                    onClick={handleStartAudit}
                    disabled={documents.length === 0}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Audit
                  </button>
                </div>
              )}

              {isAuditing && (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-600 text-sm">{progress}%</div>
                  </div>
                  <h4 className="font-bold text-slate-900">Running Compliance Checks...</h4>
                  <p className="text-slate-500 text-sm mt-1">Analyzing content for regulatory gaps</p>
                </div>
              )}

              {currentAudit && !isAuditing && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Audit Completed Successfully</h4>
                        <p className="text-emerald-800 text-sm mt-1 leading-relaxed">{currentAudit.summary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Findings Report</h4>
                      <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">Confidence: {currentAudit.metrics.confidenceScore}%</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {currentAudit.findings.map(finding => (
                        <div key={finding.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-4">
                          <div className="mt-1">
                            {finding.status === FindingStatus.VERIFIED && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {finding.status === FindingStatus.FLAGGED && <AlertCircle className="w-5 h-5 text-amber-500" />}
                            {finding.status === FindingStatus.FAILED && <XCircle className="w-5 h-5 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-slate-900 text-sm">{finding.description}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${finding.type === FindingSeverity.HARD ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{finding.type}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-mono">Rule ID: {finding.ruleId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                      <button className="text-brand-600 text-sm font-bold hover:underline">Download Full PDF Report</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-white/80 backdrop-blur-sm rounded-[32px] border border-slate-50 text-center p-12">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Activity className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Select a Company</h3>
            <p className="text-slate-500 mt-2">Choose a company from the list to manage documents, run audits, and view compliance reports.</p>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Company">
        <form onSubmit={handleAddCompany}>
          <div className="space-y-0">
             <Input
                label="Company Name"
                placeholder="e.g. Acme Corp"
                value={newCompany.name}
                onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                required
                wrapperClassName="mb-4"
              />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select
                  label="Industry"
                  options={industryOptions}
                  value={newCompany.industry}
                  onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                  required
                  wrapperClassName="mb-0"
                />
                <Select
                  label="Country"
                  options={countryOptions}
                  value={newCompany.country}
                  onChange={e => setNewCompany({ ...newCompany, country: e.target.value })}
                  required
                  wrapperClassName="mb-0"
                />
              </div>
              <Input
                label="Description (Optional)"
                placeholder="Brief description of business activities..."
                value={newCompany.description}
                onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                wrapperClassName="mb-2"
              />
          </div>
          <div className="flex justify-end space-x-3 pt-8 mt-2 border-t border-slate-50">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Company</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};