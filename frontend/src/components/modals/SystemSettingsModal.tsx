import React, { useState } from 'react';
import { X, Settings, Check } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [refreshInterval, setRefreshInterval] = useState<'15s' | '30s' | '60s'>('30s');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [autoSync, setAutoSync] = useState(true);
  const [highResTerrain, setHighResTerrain] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 text-slate-800 dark:text-slate-100 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                System Preferences & Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure telemetry polling, units & 3D globe options</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preferences Sections */}
        <div className="space-y-4 text-xs">
          
          {/* Theme & Display */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Theme Mode</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Select Light, Dark, or System theme</span>
              </div>
              <ThemeToggle compact={false} />
            </div>
          </div>

          {/* Telemetry Polling Rate */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Auto-Refresh Interval</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Sync live telemetry stream from FastAPI & DB</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                {(['15s', '30s', '60s'] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setRefreshInterval(rate)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      refreshInterval === rate
                        ? 'bg-ocean-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {rate}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific Measurement Units */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Temperature Unit</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Celsius (°C) vs Fahrenheit (°F)</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    tempUnit === 'C' ? 'bg-ocean-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    tempUnit === 'F' ? 'bg-ocean-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          </div>

          {/* 3D Globe Rendering Options */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-slate-900 dark:text-white">ArcGIS High-Res Satellite Imagery</span>
              <input
                type="checkbox"
                checked={highResTerrain}
                onChange={() => setHighResTerrain(!highResTerrain)}
                className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer pt-1">
              <span className="font-bold text-slate-900 dark:text-white">Real-Time Polling Stream</span>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={() => setAutoSync(!autoSync)}
                className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
              />
            </label>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Changes'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
