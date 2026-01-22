import React from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = "", title }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-[32px] p-6 shadow-sm border border-slate-50/50 ${className}`}>
    {title && <div className="mb-6 font-bold text-lg text-slate-800">{title}</div>}
    <div>{children}</div>
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = "", ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 focus:ring-brand-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 focus:ring-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    yellow: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Form Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", wrapperClassName = "mb-4", ...props }) => (
  <div className={wrapperClassName}>
    {label && <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>}
    <input
      className={`block w-full rounded-2xl bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 sm:text-sm px-4 py-3 transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
  </div>
);

// --- Form Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = "", wrapperClassName = "mb-4", placeholder, ...props }) => (
  <div className={wrapperClassName}>
    {label && <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>}
    <div className="relative">
      <select
        className={`block w-full appearance-none rounded-2xl bg-slate-50 border-transparent text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 sm:text-sm px-4 py-3 pr-10 transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : ''} ${className}`}
        {...props}
      >
        <option value="" disabled>{placeholder || (label ? `Select ${label}` : "Select option")}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900">{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
    {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
  </div>
);

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
