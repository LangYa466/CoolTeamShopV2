import React, { useState } from 'react';
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
  const baseStyle = "inline-flex items-center justify-center text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5",
    secondary: "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900",
  };

  const sizes = {
    default: "h-11 px-6 rounded-xl",
    sm: "h-9 px-4 text-xs rounded-lg",
    lg: "h-14 px-10 text-base rounded-2xl",
    icon: "h-11 w-11 p-0 rounded-xl",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
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
      {label && <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>}
      <input
        className={`flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder:text-zinc-600 
        focus-visible:outline-none focus:border-white focus:ring-4 focus:ring-white/5 
        disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
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
      {label && <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>}
      <textarea
        className={`flex min-h-[120px] w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 
        focus-visible:outline-none focus:border-white focus:ring-4 focus:ring-white/5 
        disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  );
};

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: "bg-zinc-800 text-zinc-400 border-zinc-700",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold rounded-lg ${styles[variant]}`}>
      {children}
    </span>
  );
};

// Markdown Renderer
export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="markdown-content text-zinc-400 space-y-4 font-sans leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-zinc-400 text-sm">{children}</p>,
          a: ({ href, children }) => <a href={href} className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4">{children}</a>,
          strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-outside ml-4 space-y-1.5 text-zinc-400">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-4 space-y-1.5 text-zinc-400">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ children }) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded-md text-xs font-mono text-zinc-200">{children}</code>,
          pre: ({ children }) => <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl overflow-x-auto text-xs font-mono">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-700 pl-4 text-zinc-500 italic py-1 mb-4">{children}</blockquote>,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-5">
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};