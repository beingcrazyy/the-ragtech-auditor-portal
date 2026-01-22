import React, { useState } from 'react';
import { Activity, Mail, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../components/Shared';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('ialirezamp@gmail.com'); // Pre-filled as per reference
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 xl:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo Area */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RegTech</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Welcome Back , Please enter Your details</p>
          </div>

          {/* Toggle Switch */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
            <button
              onClick={() => setAuthType('signin')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                authType === 'signin' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthType('signup')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                authType === 'signup' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Signup
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <label className="sr-only">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-medium"
                  placeholder="Email Address"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="bg-emerald-100 rounded-full p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-900 ml-1">Email Address</p>
              <p className="text-xs font-bold text-slate-900 ml-1 truncate">{email}</p>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-base rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] shadow-lg shadow-blue-500/30"
              isLoading={isLoading}
            >
              Continue
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or Continue With</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center space-x-6">
            <button className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors hover:border-slate-300">
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 rounded-full bg-black text-white border border-black flex items-center justify-center hover:bg-slate-800 transition-colors">
               <img src="https://www.svgrepo.com/show/508768/apple-logo.svg" alt="Apple" className="w-6 h-6 invert" />
            </button>
            <button className="w-14 h-14 rounded-full bg-[#1877F2] text-white border border-[#1877F2] flex items-center justify-center hover:bg-[#166fe5] transition-colors">
               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
               </svg>
            </button>
          </div>
          
          <p className="text-center text-slate-400 text-xs mt-12 leading-relaxed max-w-xs mx-auto">
            Join the millions of smart investors who trust us to manage their finances. Log in to access your personalized dashboard.
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD] relative items-center justify-center overflow-hidden">
        {/* Background Rain Effect */}
        <div className="absolute inset-0 z-0 opacity-30">
           {[...Array(20)].map((_, i) => (
             <div 
                key={i} 
                className="absolute bg-white w-[2px] rounded-full"
                style={{
                  height: `${Math.random() * 60 + 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random(),
                }}
             ></div>
           ))}
        </div>

        {/* 3D Safe/Lock Illustration (CSS + SVG Composition) */}
        <div className="relative z-10 w-80 h-80 perspective-1000 group">
          <div className="w-full h-full relative transform transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-12 preserve-3d">
             {/* Box Body */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[40px] shadow-2xl shadow-blue-900/40 flex items-center justify-center transform translate-z-10">
                <div className="absolute inset-0 rounded-[40px] border-4 border-white/20"></div>
                
                {/* Safe Dial */}
                <div className="w-40 h-40 bg-blue-400 rounded-full flex items-center justify-center shadow-inner relative">
                    <div className="w-32 h-32 bg-blue-300 rounded-full flex items-center justify-center border-8 border-blue-500/50">
                        <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                        </div>
                    </div>
                    {/* Handles */}
                    <div className="absolute w-48 h-4 bg-gray-200 rounded-full shadow-lg transform rotate-45 -z-10"></div>
                    <div className="absolute w-48 h-4 bg-gray-200 rounded-full shadow-lg transform -rotate-45 -z-10"></div>
                    <div className="absolute w-48 h-4 bg-gray-200 rounded-full shadow-lg transform rotate-0 -z-10"></div>
                </div>
             </div>
             {/* Side Depth Effect for 3D illusion */}
             <div className="absolute inset-0 bg-blue-800 rounded-[40px] transform translate-z-[-20px] translate-x-4 translate-y-4 -z-10 opacity-60"></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce delay-100">
             <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="absolute -bottom-5 -left-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce delay-700">
             <Lock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};