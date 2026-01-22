import React from 'react';
import { Card, Badge, Button } from '../components/Shared';
import { Building2, FileText, Activity, AlertTriangle, ArrowRight, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Company } from '../types';

const data = [
  { name: 'Jan', completed: 4, failed: 1 },
  { name: 'Feb', completed: 6, failed: 0 },
  { name: 'Mar', completed: 8, failed: 2 },
  { name: 'Apr', completed: 5, failed: 1 },
  { name: 'May', completed: 9, failed: 0 },
  { name: 'Jun', completed: 7, failed: 1 },
];

interface DashboardProps {
  companies: Company[];
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ companies, onNavigate }) => {
  const StatCard = ({ title, value, icon: Icon, colorClass, iconColor }: any) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Resized to be more compact */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 text-white shadow-xl shadow-brand-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        
        <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase mb-3 border border-white/10">Compliance Dashboard</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">Automate Regulatory Audits with AI</h2>
                <p className="text-brand-50 text-base mb-6 max-w-md">Upload documents, run checks, and generate reports in seconds.</p>
                <button 
                  onClick={() => onNavigate('companies')}
                  className="bg-white text-brand-600 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-brand-900/10 hover:shadow-xl hover:scale-105 transition-all flex items-center group"
                >
                    Start New Audit
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="hidden lg:block relative mr-8">
                 {/* Decorative abstract shape resembling the reference */}
                 <div className="w-24 h-24 border-4 border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                 </div>
                 <div className="absolute -top-3 -right-8 text-4xl text-white/20">✦</div>
            </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Companies" value={companies.length} icon={Building2} colorClass="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Docs Uploaded" value="1,284" icon={FileText} colorClass="bg-brand-50" iconColor="text-brand-600" />
        <StatCard title="Audits Done" value="842" icon={Activity} colorClass="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pending Actions" value="12" icon={AlertTriangle} colorClass="bg-amber-50" iconColor="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card title="Audit Outcomes" className="lg:col-span-2">
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={12}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} 
                  cursor={{ fill: '#F8F9FD', radius: 8 }}
                />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={32} />
                <Bar dataKey="failed" fill="#e2e8f0" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-sm h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                    <button className="text-brand-600 text-sm font-bold hover:underline">See All</button>
                </div>
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">Acme Corp Financials</p>
                            <p className="text-xs text-slate-500 mt-1">Uploaded 2 hours ago</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <Card title="Recent Companies">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 font-bold uppercase bg-slate-50/50 rounded-lg">
                    <tr>
                        <th className="px-6 py-4 rounded-l-xl">Company</th>
                        <th className="px-6 py-4">Industry</th>
                        <th className="px-6 py-4 rounded-r-xl">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.slice(0, 3).map(c => (
                        <tr key={c.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                        {c.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-slate-900">{c.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-slate-500 font-medium">{c.industry}</td>
                            <td className="px-6 py-5">
                                <Badge color={c.lastAuditStatus === 'VERIFIED' ? 'green' : c.lastAuditStatus === 'FAILED' ? 'red' : 'gray'}>
                                    {c.lastAuditStatus || 'Pending'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};