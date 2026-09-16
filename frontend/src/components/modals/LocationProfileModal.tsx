import React from 'react';
import { X, TrendingUp, Thermometer, Droplets } from 'lucide-react';
import { SelectedLocationData } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface LocationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: SelectedLocationData;
}

export const LocationProfileModal: React.FC<LocationProfileModalProps> = ({
  isOpen,
  onClose,
  location
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const depthProfileData = [
    { depth: 0, temp: location.temperature, salinity: location.salinity, speed: location.currentSpeed },
    { depth: 50, temp: location.temperature - 1.1, salinity: location.salinity + 0.1, speed: location.currentSpeed * 0.85 },
    { depth: 100, temp: location.temperature - 3.2, salinity: location.salinity + 0.3, speed: location.currentSpeed * 0.65 },
    { depth: 200, temp: location.temperature - 8.5, salinity: location.salinity + 0.4, speed: location.currentSpeed * 0.45 },
    { depth: 500, temp: 12.4, salinity: 35.1, speed: 0.18 },
    { depth: 1000, temp: 7.8, salinity: 34.8, speed: 0.09 },
    { depth: 2000, temp: 3.9, salinity: 34.7, speed: 0.04 },
    { depth: 3200, temp: 2.1, salinity: 34.6, speed: 0.02 }
  ];

  const gridColor = isDarkMode ? '#1E293B' : '#E2E8F0';
  const textColor = isDarkMode ? '#94A3B8' : '#64748B';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    color: isDarkMode ? '#F8FAFC' : '#0F172A',
    borderRadius: '0.75rem',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 text-slate-800 dark:text-slate-100 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-ocean-600 dark:text-ocean-400 tracking-wider">Deep Ocean Vertical Profile</span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {location.oceanName} Profile Inspector
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Coordinates & Key Specs Header Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold">Coordinates</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold">Reliability Score</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
              {location.reliabilityScore}% ({location.confidenceLevel})
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold">Surface Temp</span>
            <span className="font-extrabold text-rose-500 text-sm">{location.temperature} °C</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-semibold">Salinity</span>
            <span className="font-extrabold text-cyan-500 text-sm">{location.salinity} PSU</span>
          </div>
        </div>

        {/* Vertical Depth Profiles (Charts Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Temperature vs Depth Profile */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" />
                Temperature vs Depth (°C)
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depthProfileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profileTempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="depth" stroke={textColor} fontSize={10} tickFormatter={(v) => `${v}m`} />
                  <YAxis stroke={textColor} fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${Number(val).toFixed(1)} °C`, 'Temperature']} />
                  <Area type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#profileTempGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salinity Profile */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                Salinity vs Depth (PSU)
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depthProfileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profileSalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="depth" stroke={textColor} fontSize={10} tickFormatter={(v) => `${v}m`} />
                  <YAxis stroke={textColor} fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${Number(val).toFixed(1)} PSU`, 'Salinity']} />
                  <Area type="monotone" dataKey="salinity" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#profileSalGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Source: HYCOM Numerical Forecast + Argo In-situ Floating Profilers</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
