import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'ocean' | 'emerald' | 'amber' | 'rose' | 'navy';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'ocean',
  badge
}) => {
  const colorStyles = {
    ocean: 'from-ocean-50 to-white dark:from-ocean-950/60 dark:to-slate-900 border-ocean-100 dark:border-ocean-900/60',
    emerald: 'from-emerald-50 to-white dark:from-emerald-950/60 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/60',
    amber: 'from-amber-50 to-white dark:from-amber-950/60 dark:to-slate-900 border-amber-100 dark:border-amber-900/60',
    rose: 'from-rose-50 to-white dark:from-rose-950/60 dark:to-slate-900 border-rose-100 dark:border-rose-900/60',
    navy: 'from-slate-100 to-white dark:from-slate-800/80 dark:to-slate-900 border-slate-200 dark:border-slate-800'
  };

  const iconBgStyles = {
    ocean: 'bg-ocean-100 dark:bg-ocean-900/80 text-ocean-600 dark:text-ocean-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/80 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-400',
    navy: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b ${colorStyles[color]} border shadow-xs hover:shadow-md transition-all relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBgStyles[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
    </div>
  );
};
