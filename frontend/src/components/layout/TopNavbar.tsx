import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Search, Layers, Clock, Settings, Database, Cpu, Globe, BarChart3, AlertTriangle, ShieldCheck, Navigation, FileText, Info } from 'lucide-react';
import { SystemSettingsModal } from '../modals/SystemSettingsModal';
import { ThemeToggle } from '../common/ThemeToggle';

interface TopNavbarProps {
  onSearch: (query: string) => void;
  onToggleLayers?: () => void;
  onToggleTime?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  apiOnline?: boolean;
  dbOnline?: boolean;
  modelActive?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onSearch,
  onToggleLayers,
  onToggleTime,
  isDarkMode = false,
  onToggleTheme,
  apiOnline = true,
  dbOnline = true,
  modelActive = true,
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleQuickPresetSearch = (preset: string) => {
    setSearchQuery(preset);
    onSearch(preset);
  };

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
    <header className="h-[70px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800 shadow-xs sticky top-0 z-50 flex items-center px-4 sm:px-6">
      <div className="w-full flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean-600 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-ocean-500/20 ring-1 ring-ocean-400/30 group-hover:scale-105 transition-transform">
              <Waves className="w-4 h-4 text-white animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Ocean<span className="text-ocean-600">Sphere</span>
                </h1>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-ocean-50 dark:bg-ocean-950 border border-ocean-200 dark:border-ocean-800 text-[9px] font-bold text-ocean-700 dark:text-ocean-400 uppercase tracking-wider">
                  v2.0 Live
                </span>
              </div>
            </div>
          </Link>

          {/* Module Navigation Tabs */}
          <nav className="hidden 2xl:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-ocean-50 dark:bg-ocean-950 text-ocean-600 dark:text-ocean-400 border border-ocean-200/80 dark:border-ocean-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ocean-500' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Global Search Box */}
        <div className="flex-1 max-w-lg mx-2 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ocean-600 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any sea or ocean (e.g. Red Sea, Mediterranean, South China Sea, 15.42° N)..."
              className="w-full pl-9 pr-48 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickPresetSearch('Arabian Sea')}
                className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 hover:text-ocean-600 bg-slate-200/80 dark:bg-slate-700 hover:bg-ocean-100 rounded transition-colors"
                title="Search Arabian Sea"
              >
                Arabian
              </button>
              <button
                type="button"
                onClick={() => handleQuickPresetSearch('Bay of Bengal')}
                className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 hover:text-ocean-600 bg-slate-200/80 dark:bg-slate-700 hover:bg-ocean-100 rounded transition-colors"
                title="Search Bay of Bengal"
              >
                Bengal
              </button>
              <button
                type="button"
                onClick={() => handleQuickPresetSearch('Red Sea')}
                className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 hover:text-ocean-600 bg-slate-200/80 dark:bg-slate-700 hover:bg-ocean-100 rounded transition-colors"
                title="Search Red Sea"
              >
                Red Sea
              </button>
              <button
                type="submit"
                className="px-2 py-0.5 text-[10px] font-bold text-white bg-ocean-600 hover:bg-ocean-700 rounded shadow-xs transition-colors"
              >
                Go
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Operational Controls & Status Badges */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Quick Control Buttons */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={onToggleLayers}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all hover:scale-102"
              title="Toggle Layer Controls"
            >
              <Layers className="w-3.5 h-3.5 text-ocean-600" />
              <span className="hidden sm:inline">Layers</span>
            </button>

            <button
              onClick={onToggleTime}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all hover:scale-102"
              title="Timeline Controls"
            >
              <Clock className="w-3.5 h-3.5 text-ocean-600" />
              <span className="hidden sm:inline">Time</span>
            </button>

            <ThemeToggle compact={true} />

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="System Preferences & Settings"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Telemetry Status Badges */}
          <div className="hidden lg:flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                apiOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API Live</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                dbOnline
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <Database className="w-3 h-3 text-blue-500" />
              <span>PostgreSQL</span>
            </div>
          </div>

        </div>
      </div>

      {/* System Preferences Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme || (() => {})}
      />
    </header>
  );
};

