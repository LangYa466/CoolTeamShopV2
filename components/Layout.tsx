import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Terminal } from 'lucide-react';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    api.getNotice().then(res => {
      if (res.success && res.data) {
        setNotice(res.data);
      }
    });
  }, []);

  const navLinks = [
    { name: '购买', path: '/', icon: <ShoppingBag size={18} /> },
    { name: '查询', path: '/query', icon: <Search size={18} /> },
    { name: '后台', path: '/admin', icon: <ShieldCheck size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black border-r border-zinc-800">
      <div className="p-8 border-b border-zinc-800 flex flex-col justify-center bg-black">
        <Link to="/" className="block group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-black text-xl italic tracking-tighter group-hover:bg-accent transition-colors">
              C
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Cool<span className="text-zinc-600 group-hover:text-white transition-colors">TeamShop</span>
            </h1>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-0">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-4 px-8 py-6 text-sm font-bold tracking-widest uppercase transition-all border-b border-zinc-900 group relative overflow-hidden ${isActive(link.path)
              ? 'bg-white text-black'
              : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
          >
            {/* Hover indicator */}
            {!isActive(link.path) && (
              <span className="absolute left-0 top-0 h-full w-1 bg-accent transform -translate-x-full transition-transform group-hover:translate-x-0"></span>
            )}

            <span className={`transition-transform duration-300 ${isActive(link.path) ? 'scale-110' : 'group-hover:translate-x-2'}`}>
              {link.icon}
            </span>
            <span>{link.name}</span>

            {isActive(link.path) && <Terminal size={14} className="ml-auto animate-pulse" />}
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-zinc-800 mt-auto">
        <div className="space-y-4">
          <div className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">System Core</div>
          <a
            href="https://github.com/LangYa466/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 group/author cursor-pointer hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-300 shadow-lg shadow-black/20"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs italic shadow-lg shadow-white/5 transition-transform group-hover/author:scale-110">
              L
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold leading-none mb-1">AUTHOR</div>
              <div className="text-xs font-black tracking-tight text-white group-hover/author:text-blue-400 transition-colors">LangYa466</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-black font-sans flex flex-col md:flex-row overflow-x-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 fixed h-full inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-black tracking-tighter text-white uppercase italic">
            Cool<span className="text-zinc-600">TeamShop</span>
          </Link>
          <button
            className="p-2 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-black animate-in slide-in-from-right-full duration-300">
            <SidebarContent />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-80 w-full min-h-screen flex flex-col">
        {/* Top Bar Decoration (Desktop) */}
        <div className="hidden md:flex h-16 border-b border-zinc-800 items-center justify-between px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="text-xs font-mono text-zinc-500">
            PATH: <span className="text-zinc-300">{location.pathname}</span>
          </div>
          <div className="flex gap-4">
            <div className="h-2 w-2 bg-zinc-800 rounded-full"></div>
            <div className="h-2 w-2 bg-zinc-800 rounded-full"></div>
            <div className="h-2 w-2 bg-accent rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-10 max-w-[2400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;