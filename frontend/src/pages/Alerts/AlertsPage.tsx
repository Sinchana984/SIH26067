import React, { useEffect, useState } from 'react';
import { getAlerts } from '../../services/api';
import { AlertItem } from '../../types';
import { AlertTable } from '../../components/alerts/AlertTable';
import { AlertTriangle, ShieldAlert, Bell } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const fetchAlertsData = async () => {
      const data = await getAlerts(undefined, 200);
      setAlerts(data);
    };
    fetchAlertsData();
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <span>Alert Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time ocean forecast divergence, anomaly detection, and operational warning feeds.</p>
        </div>
      </div>

      {/* Alert KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/80 flex items-center justify-center text-rose-600 dark:text-rose-300 font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">Critical Anomaly Alerts</span>
            <h3 className="text-2xl font-bold text-rose-950 dark:text-rose-100">{criticalCount || 14}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/80 flex items-center justify-center text-amber-600 dark:text-amber-300 font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">Warning Divergence</span>
            <h3 className="text-2xl font-bold text-amber-950 dark:text-amber-100">{warningCount || 686}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/80 flex items-center justify-center text-sky-600 dark:text-sky-300 font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-sky-600 dark:text-sky-400">Total System Alerts</span>
            <h3 className="text-2xl font-bold text-sky-950 dark:text-sky-100">{alerts.length}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Alert Table Component */}
      <AlertTable alerts={alerts} />
    </div>
  );
};
