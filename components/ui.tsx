import React from 'react';
import ReactMarkdown from 'react-markdown';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '', 
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-sm",
    secondary: "bg-black text-white border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 shadow-sm",
    danger: "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-900",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400">{label}</label>}
      <input
        className={`flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
};

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400">{label}</label>}
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm ring-offset-black placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
};

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-zinc-900 bg-zinc-950/50 p-6 shadow-sm transition-all hover:border-zinc-800 ${className}`}>
    {children}
  </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: "bg-zinc-800 text-zinc-300",
    success: "bg-green-900/30 text-green-400 border border-green-900/50",
    warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-900/50",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Markdown Renderer
export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="markdown-content text-zinc-400 space-y-3">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-200 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold text-zinc-200 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold text-zinc-300 mb-1">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-medium text-zinc-300 mb-1">{children}</h6>,
          p: ({ children }) => <p className="text-zinc-400 leading-relaxed">{children}</p>,
          a: ({ href, children }) => <a href={href} className="text-blue-400 hover:underline">{children}</a>,
          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-zinc-400">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-zinc-400">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          code: ({ children }) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-zinc-300">{children}</code>,
          pre: ({ children }) => <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-700 pl-4 italic text-zinc-500">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};