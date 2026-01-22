import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CompanyList } from './pages/CompanyList';
import { AIChat } from './pages/AIChat';
import { Company } from './types';
import { api } from './services/mockData';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Mock User
  const user = { name: 'Jane Doe', email: 'jane@regtechaudit.com', role: 'Compliance Officer' };

  React.useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    const data = await api.getCompanies();
    setCompanies(data);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      setSelectedCompanyId(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard companies={companies} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'companies':
        return <CompanyList onSelectCompany={setSelectedCompanyId} selectedCompanyId={selectedCompanyId} />;
      case 'ai-chat':
        return <AIChat companies={companies} />;
      case 'settings':
        return (
          <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-[32px] shadow-sm border border-slate-50 mt-8">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">Settings</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <div>
                  <p className="font-bold text-slate-800">Dark Mode</p>
                  <p className="text-sm text-slate-500">Toggle application visual theme</p>
                </div>
                <div className="w-12 h-7 bg-slate-200 rounded-full relative cursor-not-allowed"><div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 left-1"></div></div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <div>
                  <p className="font-bold text-slate-800">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive audit completion alerts</p>
                </div>
                <div className="w-12 h-7 bg-brand-600 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 right-1"></div></div>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <div>
                  <p className="font-bold text-slate-800">API Access</p>
                  <p className="text-sm text-slate-500">Enable external audit triggers</p>
                </div>
                <div className="w-12 h-7 bg-slate-200 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 left-1"></div></div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard companies={companies} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      onLogout={() => setIsAuthenticated(false)}
      user={user}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;