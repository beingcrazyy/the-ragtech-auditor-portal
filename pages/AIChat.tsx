import React, { useState } from 'react';
import { Card, Input, Button, Select } from '../components/Shared';
import { Company } from '../types';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';

interface AIChatProps {
  companies: Company[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat: React.FC<AIChatProps> = ({ companies }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI Compliance Auditor. Select a company to start analyzing specific documents or ask general regulatory questions.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the latest uploaded documents, the company's AML policy seems to be compliant with 2024 regulations.",
        "I found a discrepancy in the Q4 financial report regarding the tax provisions.",
        "The employee handbook is missing a section on AI usage policies, which is now a requirement.",
        "Yes, that company is flagged for review due to inconsistent data in their ESG reporting."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: selectedCompanyId ? randomResponse : "Please select a company from the dropdown so I can give you specific context." 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const companyOptions = companies.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex-shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-sm p-6 rounded-[32px] shadow-sm border border-slate-50">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-brand-500" />
             AI Compliance Chat
           </h2>
           <p className="text-slate-500 text-sm">Ask questions about your regulatory data</p>
        </div>
        <div className="w-64">
           <Select 
             options={companyOptions} 
             value={selectedCompanyId} 
             onChange={(e) => setSelectedCompanyId(e.target.value)}
             placeholder="Select Context"
             className="!py-2 !text-sm"
             wrapperClassName="mb-0"
           />
        </div>
      </div>

      <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-slate-50 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
           {messages.map(msg => (
             <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                   {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                   msg.role === 'assistant' 
                   ? 'bg-slate-50 text-slate-800 rounded-tl-none' 
                   : 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/20'
                }`}>
                   {msg.content}
                </div>
             </div>
           ))}
           {isTyping && (
             <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
             </div>
           )}
        </div>

        <div className="p-4 bg-white border-t border-slate-50">
           <form 
             onSubmit={(e) => { e.preventDefault(); handleSend(); }}
             className="relative"
           >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about compliance status..."
                className="w-full pl-6 pr-14 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 placeholder-slate-400 font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 <Send className="w-5 h-5" />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};