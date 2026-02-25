import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-slate-400 mb-2 text-sm font-semibold tracking-wide uppercase">{label}</label>}
      <input
        className={`w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
