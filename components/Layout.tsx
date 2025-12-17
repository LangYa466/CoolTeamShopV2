import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Megaphone } from 'lucide-react';
import { api } from '../services/api';
import { Markdown } from './ui';

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
    { name: '商店', path: '/', icon: <ShoppingBag size={18} /> },
    { name: '查询订单', path: '/query', icon: <Search size={18} /> },
    { name: '管理后台', path: '/admin', icon: <ShieldCheck size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black">
      <div className="p-6">
        <Link to="/" className="block text-2xl font-bold tracking-tighter text-white hover:opacity-80 transition-opacity">
          CoolTeamShop
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(link.path)
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>

      <a
        href="https://www.coolteam.top/"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6 mt-2 border-t border-white/5 hover:bg-zinc-900 transition-colors cursor-pointer group"
      >
        <div className="flex flex-col gap-1">
          <span className="text-zinc-600 text-xs group-hover:text-zinc-500 transition-colors">© {new Date().getFullYear()} CoolTeam</span>
        </div>
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-white selection:text-black font-sans flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r border-white/10 bg-black fixed h-full inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-white">
            CoolTeamShop
          </Link>
          <button
            className="p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-black border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 overflow-y-auto z-50">
            <SidebarContent />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 w-full p-4 md:p-12 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;