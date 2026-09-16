import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Copy,
  Check,
  Thermometer,
  Droplets,
  Wind,
  Waves,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Scale,
  X,
  Radio,
  Bell,
  BellOff,
  Clock,
  ChevronRight,
  Zap,
  Navigation,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { SelectedLocationData, AlertItem } from '../../types';

interface RightIntelligencePanelProps {
  selectedLocation: SelectedLocationData;
  alerts?: AlertItem[];
  newAlertIds?: Set<number>;
  alertsLastUpdated?: Date;
  onOpenProfile?: () => void;
  onOpenCompare?: () => void;
  onSelectAlert?: (alert: AlertItem) => void;
  onDismissAlert?: (id: number) => void;
}

type SeverityFilter = 'ALL' | 'CRITICAL' | 'WARNING';

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function alertTimestamp(ts: string): string {
  if (!ts) return 'live';
  try {
    return timeAgo(new Date(ts));
  } catch {
    return 'live';
  }
}

export const RightIntelligencePanel: React.FC<RightIntelligencePanelProps> = ({
  selectedLocation,
  alerts = [],
  newAlertIds = new Set(),
  alertsLastUpdated,
  onOpenProfile,
  onOpenCompare,
  onSelectAlert,
  onDismissAlert,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState<'temp' | 'current' | 'reliability'>('temp');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const [mutedAlerts, setMutedAlerts] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [, setTick] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (feedRef.current && newAlertIds.size > 0) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [newAlertIds.size]);

  const handleCopyCoords = () => {
    const coordStr = `${selectedLocation.latitude.toFixed(4)}° N, ${selectedLocation.longitude.toFixed(4)}° E`;
    navigator.clipboard.writeText(coordStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setMutedAlerts(prev => new Set([...prev, id]));
    onDismissAlert?.(id);
  };

  const visibleAlerts = alerts
    .filter(a => !mutedAlerts.has(a.id))
    .filter(a => severityFilter === 'ALL' || a.severity === severityFilter);

  const critCount = alerts.filter(a => a.severity === 'CRITICAL' && !mutedAlerts.has(a.id)).length;
  const warnCount = alerts.filter(a => a.severity === 'WARNING' && !mutedAlerts.has(a.id)).length;

  const depthTrendData = [
    { depth: 0, temp: selectedLocation.temperature, velocity: selectedLocation.currentSpeed, reliability: selectedLocation.reliabilityScore },
    { depth: 50, temp: selectedLocation.temperature - 1.2, velocity: selectedLocation.currentSpeed * 0.85, reliability: selectedLocation.reliabilityScore - 1 },
    { depth: 100, temp: selectedLocation.temperature - 3.4, velocity: selectedLocation.currentSpeed * 0.65, reliability: selectedLocation.reliabilityScore - 2 },
    { depth: 500, temp: selectedLocation.temperature - 12.1, velocity: selectedLocation.currentSpeed * 0.3, reliability: selectedLocation.reliabilityScore - 3 },
    { depth: 1000, temp: 8.4, velocity: 0.12, reliability: selectedLocation.reliabilityScore - 1 },
    { depth: 2000, temp: 4.1, velocity: 0.05, reliability: selectedLocation.reliabilityScore },
    { depth: 3000, temp: 2.3, velocity: 0.02, reliability: selectedLocation.reliabilityScore + 1 },
  ];

  const getReliabilityStyle = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800/60', text: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-500', label: 'High Reliability' };
    if (score >= 60) return { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800/60', text: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-500', label: 'Moderate Reliability' };
    return { bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800/60', text: 'text-rose-700 dark:text-rose-300', badgeBg: 'bg-rose-500', label: 'Low Reliability' };
  };
  const relStyle = getReliabilityStyle(selectedLocation.reliabilityScore);

  return (
    <aside className="w-[350px] shrink-0 h-[calc(100vh-70px-44px)] overflow-y-auto pl-1 space-y-3.5 scrollbar-thin select-none">

      {/* 1. SELECTED LOCATION HEADER CARD */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            <MapPin className="w-4 h-4 text-ocean-600 dark:text-ocean-400" />
            <span>Selected Location</span>
          </div>
          <button
            onClick={handleCopyCoords}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Copy Coordinates"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Waves className="w-3.5 h-3.5 text-ocean-500" />
            <span>{selectedLocation.oceanName}</span>
            {selectedLocation.regionId && (
              <span className="px-2 py-0.5 rounded bg-ocean-50 dark:bg-ocean-950 text-ocean-700 dark:text-ocean-300 border border-ocean-200 dark:border-ocean-800 text-[10px] font-bold">
                {selectedLocation.regionId}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onOpenProfile} className="py-2 px-3 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all hover:scale-102">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </button>
          <button onClick={onOpenCompare} className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all">
            <Scale className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Compare</span>
          </button>
        </div>
        <div className="mt-2">
          <Link
            to="/routing"
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-101"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>Smart Ship Routing Engine</span>
          </Link>
        </div>
      </div>

      {/* 2. OCEAN PARAMETERS CARD */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Ocean Parameters</h3>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">HYCOM + ARGO</span>
        </div>
        <div className="space-y-2.5 text-xs">
          {[
            { icon: Thermometer, color: 'text-rose-500', label: 'Temperature', val: `${selectedLocation.temperature.toFixed(1)} °C` },
            { icon: Droplets, color: 'text-cyan-500', label: 'Salinity', val: `${selectedLocation.salinity.toFixed(1)} PSU` },
            { icon: Waves, color: 'text-sky-500', label: 'Wave Height', val: `${selectedLocation.waveHeight.toFixed(1)} m` },
            { icon: Wind, color: 'text-indigo-500', label: 'Current Speed', val: `${selectedLocation.currentSpeed.toFixed(2)} m/s (${selectedLocation.currentDirection}°)` },
            { icon: Activity, color: 'text-teal-500', label: 'Ocean Depth', val: `${selectedLocation.depth} m` },
          ].map(({ icon: Icon, color, label, val }) => (
            <div key={label} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className={`flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium`}>
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RELIABILITY CARD */}
      <div className={`rounded-2xl border ${relStyle.border} ${relStyle.bg} p-4 shadow-sm text-slate-800 dark:text-slate-100 space-y-3`}>
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Forecast Reliability</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white ${relStyle.badgeBg}`}>
            {relStyle.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Reliability Score</span>
            <span className={`text-3xl font-extrabold tracking-tight ${relStyle.text}`}>
              {selectedLocation.reliabilityScore.toFixed(1)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Forecast Accuracy</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedLocation.forecastAccuracy.toFixed(1)}%</span>
          </div>
        </div>
        <div className="space-y-1.5 text-xs border-t border-slate-200/60 dark:border-slate-800/60 pt-2.5">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Confidence Level:</span>
            <span className="font-bold text-slate-900 dark:text-white">{selectedLocation.confidenceLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Risk Assessment:</span>
            <span className="font-bold text-slate-900 dark:text-white">{selectedLocation.riskLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Model Divergence:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">MAE 0.14 °C (Low)</span>
          </div>
        </div>
      </div>

      {/* 4. LIVE ALERTS FEED */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Live Alerts Feed</span>
              <Radio className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(m => !m)}
                className={`p-1 rounded-lg transition-colors ${isMuted ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-rose-50 dark:bg-rose-950 text-rose-500 hover:bg-rose-100'}`}
                title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
              >
                {isMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              </button>
              <div className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                {visibleAlerts.length} active
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {alertsLastUpdated ? timeAgo(alertsLastUpdated) : '—'} · polling every 8s</span>
            </div>
            {newAlertIds.size > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-full text-amber-700 dark:text-amber-300 font-bold animate-pulse">
                <Zap className="w-2.5 h-2.5" />
                {newAlertIds.size} new
              </span>
            )}
          </div>

          <div className="flex gap-1">
            {(['ALL', 'CRITICAL', 'WARNING'] as SeverityFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                  severityFilter === f
                    ? f === 'CRITICAL'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : f === 'WARNING'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-ocean-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'ALL' ? `All (${alerts.length})` : f === 'CRITICAL' ? `🔴 Crit (${critCount})` : `🟡 Warn (${warnCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable feed */}
        <div ref={feedRef} className="space-y-0 max-h-64 overflow-y-auto">
          {visibleAlerts.length > 0 ? (
            visibleAlerts.map((item) => {
              const isNew = newAlertIds.has(item.id);
              const isCritical = item.severity === 'CRITICAL';
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAlert?.(item)}
                  className={`relative px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 cursor-pointer group transition-all duration-200 ${
                    isCritical
                      ? 'hover:bg-rose-50/70 dark:hover:bg-rose-950/40'
                      : 'hover:bg-amber-50/70 dark:hover:bg-amber-950/40'
                  } ${isNew ? (isCritical ? 'bg-rose-50/50 dark:bg-rose-950/30' : 'bg-amber-50/40 dark:bg-amber-950/30') : 'bg-white dark:bg-slate-900/60'}`}
                >
                  {isNew && (
                    <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r ${isCritical ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse`} />
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      isCritical ? 'bg-rose-100 dark:bg-rose-950' : 'bg-amber-100 dark:bg-amber-950'
                    }`}>
                      <AlertTriangle className={`w-3 h-3 ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">{item.alert_type}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isNew && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            } animate-pulse`}>NEW</span>
                          )}
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            isCritical ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>{item.severity}</span>
                          <button
                            onClick={(e) => handleDismiss(e, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                            title="Dismiss alert"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 mb-1">{item.description}</p>

                      <div className="flex items-center justify-between text-[9px] font-medium text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {item.region_id} · {item.latitude?.toFixed(1)}°N {item.longitude?.toFixed(1)}°E
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {alertTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 mt-1 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-300 dark:text-emerald-700" />
              <p className="font-semibold">No active alerts</p>
              <p className="text-[10px]">All ocean forecast parameters within tolerance.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. QUICK INSIGHTS TREND CHARTS */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 text-slate-800 dark:text-slate-100 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Quick Insights</h3>
          <div className="flex items-center gap-1 text-[10px] font-semibold">
            {(['temp', 'current', 'reliability'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveInsightTab(tab)}
                className={`px-2 py-0.5 rounded-md transition-colors capitalize ${
                  activeInsightTab === tab ? 'bg-ocean-600 text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'temp' ? 'Temp' : tab === 'current' ? 'Currents' : 'Reliability'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-32 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {activeInsightTab === 'temp' ? (
              <AreaChart data={depthTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="depth" stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(v: any) => [`${Number(v).toFixed(1)} °C`, 'Temperature']} />
                <Area type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            ) : activeInsightTab === 'current' ? (
              <AreaChart data={depthTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="currGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="depth" stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(v: any) => [`${Number(v).toFixed(2)} m/s`, 'Speed']} />
                <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#currGrad)" />
              </AreaChart>
            ) : (
              <LineChart data={depthTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="depth" stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `${v}m`} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Reliability']} />
                <Line type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </aside>
  );
};
