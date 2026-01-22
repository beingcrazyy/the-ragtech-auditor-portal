import React from 'react';
import { LayoutDashboard, Building2, Settings, LogOut, FileBarChart, Bell, Search, MessageSquareText, Activity } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  user: { name: string; email: string };
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, onLogout, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'ai-chat', label: 'AI Auditor Chat', icon: MessageSquareText },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-20 hidden md:flex border-r border-slate-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      {/* Sidebar Header */}
      <div className="p-8 pb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            RegTech
          </span>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Overview</div>
      </div>

      {/* Scrollable Navigation Area - Independent Scrolling */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 flex-shrink-0">
        <div className="bg-slate-50 rounded-3xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-brand-700 font-bold shadow-sm">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                </div>
            </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors rounded-2xl hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const BottomNav: React.FC<{ activeTab: string; onNavigate: (t: string) => void }> = ({ activeTab, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'ai-chat', label: 'AI Chat', icon: MessageSquareText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-2 z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl w-16 transition-all ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl mb-1 ${isActive ? 'bg-brand-50' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; activeTab: string; onNavigate: (t: string) => void; onLogout: () => void; user: any }> = ({ children, activeTab, onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] overflow-hidden">
      {/* AI Friendly Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px]" />
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-200/20 blur-[80px]" />
      </div>

      <Sidebar activeTab={activeTab} onNavigate={onNavigate} onLogout={onLogout} user={user} />
      
      {/* Mobile Top Header (Minimal) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">RegTech</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
          </div>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-72 flex flex-col h-screen relative z-10">
        
        {/* Desktop Top Bar */}
        <header className="hidden md:flex h-24 px-8 items-center justify-between bg-transparent flex-shrink-0">
           <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all text-sm font-medium"
                  placeholder="Search your companies, documents..."
                />
              </div>
           </div>

           <div className="flex items-center space-x-6 ml-4">
              <button className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl text-slate-500 hover:text-brand-600 hover:shadow-md transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center space-x-3 pl-6 border-l border-slate-200/50">
                  <div className="text-right hidden lg:block">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-200 to-indigo-200 border-2 border-white shadow-sm overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full" />
                  </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 px-4 md:px-8 pb-24 md:pb-8 overflow-y-auto w-full mx-auto scrollbar-thin pt-20 md:pt-0">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      <BottomNav activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
};