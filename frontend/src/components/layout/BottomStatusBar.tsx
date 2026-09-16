import React from 'react';
import { Waves, Globe, ShieldCheck, AlertTriangle, Database, Cpu, Activity, Clock } from 'lucide-react';

interface BottomStatusBarProps {
  regionsCount?: number;
  avgReliability?: string;
  accuracy?: string;
  alertsCount?: number;
  lastUpdated?: string;
  dbStatus?: string;
  modelStatus?: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  regionsCount = 7,
  avgReliability = '88.4%',
  accuracy = '94.2%',
  alertsCount = 3,
  lastUpdated = 'Just now (12:00:00 UTC)',
  dbStatus = 'PostgreSQL Live',
  modelStatus = 'Gradient Boosting R² = 99.91%',
}) => {
  return (
    <footer className="h-[44px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-xs fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 text-slate-700 dark:text-slate-300 text-xs select-none transition-colors">
      <div className="w-full flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        
        {/* Left Side: Monitored Stats */}
        <div className="flex items-center gap-4 shrink-0 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Waves className="w-4 h-4 text-ocean-600 dark:text-ocean-400" />
            <span>OceanSphere</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-ocean-500" />
            <span>Monitored Regions: <strong className="text-slate-900 dark:text-white font-bold">{regionsCount}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avg Reliability: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{avgReliability}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>Forecast Accuracy: <strong className="text-slate-900 dark:text-white font-bold">{accuracy}</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Active Alerts: <strong className="text-rose-600 dark:text-rose-400 font-bold">{alertsCount}</strong></span>
          </div>
        </div>

        {/* Right Side: Data Sources & System Telemetry */}
        <div className="flex items-center gap-4 shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="hidden xl:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Connected Sources:</span>
            <span className="font-mono text-ocean-700 dark:text-ocean-400 font-bold">HYCOM • ARGO • Buoys • INCOIS</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Database className="w-3 h-3 text-blue-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{dbStatus}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-indigo-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{modelStatus}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{lastUpdated}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
