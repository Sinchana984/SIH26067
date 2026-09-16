import React, { useState } from 'react';
import { AlertItem } from '../../types';
import { AlertTriangle, Info, ShieldAlert, CheckCircle, Search, Filter } from 'lucide-react';

interface AlertTableProps {
  alerts: AlertItem[];
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const toggleAck = (alertId: string) => {
    setAcknowledged(prev => ({ ...prev, [alertId]: !prev[alertId] }));
  };

  const filtered = alerts.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase()) || item.alert_id.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || item.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const getSevBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: ShieldAlert };
      case 'WARNING':
        return { bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: AlertTriangle };
      default:
        return { bg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800', icon: Info };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts or coordinates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-ocean-500 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                severityFilter === sev
                  ? 'bg-ocean-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Alert ID</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Region</th>
              <th className="p-3">Coordinates</th>
              <th className="p-3">Description</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400 dark:text-slate-500">
                  No active ocean divergence alerts matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((alert) => {
                const badge = getSevBadge(alert.severity);
                const Icon = badge.icon;
                const isAck = acknowledged[alert.alert_id];

                return (
                  <tr key={alert.alert_id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isAck ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{alert.alert_id}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-ocean-600 dark:text-ocean-400">{alert.region_id}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{alert.latitude?.toFixed(2)}°N, {alert.longitude?.toFixed(2)}°E</td>
                    <td className="p-3 max-w-xs truncate" title={alert.description}>{alert.description}</td>
                    <td className="p-3 text-slate-400 dark:text-slate-500">{alert.timestamp}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleAck(alert.alert_id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          isAck
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isAck ? 'Acknowledged' : 'Acknowledge'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
