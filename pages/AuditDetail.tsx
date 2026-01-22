import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/Shared';
import { Company, Document, Audit, AuditRunStatus, FindingSeverity, FindingStatus } from '../types';
import { api } from '../services/mockData';
import { ArrowLeft, Play, UploadCloud, CheckCircle2, XCircle, AlertCircle, FileText, Loader2, Activity } from 'lucide-react';

interface AuditDetailProps {
  companyId: string;
  onBack: () => void;
}

export const AuditDetail: React.FC<AuditDetailProps> = ({ companyId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'audit'>('documents');
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentAudit, setCurrentAudit] = useState<Audit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    const companies = await api.getCompanies();
    const c = companies.find(x => x.id === companyId);
    setCompany(c || null);
    
    const docs = await api.getDocuments(companyId);
    setDocuments(docs);
  };

  const handleStartAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    setActiveTab('audit');
    setCurrentAudit(null);

    // Simulate progress
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.floor(Math.random() * 10);
        });
    }, 300);

    const audit = await api.startAudit(companyId);
    
    // Simulate complex audit processing time after API return
    setTimeout(async () => {
        clearInterval(interval);
        setProgress(100);
        // Fetch the "completed" audit (mocking the backend finishing)
        const completedAudit: Audit = {
            ...audit,
            status: AuditRunStatus.COMPLETED,
            summary: `Audit completed for ${company?.name}. The system analyzed ${documents.length} documents. Overall compliance is strong, but there are minor discrepancies in the AML policy versioning compared to the internal controls register. Financial data appears consistent.`,
            metrics: {
                hardFailures: 0,
                softFailures: 2,
                confidenceScore: 94
            },
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

  if (!company) return <div className="p-8 text-center text-slate-500">Loading company details...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
            <div className="flex items-center text-sm text-slate-500 space-x-3">
                <span>{company.industry}</span>
                <span>•</span>
                <span>{company.country}</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
            <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
                Documents ({documents.length})
            </button>
            <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'audit'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
                Audit & Findings
            </button>
        </nav>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
          <div className="space-y-6">
            <Card>
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-slate-900 font-medium">Upload Regulatory Documents</h3>
                    <p className="text-slate-500 text-sm mt-1">Drag and drop PDF, CSV, or JSON files here</p>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{doc.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.type}</p>
                            <p className="text-xs text-slate-400 mt-2">Uploaded {doc.uploadedDate}</p>
                        </div>
                        <Badge color="green">Uploaded</Badge>
                    </div>
                ))}
            </div>
            
            {documents.length > 0 && (
                <div className="flex justify-end">
                     <Button onClick={() => setActiveTab('audit')}>Proceed to Audit</Button>
                </div>
            )}
          </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
          <div className="space-y-6">
              {!currentAudit && !isAuditing && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Ready to Audit</h3>
                      <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
                          The system will analyze {documents.length} documents against standard regulatory compliance rules using our AI engine.
                      </p>
                      <Button onClick={handleStartAudit} disabled={documents.length === 0}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Compliance Audit
                      </Button>
                  </div>
              )}

              {isAuditing && (
                  <Card>
                      <div className="text-center py-12">
                          <div className="mb-6 relative w-24 h-24 mx-auto">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                  <path
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="#E2E8F0"
                                      strokeWidth="4"
                                  />
                                  <path
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="#7C3AED"
                                      strokeWidth="4"
                                      strokeDasharray={`${progress}, 100`}
                                      className="animate-[spin_3s_linear_infinite]"
                                  />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-brand-600 font-bold">
                                  {progress}%
                              </div>
                          </div>
                          <h3 className="text-lg font-medium text-slate-900 animate-pulse">Analyzing Documents...</h3>
                          <p className="text-slate-500 mt-2">Checking against compliance ruleset v2.4</p>
                      </div>
                  </Card>
              )}

              {currentAudit && !isAuditing && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Summary Card */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <Card className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-semibold text-slate-900">Audit Summary</h3>
                                  <Badge color="green">COMPLETED</Badge>
                              </div>
                              <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                                  {currentAudit.summary}
                              </p>
                          </Card>
                          <Card title="Metrics">
                              <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                      <span className="text-slate-600 text-sm">Confidence Score</span>
                                      <span className="font-bold text-slate-900">{currentAudit.metrics.confidenceScore}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2">
                                      <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${currentAudit.metrics.confidenceScore}%` }}></div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                      <div className="p-3 bg-red-50 rounded-lg text-center">
                                          <div className="text-2xl font-bold text-red-600">{currentAudit.metrics.hardFailures}</div>
                                          <div className="text-xs text-red-800 font-medium">Hard Failures</div>
                                      </div>
                                      <div className="p-3 bg-amber-50 rounded-lg text-center">
                                          <div className="text-2xl font-bold text-amber-600">{currentAudit.metrics.softFailures}</div>
                                          <div className="text-xs text-amber-800 font-medium">Soft Failures</div>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      </div>

                      {/* Findings Table */}
                      <Card title="Detailed Findings">
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                      <tr>
                                          <th className="px-6 py-3 font-medium">Rule ID</th>
                                          <th className="px-6 py-3 font-medium">Type</th>
                                          <th className="px-6 py-3 font-medium">Description</th>
                                          <th className="px-6 py-3 font-medium">Status</th>
                                          <th className="px-6 py-3 font-medium text-right">Confidence</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {currentAudit.findings.map(finding => (
                                          <tr key={finding.id} className="hover:bg-slate-50">
                                              <td className="px-6 py-4 font-mono text-xs text-slate-500">{finding.ruleId}</td>
                                              <td className="px-6 py-4">
                                                  <span className={`text-xs font-bold px-2 py-1 rounded ${finding.type === FindingSeverity.HARD ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                      {finding.type}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4 text-slate-900 font-medium">{finding.description}</td>
                                              <td className="px-6 py-4">
                                                   <div className="flex items-center space-x-2">
                                                      {finding.status === FindingStatus.VERIFIED && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                      {finding.status === FindingStatus.FLAGGED && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                                      {finding.status === FindingStatus.FAILED && <XCircle className="w-4 h-4 text-rose-500" />}
                                                      <span>{finding.status}</span>
                                                   </div>
                                              </td>
                                              <td className="px-6 py-4 text-right text-slate-500">
                                                  {(finding.confidence * 100).toFixed(0)}%
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </Card>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};