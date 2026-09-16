import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Globe, BarChart3, AlertTriangle, ShieldCheck, Navigation, Cpu, FileText, Info, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing = false }) => {
  const location = useLocation();
  const [seconds, setSeconds] = useState(30);

  // Auto 30-second refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (onRefresh) onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefresh]);

  const navLinks = [
    { path: '/', label: 'Home', icon: Waves },
    { path: '/globe', label: 'Globe', icon: Globe },
    { path: '/reliability', label: 'Reliability', icon: ShieldCheck },
    { path: '/routing', label: 'Smart Routing', icon: Navigation },
    { path: '/forecast', label: 'Forecast', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/regions', label: 'Regions', icon: Globe },
    { path: '/models', label: 'Model Analytics', icon: Cpu },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 via-ocean-500 to-navy-500 flex items-center justify-center text-white shadow-md shadow-ocean-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-ocean-600 transition-colors">
                OCEAN<span className="text-ocean-500">SPHERE</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                SIH 2026 | Decision Support
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-ocean-50 dark:bg-ocean-950/80 text-ocean-600 dark:text-ocean-400 border border-ocean-200/80 dark:border-ocean-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ocean-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Live Status, Auto-Refresh & Theme Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>PostgreSQL + API Live</span>
            </div>

            <button
              onClick={() => {
                if (onRefresh) onRefresh();
                setSeconds(30);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              title="Manual Sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ocean-600 dark:text-ocean-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{seconds}s</span>
            </button>

            {/* Theme Toggle Component */}
            <ThemeToggle compact={true} />
          </div>
        </div>
      </div>
    </header>
  );
};
