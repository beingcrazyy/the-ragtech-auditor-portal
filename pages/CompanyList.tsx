
import React, { useState, useEffect, useRef } from 'react';
import { Button, Badge, Input, Modal, Select } from '../components/Shared';
import { AsyncView } from '../components/AsyncView';
import { SkeletonRow, SkeletonDetail } from '../components/LoadingSkeleton';
import { useAsync } from '../hooks/useAsync';
import { useAuditPolling } from '../hooks/useAuditPolling';
import { uploadService } from '../services/uploadService';
import { companyMachine, auditMachine, documentMachine } from '../services/stateMachine'; // Import State Machine
import { Plus, Search, FileText, UploadCloud, Play, Activity, CheckCircle2, AlertCircle, XCircle, Loader2, Eye, FileSpreadsheet, FileIcon, Image as ImageIcon, RefreshCw, Lock } from 'lucide-react';
import { Company, Document, Audit, AuditRunStatus, FindingSeverity, FindingStatus, CompanyState, DocumentState } from '../types';
import { api } from '../services/mockData';

interface CompanyListProps {
  onSelectCompany: (id: string | null) => void;
  selectedCompanyId: string | null;
}

export const CompanyList: React.FC<CompanyListProps> = ({ onSelectCompany, selectedCompanyId }) => {
  // Master List Data
  const { 
    data: companies, 
    status: companyStatus, 
    error: companyError, 
    execute: reloadCompanies 
  } = useAsync<Company[]>(api.getCompanies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', country: '', description: '' });

  // Detail View State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Audit Logic
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const { audit: currentAudit } = useAuditPolling(activeAuditId);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (selectedCompanyId && companies) {
      loadCompanyDetails(selectedCompanyId);
      
      const persistedAuditId = localStorage.getItem(`active_audit_${selectedCompanyId}`);
      if (persistedAuditId) {
        setActiveAuditId(persistedAuditId);
      } else {
        setActiveAuditId(null);
      }
    } else {
      setSelectedCompany(null);
      setActiveAuditId(null);
    }
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    // Audit Status Completion Effect
    if (currentAudit && (currentAudit.status === AuditRunStatus.COMPLETED || currentAudit.status === AuditRunStatus.FAILED)) {
        if (selectedCompanyId) {
             localStorage.removeItem(`active_audit_${selectedCompanyId}`);
             reloadCompanies(); // Refresh company state (e.g. COMPLIANT/NON_COMPLIANT)
        }
    }
  }, [currentAudit, selectedCompanyId]);

  const loadCompanyDetails = async (id: string) => {
    setIsDetailLoading(true);
    try {
        const company = companies?.find(c => c.id === id);
        if (company) {
            setSelectedCompany(company);
            const docs = await api.getDocuments(id);
            setDocuments(docs);
            
            // Restore active audit session if exists locally, or rely on company state
            if (!localStorage.getItem(`active_audit_${id}`) && company.state === CompanyState.AUDIT_IN_PROGRESS) {
               // In a real app, we would fetch the active audit ID from the company object
               // For mock, we might just show the 'Running' UI without the specific audit ID details until polling matches
            }
        }
    } catch (e) {
        console.error("Error loading details", e);
    } finally {
        setIsDetailLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const created = await api.createCompany(newCompany);
        setIsModalOpen(false);
        setNewCompany({ name: '', industry: '', country: '', description: '' });
        await reloadCompanies();
        onSelectCompany(created.id);
    } catch (e) {
        alert("Failed to create company");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedCompanyId) return;

    // State Guard
    if (selectedCompany && !companyMachine.canUploadDocs(selectedCompany.state)) {
        alert("Cannot upload documents while an audit is in progress.");
        return;
    }

    setIsUploading(true);
    
    const optimisticDocs: Document[] = files.map(file => ({
      id: Math.random().toString(36),
      name: file.name,
      type: file.name.toLowerCase().includes('financial') ? 'Financial Report' : 'Policy',
      extension: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      uploadedDate: new Date().toISOString().split('T')[0],
      status: DocumentState.UPLOADING,
      companyId: selectedCompanyId,
      uploadProgress: 0
    }));

    setDocuments(prev => [...optimisticDocs, ...prev]);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const optimisticDoc = optimisticDocs[index];
        try {
          const type = file.name.toLowerCase().includes('financial') ? 'Financial Report' 
                    : file.name.toLowerCase().includes('invoice') ? 'Invoice'
                    : 'Policy';

          const completedDoc = await uploadService.uploadFile(
            file, 
            { companyId: selectedCompanyId, type },
            (progress) => {
               setDocuments(currentDocs => 
                 currentDocs.map(d => 
                   d.name === optimisticDoc.name ? { ...d, uploadProgress: progress.percentage } : d
                 )
               );
            }
          );

          setDocuments(currentDocs => 
            currentDocs.map(d => d.name === optimisticDoc.name ? completedDoc : d)
          );

          return completedDoc;

        } catch (error) {
          setDocuments(currentDocs => 
             currentDocs.map(d => 
               d.name === optimisticDoc.name ? { ...d, status: DocumentState.ERROR, uploadProgress: 0 } : d
             )
          );
          throw error;
        }
      });

      await Promise.allSettled(uploadPromises);
      reloadCompanies();

    } catch (err) {
      console.error("Batch upload had failures", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartAudit = async () => {
    if (!selectedCompanyId || !selectedCompany) return;
    
    // State Guard
    if (!companyMachine.canStartAudit(selectedCompany.state) && selectedCompany.state !== CompanyState.READY_TO_AUDIT && selectedCompany.state !== CompanyState.COMPLIANT && selectedCompany.state !== CompanyState.NON_COMPLIANT) {
        // Broaden check slightly for UX, but strict check is:
        if (selectedCompany.state === CompanyState.AUDIT_IN_PROGRESS) return;
    }

    const newAudit = await api.startAudit(selectedCompanyId);
    setActiveAuditId(newAudit.id);
    localStorage.setItem(`active_audit_${selectedCompanyId}`, newAudit.id);
    
    // Optimistic Update
    setSelectedCompany({ ...selectedCompany, state: CompanyState.AUDIT_IN_PROGRESS });
    reloadCompanies();
  };

  const isRunning = currentAudit && auditMachine.isRunning(currentAudit.status);

  // Helper for UI
  const getFileIcon = (ext: string) => {
      switch(ext.toLowerCase()) {
          case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
          case 'csv':
          case 'xls':
          case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
          case 'png':
          case 'jpg':
          case 'jpeg': return <ImageIcon className="w-5 h-5 text-blue-500" />;
          default: return <FileIcon className="w-5 h-5 text-slate-400" />;
      }
  };

  // --- UI Render ---
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">

      {/* LEFT PANE: Master List */}
      <div className={`${selectedCompanyId ? 'lg:w-1/3 hidden lg:flex' : 'w-full'} flex-col bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-slate-50 overflow-hidden`}>
        <div className="p-6 border-b border-slate-50 flex-shrink-0">
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
            <AsyncView
                loading={companyStatus === 'pending'}
                error={companyError}
                isEmpty={!companies?.length && companyStatus === 'success'}
                loadingSkeleton={<><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>}
                onRetry={reloadCompanies}
                emptyMessage="No companies found. Create one to get started."
            >
                {companies?.map(c => (
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
                        <Badge color={companyMachine.getBadgeColor(c.state)}>
                        {companyMachine.getLabel(c.state)}
                        </Badge>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-3">
                        <span>{c.industry}</span>
                        <span>•</span>
                        <span>{c.documentCount} Docs</span>
                    </div>
                    </div>
                ))}
            </AsyncView>
        </div>
      </div>

      {/* RIGHT PANE: Detail View */}
      {selectedCompanyId ? (
         <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-slate-50 overflow-hidden flex flex-col">
            {isDetailLoading ? (
                 <div className="p-8"><SkeletonDetail /></div>
            ) : selectedCompany ? (
                <>
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
                    <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedCompany.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">{selectedCompany.country}</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Status: <span className="font-bold">{companyMachine.getLabel(selectedCompany.state)}</span>
                    </p>
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
                        <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        multiple
                        accept=".pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.docx"
                        />
                        
                        {/* State Guard for Upload Button */}
                        {companyMachine.canUploadDocs(selectedCompany.state) ? (
                            <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-sm font-bold text-brand-600 flex items-center hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <UploadCloud className="w-4 h-4 mr-1" />
                            )}
                            {isUploading ? 'Uploading...' : 'Upload New'}
                            </button>
                        ) : (
                             <div className="flex items-center text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked during audit
                             </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {documents.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                            No documents uploaded yet.
                        </div>
                        ) : (
                        documents.map(doc => (
                            <div key={doc.id} className="group p-4 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm transition-all relative overflow-hidden">
                                {doc.status === DocumentState.UPLOADING && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300" style={{ width: `${doc.uploadProgress}%` }}></div>
                                )}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 relative">
                                        {doc.status === DocumentState.UPLOADING ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                                                <span className="text-[10px] font-bold text-brand-600">{doc.uploadProgress}%</span>
                                            </div>
                                        ) : null}
                                        {getFileIcon(doc.extension)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{doc.name}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">{doc.type} • {doc.uploadedDate}</p>
                                        
                                        {doc.status === DocumentState.ERROR && (
                                            <p className="text-xs text-red-500 font-bold mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" /> Upload Failed
                                            </p>
                                        )}
                                        {doc.status === DocumentState.UPLOADING && (
                                            <p className="text-xs text-brand-500 font-bold mt-1">Uploading...</p>
                                        )}

                                        {doc.summary && doc.status === DocumentState.READY && (
                                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                                            {doc.summary}
                                        </p>
                                        )}
                                    </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {doc.status === DocumentState.READY && (
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                                <span className="text-xs font-bold text-slate-500">Ready</span>
                                            </div>
                                        )}
                                        {doc.status === DocumentState.ERROR ? (
                                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                                        ) : (
                                            <button 
                                                onClick={() => setViewingDoc(doc)}
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-30"
                                                title="View Document"
                                                disabled={doc.status !== DocumentState.READY}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
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

                    {/* State: Ready to Audit */}
                    {(!currentAudit && !isRunning && companyMachine.canStartAudit(selectedCompany.state)) && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
                        <div>
                            <h4 className="font-bold text-lg">Ready to Analyze</h4>
                            <p className="text-slate-400 text-sm mt-1">AI engine will verify {documents.length} documents against global regulations.</p>
                        </div>
                        <button
                            onClick={handleStartAudit}
                            disabled={documents.length === 0 || documents.some(d => d.status === DocumentState.UPLOADING || d.status === DocumentState.ERROR)}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Play className="w-4 h-4 mr-2" /> Start Audit
                        </button>
                        </div>
                    )}

                    {/* State: Audit in Progress (Running) */}
                    {currentAudit && isRunning && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${currentAudit.progress || 0}, 100`} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-600 text-sm">{currentAudit.progress || 0}%</div>
                        </div>
                        <h4 className="font-bold text-slate-900">Running Compliance Checks...</h4>
                        <p className="text-slate-500 text-sm mt-1">{currentAudit.summary || 'Processing data...'}</p>
                        </div>
                    )}

                    {/* State: Completed */}
                    {currentAudit && !isRunning && (
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
                        </div>
                        </div>
                    )}
                    </section>
                </div>
                </>
            ) : (
                <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-bold text-slate-900">Failed to load company details</h3>
                    <p className="text-slate-500 mt-2">Please try selecting the company again.</p>
                </div>
            )}
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
                  options={[
                    { value: 'FinTech', label: 'FinTech' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Biotech', label: 'Biotech' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Retail', label: 'Retail' },
                  ]}
                  value={newCompany.industry}
                  onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                  required
                  wrapperClassName="mb-0"
                />
                <Select
                  label="Country"
                  options={[
                    { value: 'USA', label: 'United States' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'Germany', label: 'Germany' },
                    { value: 'Japan', label: 'Japan' },
                    { value: 'Canada', label: 'Canada' },
                  ]}
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

      {/* Document Viewer Modal */}
      <Modal 
        isOpen={!!viewingDoc} 
        onClose={() => setViewingDoc(null)} 
        title={viewingDoc?.name || 'Document Viewer'} 
        maxWidth="2xl"
      >
        <div className="bg-slate-100 rounded-xl p-8 min-h-[600px] flex flex-col items-center">
            {viewingDoc && <img src={viewingDoc.url || ''} alt="Preview" className="max-h-[60vh] object-contain" />}
        </div>
          <div className="flex justify-end pt-6 border-t border-slate-50 mt-6">
              <Button variant="secondary" onClick={() => setViewingDoc(null)}>Close Viewer</Button>
          </div>
      </Modal>
    </div>
  );
};
